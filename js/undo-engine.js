// -------------------------------------------------------------
// UNIVERSAL UNDO ENGINE & LINEAR/PIPEDRIVE TOAST NOTIFICATION
// -------------------------------------------------------------

const UNDO_WINDOW_MS = 6000;
const UNDO_STACK_MAX = 10;

const UndoStack = [];
let undoWindowActive = false;
let toastTimerId = null;
let toastStartedAt = 0;
let toastRemainingMs = UNDO_WINDOW_MS;
let toastHovered = false;

function cloneUndoData(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getToastElements() {
  return {
    toast: document.getElementById("toast"),
    msg: document.getElementById("toast-message"),
    undoBtn: document.getElementById("toast-undo-btn"),
    bar: document.getElementById("toast-countdown-bar")
  };
}

function startToastCountdown(durationMs) {
  const { bar } = getToastElements();
  clearTimeout(toastTimerId);
  toastStartedAt = Date.now();
  toastRemainingMs = durationMs;

  if (bar) {
    bar.style.transition = "none";
    const pct = Math.max(0, Math.min(100, (durationMs / UNDO_WINDOW_MS) * 100));
    bar.style.width = `${pct}%`;
    // Force reflow so transition runs smoothly
    void bar.offsetWidth;
    bar.style.transition = `width ${durationMs}ms linear`;
    bar.style.width = "0%";
  }

  toastTimerId = setTimeout(() => {
    hideToast();
  }, durationMs);
}

function pauseToastCountdown() {
  if (!toastTimerId || toastHovered) return;
  toastHovered = true;
  clearTimeout(toastTimerId);
  toastTimerId = null;
  const elapsed = Date.now() - toastStartedAt;
  toastRemainingMs = Math.max(200, toastRemainingMs - elapsed);

  const { bar } = getToastElements();
  if (bar) {
    const pct = Math.max(0, Math.min(100, (toastRemainingMs / UNDO_WINDOW_MS) * 100));
    bar.style.transition = "none";
    bar.style.width = `${pct}%`;
  }
}

function resumeToastCountdown() {
  if (!toastHovered) return;
  toastHovered = false;
  const { toast } = getToastElements();
  if (!toast || toast.classList.contains("opacity-0")) return;
  startToastCountdown(toastRemainingMs);
}

function hideToast() {
  const { toast, undoBtn, bar } = getToastElements();
  clearTimeout(toastTimerId);
  toastTimerId = null;
  toastHovered = false;
  undoWindowActive = false;
  if (toast) {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0", "pointer-events-none");
  }
  if (undoBtn) undoBtn.classList.add("hidden");
  if (bar) {
    bar.style.transition = "none";
    bar.style.width = "0%";
  }
}

// Ghi đè showToast toàn cục để hỗ trợ cả thông báo thường lẫn thông báo có [Hoàn tác ↩]
function showToast(message, isError = false, enableUndo = false) {
  const { toast, msg, undoBtn } = getToastElements();
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.style.borderColor = isError ? "#991B1B" : "#323A46";

  if (undoBtn) {
    if (enableUndo && UndoStack.length > 0) {
      undoBtn.classList.remove("hidden");
      undoWindowActive = true;
    } else {
      undoBtn.classList.add("hidden");
      undoWindowActive = false;
    }
  }

  toast.classList.remove("opacity-0", "pointer-events-none");
  toast.classList.add("opacity-100");
  toastHovered = false;
  startToastCountdown(UNDO_WINDOW_MS);
}

// Đẩy Action Snapshot vào UndoStack (LIFO, tối đa 10)
function pushUndoAction({ module, action_type, entity_id, display_label, context_label, before, after, toastMessage }) {
  const snapshot = {
    action_id: `ACT_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${Date.now().toString().slice(-5)}`,
    module,
    action_type,
    entity_id,
    display_label: display_label || "",
    context_label: context_label || "",
    created_at: new Date().toISOString(),
    snapshot: {
      before: cloneUndoData(before),
      after: cloneUndoData(after)
    }
  };

  UndoStack.push(snapshot);
  if (UndoStack.length > UNDO_STACK_MAX) {
    UndoStack.shift();
  }

  if (toastMessage) {
    showToast(toastMessage, false, true);
  }
  return snapshot;
}

// Kích hoạt Hoàn Tác (Ctrl+Z / Cmd+Z hoặc bấm nút [Hoàn tác ↩])
function performGlobalUndo() {
  if (!undoWindowActive || UndoStack.length === 0) return false;

  const lastAction = UndoStack.pop();
  if (!lastAction) return false;

  const { module, snapshot } = lastAction;
  const before = snapshot.before;

  if (module === "DEPLOYMENT_STEP") {
    const ob = onboardingList.find(o => o.id === before.obId);
    if (ob) {
      ob.tasks = cloneUndoData(before.tasks);
      ob.project_start_date = before.project_start_date || null;
      ob.current_stage = before.current_stage || "LEGAL_AND_CMS";
      ob.progress_rate = before.progress_rate || 0;
      ob.completed_steps = before.completed_steps || 0;
      if (typeof computeAttioProjectRollup === "function") computeAttioProjectRollup(ob);
      if (typeof saveOnboardingStorage === "function") saveOnboardingStorage();
      if (typeof renderOnboardingView === "function") renderOnboardingView();
      if (typeof updateAllKpis === "function") updateAllKpis();
      if (typeof renderDashboardOnboardingSummary === "function") renderDashboardOnboardingSummary();
    }
  } else if (module === "TODO") {
    state.tasks = cloneUndoData(before.tasks);
    if (typeof syncAllAfterTaskChange === "function") {
      syncAllAfterTaskChange(null);
    } else {
      if (typeof saveStateStorage === "function") saveStateStorage();
      if (typeof updateAllKpis === "function") updateAllKpis();
      if (typeof renderTasksMainView === "function") renderTasksMainView();
      if (typeof renderDashboardQuickTasks === "function") renderDashboardQuickTasks();
    }
  } else if (module === "CALENDAR") {
    state.meetings = cloneUndoData(before.meetings);
    if (typeof saveStateStorage === "function") saveStateStorage();
    if (typeof renderDashboardMeetings === "function") renderDashboardMeetings();
    if (typeof renderCalendarView === "function") renderCalendarView();
    if (typeof updateNotificationDot === "function") updateNotificationDot();
  } else if (module === "BLOCKER") {
    state.projects = cloneUndoData(before.projects);
    if (typeof saveStateStorage === "function") saveStateStorage();
    if (typeof updateAllKpis === "function") updateAllKpis();
    if (typeof renderDashboardBlockers === "function") renderDashboardBlockers();
    if (typeof renderMerchantWorkspaceBody === "function") renderMerchantWorkspaceBody();
    if (typeof updateNotificationDot === "function") updateNotificationDot();
  }

  if (typeof addNotificationLog === "function") {
    addNotificationLog(`↩ Đã hoàn tác: ${lastAction.display_label || lastAction.module}`);
  }
  showToast("Đã hoàn tác thao tác vừa thực hiện.", false, false);
  return true;
}

// Bộ lắng nghe phím tắt toàn cục Ctrl+Z / Cmd+Z (với Input Shielding)
function handleGlobalUndoKeyDown(event) {
  const isUndoCombo = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z";
  if (!isUndoCombo) return;

  const activeEl = document.activeElement;
  if (activeEl) {
    const tag = activeEl.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || activeEl.isContentEditable) {
      return; // Input Shielding: nhường Ctrl+Z cho trình duyệt hoàn tác chữ đang gõ
    }
  }

  if (undoWindowActive && UndoStack.length > 0) {
    event.preventDefault();
    performGlobalUndo();
  }
}

window.addEventListener("keydown", handleGlobalUndoKeyDown);

window.addEventListener("DOMContentLoaded", () => {
  const { toast } = getToastElements();
  if (toast) {
    toast.addEventListener("mouseenter", pauseToastCountdown);
    toast.addEventListener("mouseleave", resumeToastCountdown);
  }
});

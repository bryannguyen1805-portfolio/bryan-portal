// -------------------------------------------------------------
// 11. TOAST & NOTIFICATIONS
// -------------------------------------------------------------
function showToast(message) {
  const toast = document.getElementById("toast");
  const msg = document.getElementById("toast-message");
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.remove("opacity-0", "pointer-events-none");
  toast.classList.add("opacity-100");

  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0", "pointer-events-none");
  }, 3500);
}

// -------------------------------------------------------------
// 11B. TRUNG TÂM CẢNH BÁO, NHẮC HẸN & QUY TẮC TỰ ĐỘNG HÓA
// -------------------------------------------------------------
const NOTIF_LOG_KEY = "bryan_portal_notif_logs_v1";
const AUTOMATION_KEY = "bryan_portal_automation_v1";
let activeAlertFilter = "ALL";

let automationSettings = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTOMATION_KEY) || "null");
    if (saved && typeof saved === "object") return { autoZaloBlocker: true, autoOverdueAlert: true, autoMeetingReminder: true, ...saved };
  } catch (e) {}
  return { autoZaloBlocker: true, autoOverdueAlert: true, autoMeetingReminder: true };
})();

let notificationLogs = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTIF_LOG_KEY) || "null");
    if (Array.isArray(saved)) return saved;
  } catch (e) {}
  return [];
})();

function saveAutomationSettings() {
  localStorage.setItem(AUTOMATION_KEY, JSON.stringify(automationSettings));
}

function syncAutomationCheckboxes() {
  const c1 = document.getElementById("auto-rule-zalo-blocker");
  const c2 = document.getElementById("auto-rule-overdue-alert");
  const c3 = document.getElementById("auto-rule-meeting-reminder");
  if (c1) c1.checked = !!automationSettings.autoZaloBlocker;
  if (c2) c2.checked = !!automationSettings.autoOverdueAlert;
  if (c3) c3.checked = !!automationSettings.autoMeetingReminder;
}

function toggleAutomationRule(key, enabled) {
  automationSettings[key] = !!enabled;
  saveAutomationSettings();
  updateNotificationDot();
  renderNotificationsView();
  showToast(enabled ? "✓ Đã bật quy tắc tự động hóa" : "Đã tắt quy tắc tự động hóa");
}

const CUSTOM_RULES_KEY = "bryan_portal_custom_rules_v1";
let customAutomationRules = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_RULES_KEY) || "null");
    if (Array.isArray(saved)) return saved;
  } catch (e) {}
  return [
    {
      id: "rule-demo-1",
      name: "Gắn vướng mắc → Tự tạo việc gỡ nghẽn (+1 ngày)",
      trigger: "PROJECT_BLOCKED",
      keyword: "",
      action: "CREATE_FOLLOWUP_TASK",
      payload: "Đôn đốc gỡ vướng mắc dự án",
      enabled: true,
      runCount: 0,
      lastRun: ""
    }
  ];
})();

function saveCustomAutomationRules() {
  localStorage.setItem(CUSTOM_RULES_KEY, JSON.stringify(customAutomationRules));
}

function createCustomAutomationRule(e) {
  e.preventDefault();
  const name = document.getElementById("auto-new-name").value.trim();
  const trigger = document.getElementById("auto-new-trigger").value;
  const keyword = document.getElementById("auto-new-keyword").value.trim();
  const action = document.getElementById("auto-new-action").value;
  const payload = document.getElementById("auto-new-payload").value.trim();
  if (!name) return;

  customAutomationRules.unshift({
    id: "rule-" + Date.now().toString().slice(-5),
    name,
    trigger,
    keyword,
    action,
    payload,
    enabled: true,
    runCount: 0,
    lastRun: ""
  });
  saveCustomAutomationRules();
  document.getElementById("auto-new-name").value = "";
  document.getElementById("auto-new-keyword").value = "";
  document.getElementById("auto-new-payload").value = "";
  renderCustomAutomationRules();
  showToast(`✓ Đã tạo quy tắc "${name}"`);
}

function addPresetAutomationRule(presetKey) {
  const presets = {
    BLOCKER_TASK: {
      name: "Gắn vướng mắc → Tạo đầu việc gỡ nghẽn (+1 ngày)",
      trigger: "PROJECT_BLOCKED",
      keyword: "",
      action: "CREATE_FOLLOWUP_TASK",
      payload: "Xử lý vướng mắc tiến độ"
    },
    HIGHLANDS_URGENT: {
      name: "Việc có từ 'Highlands' → Nâng mức Khẩn cấp",
      trigger: "TASK_CREATED",
      keyword: "Highlands",
      action: "SET_PRIORITY_URGENT",
      payload: ""
    },
    DONE_MEETING: {
      name: "Hoàn tất việc → Thêm lịch rà soát (+1 ngày)",
      trigger: "TASK_DONE",
      keyword: "",
      action: "CREATE_MEETING",
      payload: "Rà soát kết quả sau khi hoàn tất"
    }
  };
  const p = presets[presetKey];
  if (!p) return;
  customAutomationRules.unshift({
    id: "rule-" + Date.now().toString().slice(-5),
    ...p,
    enabled: true,
    runCount: 0,
    lastRun: ""
  });
  saveCustomAutomationRules();
  renderCustomAutomationRules();
  showToast(`✓ Đã thêm quy tắc mẫu "${p.name}"`);
}

function toggleCustomAutomationRule(ruleId) {
  const rule = customAutomationRules.find(r => r.id === ruleId);
  if (!rule) return;
  rule.enabled = !rule.enabled;
  saveCustomAutomationRules();
  renderCustomAutomationRules();
  showToast(rule.enabled ? `✓ Đã bật "${rule.name}"` : `Đã tạm tắt "${rule.name}"`);
}

function deleteCustomAutomationRule(ruleId) {
  customAutomationRules = customAutomationRules.filter(r => r.id !== ruleId);
  saveCustomAutomationRules();
  renderCustomAutomationRules();
  showToast("✓ Đã xóa quy tắc tự động hóa");
}

function testCustomAutomationRule(ruleId) {
  const rule = customAutomationRules.find(r => r.id === ruleId);
  if (!rule) return;
  const sampleCtx = {
    title: rule.keyword ? `Kiểm tra ${rule.keyword}` : "Đầu việc thử nghiệm quy tắc",
    project_id: state.projects[0]?.id || "p-1",
    pic: "Bryan"
  };
  executeSingleAutomationRule(rule, sampleCtx, true);
  showToast(`⚡ Đã chạy thử quy tắc "${rule.name}"`);
}

function executeSingleAutomationRule(rule, ctx, isManualTest = false) {
  const textToMatch = `${ctx.title || ''} ${ctx.reason || ''} ${ctx.merchantName || ''}`.toLowerCase();
  if (!isManualTest && rule.keyword && !textToMatch.includes(rule.keyword.toLowerCase())) {
    return false;
  }

  const d = new Date(getTodayIsoDate() + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const tomorrowStr = d.toISOString().slice(0, 10);

  if (rule.action === "SET_PRIORITY_URGENT" && ctx.taskObj) {
    ctx.taskObj.priority = "KHẨN CẤP";
  } else if (rule.action === "CREATE_FOLLOWUP_TASK") {
    const prefix = rule.payload || "Theo dõi tiếp";
    const newTask = {
      id: "t-auto-" + Date.now().toString().slice(-4),
      type: "COMMERCIAL",
      project_id: ctx.project_id || state.projects[0]?.id || "",
      title: `${prefix}: ${ctx.title || ctx.reason || 'Công việc mới'}`,
      pic: ctx.pic || "Bryan",
      stage: "STAGE_TODO",
      priority: "CAO",
      due_date: tomorrowStr,
      is_overdue: false
    };
    state.tasks.unshift(newTask);
    saveStateStorage();
    updateAllKpis();
    renderTasksMainView();
    renderDashboardQuickTasks();
  } else if (rule.action === "CREATE_MEETING") {
    const mtTitle = rule.payload ? `${rule.payload} (${ctx.title || 'Auto'})` : `Rà soát: ${ctx.title || 'Công việc'}`;
    state.meetings.push({
      id: "mt-auto-" + Date.now().toString().slice(-4),
      date: tomorrowStr,
      time: "10:00",
      title: mtTitle,
      partner: ctx.merchantName || "Nội bộ",
      attendees: ctx.pic || "Bryan"
    });
    saveStateStorage();
    renderDashboardMeetings();
    if (typeof renderCalendarView === "function") renderCalendarView();
  } else if (rule.action === "COMPLETE_AND_GRADUATE") {
    if (typeof executeAutoGoLiveByName === "function") executeAutoGoLiveByName(ctx.title || "");
  } else if (rule.action === "LOG_AND_TOAST") {
    showToast(`⚡ ${rule.payload || rule.name}`);
  }

  rule.runCount = (rule.runCount || 0) + 1;
  rule.lastRun = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  saveCustomAutomationRules();
  addNotificationLog(`⚡ Tự động chạy "${rule.name}" cho "${ctx.title || ctx.reason || 'sự kiện'}"`);
  renderCustomAutomationRules();
  return true;
}

function runAutomationRules(triggerType, ctx = {}) {
  customAutomationRules
    .filter(r => r.enabled && r.trigger === triggerType)
    .forEach(r => executeSingleAutomationRule(r, ctx, false));
}

function renderCustomAutomationRules() {
  const list = document.getElementById("custom-automation-rules-list");
  const countEl = document.getElementById("custom-rules-count");
  if (countEl) countEl.textContent = customAutomationRules.length;
  if (!list) return;

  const triggerLabels = {
    COMMAND: "Khi gõ lệnh",
    TASK_CREATED: "Khi tạo đầu việc mới",
    TASK_DONE: "Khi hoàn tất đầu việc",
    PROJECT_BLOCKED: "Khi dự án gắn vướng mắc",
    MEETING_CREATED: "Khi thêm lịch họp mới"
  };
  const actionLabels = {
    COMPLETE_AND_GRADUATE: "Xong 18 bước & Chuyển sang Chuỗi",
    SET_PRIORITY_URGENT: "Nâng mức Khẩn cấp",
    CREATE_FOLLOWUP_TASK: "Tạo đầu việc nối tiếp",
    CREATE_MEETING: "Thêm lịch họp (+1 ngày)",
    LOG_AND_TOAST: "Ghi nhật ký & Nhắc nổi"
  };

  if (customAutomationRules.length === 0) {
    list.innerHTML = `<div class="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">Chưa có quy tắc nào. Hãy chọn mẫu nhanh hoặc tự tạo ở khung trên!</div>`;
    return;
  }

  list.innerHTML = customAutomationRules.map(r => `
    <div class="p-4 rounded-2xl border ${r.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'} flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition">
      <div class="space-y-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="w-2 h-2 rounded-full ${r.enabled ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
          <span class="text-xs font-bold text-slate-900">${r.name}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Đã chạy ${r.runCount || 0} lần${r.lastRun ? ' • ' + r.lastRun : ''}</span>
        </div>
        <div class="text-[11px] text-slate-500 flex items-center flex-wrap gap-1.5">
          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold">${triggerLabels[r.trigger] || r.trigger}</span>
          ${r.keyword ? `<span>→ Chứa "<b class="text-slate-700">${r.keyword}</b>"</span>` : ''}
          <span>→</span>
          <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold">${actionLabels[r.action] || r.action}</span>
          ${r.payload ? `<span class="text-slate-400">(${r.payload})</span>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0 text-xs">
        <button onclick="testCustomAutomationRule('${r.id}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition">Chạy thử</button>
        <button onclick="toggleCustomAutomationRule('${r.id}')" class="px-2.5 py-1.5 ${r.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'} rounded-xl font-bold transition">${r.enabled ? 'Đang bật' : 'Đang tắt'}</button>
        <button onclick="deleteCustomAutomationRule('${r.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition" title="Xóa quy tắc">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function saveNotificationLogs() {
  localStorage.setItem(NOTIF_LOG_KEY, JSON.stringify(notificationLogs.slice(0, 50)));
}

function addNotificationLog(text) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • ' + now.toLocaleDateString('vi-VN');
  notificationLogs.unshift({ id: 'log-' + Date.now(), text, time: timeStr });
  if (notificationLogs.length > 50) notificationLogs = notificationLogs.slice(0, 50);
  saveNotificationLogs();
  renderNotificationLogs();
}

function clearNotificationLogs() {
  notificationLogs = [];
  saveNotificationLogs();
  renderNotificationLogs();
  showToast("✓ Đã xóa nhật ký hoạt động");
}

function renderNotificationLogs() {
  const list = document.getElementById("notifications-log-list");
  if (!list) return;
  if (notificationLogs.length === 0) {
    list.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">Chưa có nhật ký hoạt động nào.</div>`;
    return;
  }
  list.innerHTML = notificationLogs.map(item => `
    <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center space-x-2.5 min-w-0">
        <span class="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
        <span class="font-semibold text-slate-800 truncate">${item.text}</span>
      </div>
      <span class="text-slate-400 text-[10px] font-mono whitespace-nowrap shrink-0">${item.time}</span>
    </div>
  `).join('');
}

function getActiveAlerts() {
  const alerts = [];
  const todayStr = getTodayIsoDate();
  const tomorrowDate = new Date(todayStr + 'T00:00:00');
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

  // 1. Dự án đang có vướng mắc
  state.projects.filter(p => p.is_blocked).forEach(p => {
    const m = state.merchants.find(item => item.id === p.merchant_id);
    alerts.push({
      id: `blk-${p.id}`,
      category: 'URGENT',
      kind: 'BLOCKER',
      title: `${m ? m.name : 'Dự án'} • ${p.title}`,
      detail: p.blocker_reason || 'Dự án đang bị vướng mắc tiến độ cần xử lý gấp',
      pic: p.pic || 'Phụ trách dự án',
      merchantId: m ? m.id : null,
      projectId: p.id,
      zaloText: `[Nhắc tiến độ - ${m ? m.name : 'Dự án'}] Chào ${p.pic || 'anh/chị'}, dự án "${p.title}" hiện đang vướng: "${p.blocker_reason || 'cần hỗ trợ xử lý'}". Nhờ team ưu tiên kiểm tra giúp Bryan nhé!`
    });
  });

  // 2. Đầu việc quá hạn & sắp đến hạn (trong 48h)
  if (automationSettings.autoOverdueAlert) {
    state.tasks.filter(t => t.stage !== 'STAGE_DONE' && t.due_date).forEach(t => {
      const overdueDays = getTaskOverdueDays(t);
      const proj = state.projects.find(p => p.id === t.project_id);
      const m = proj ? state.merchants.find(item => item.id === proj.merchant_id) : null;
      const mName = m ? m.name : 'Nội bộ Bryan';

      if (overdueDays > 0) {
        alerts.push({
          id: `tsk-over-${t.id}`,
          category: 'URGENT',
          kind: 'TASK_OVERDUE',
          title: t.title,
          detail: `${mName} • Trễ hạn ${overdueDays} ngày (Hạn: ${t.due_date})`,
          pic: t.pic || 'Bryan',
          taskId: t.id,
          merchantId: m ? m.id : null,
          zaloText: `[Nhắc đầu việc quá hạn] Chào ${t.pic || 'bạn'}, đầu việc "${t.title}" (${mName}) đã trễ ${overdueDays} ngày so với hạn ${t.due_date}. Nhờ cập nhật tiến độ giúp Bryan nhé!`
        });
      } else {
        const diffDays = Math.round((new Date(t.due_date + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / 86400000);
        if (diffDays >= 0 && diffDays <= 2) {
          const dueLabel = diffDays === 0 ? 'Hạn hôm nay' : (diffDays === 1 ? 'Hạn ngày mai' : 'Còn 2 ngày tới hạn');
          alerts.push({
            id: `tsk-due-${t.id}`,
            category: 'UPCOMING',
            kind: 'TASK_DUE',
            title: t.title,
            detail: `${mName} • ${dueLabel} (${t.due_date})`,
            pic: t.pic || 'Bryan',
            taskId: t.id,
            merchantId: m ? m.id : null,
            zaloText: `[Nhắc hạn chót] Chào ${t.pic || 'bạn'}, đầu việc "${t.title}" (${mName}) ${dueLabel.toLowerCase()} (${t.due_date}). Nhờ kiểm tra hoàn tất đúng hẹn nhé!`
          });
        }
      }
    });
  }

  // 3. Lịch họp hôm nay & ngày mai
  if (automationSettings.autoMeetingReminder && Array.isArray(state.meetings)) {
    state.meetings.filter(mt => mt.date === todayStr || mt.date === tomorrowStr).forEach(mt => {
      const isToday = mt.date === todayStr;
      alerts.push({
        id: `meet-${mt.id}`,
        category: 'UPCOMING',
        kind: 'MEETING',
        title: `${mt.time || ''} • ${mt.title}`,
        detail: `${isToday ? 'Họp hôm nay' : 'Họp ngày mai'} (${mt.date}) • ${mt.merchant || 'Nội bộ'} • ${mt.participants || ''}`,
        pic: mt.participants || 'Bryan',
        zaloText: `[Nhắc lịch họp] Mời anh/chị tham gia cuộc họp "${mt.title}" vào lúc ${mt.time || ''} ngày ${mt.date}.`
      });
    });
  }

  // 4. Nhắc gia hạn hợp đồng đối tác trước 30 ngày
  state.merchants.filter(m => m.contract_expiry_date).forEach(m => {
    const diffDays = Math.round((new Date(m.contract_expiry_date + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / 86400000);
    if (diffDays <= 30) {
      const stk = state.stakeholders.find(s => s.merchant_id === m.id);
      const picName = stk ? stk.name : 'Phụ trách chuỗi';
      const statusMsg = diffDays < 0
        ? `Hợp đồng đã hết hạn ${Math.abs(diffDays)} ngày (${m.contract_expiry_date}) — Cần gia hạn ngay`
        : (diffDays === 0
          ? `Hợp đồng hết hạn hôm nay (${m.contract_expiry_date}) — Cần làm thủ tục gia hạn`
          : `Hợp đồng còn ${diffDays} ngày hết hạn (${m.contract_expiry_date}) — Nhắc gia hạn trước 30 ngày`);
      alerts.push({
        id: `renew-${m.id}`,
        category: diffDays <= 7 ? 'URGENT' : 'UPCOMING',
        kind: 'CONTRACT_RENEWAL',
        title: `Gia hạn hợp đồng • ${m.name}`,
        detail: statusMsg,
        pic: picName,
        merchantId: m.id,
        zaloText: `[Gia hạn hợp đồng - ${m.name}] Chào ${picName}, hợp đồng hợp tác Payoo của ${m.name} sẽ hết hạn vào ngày ${m.contract_expiry_date}. Nhờ team phối hợp rà soát & gia hạn hợp đồng mới giúp Bryan nhé!`
      });
    }
  });

  return alerts;
}

function filterAlertsView(filter) {
  activeAlertFilter = filter;
  const activeCls = {
    ALL: "px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white shadow-xs transition",
    URGENT: "px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 text-white shadow-xs transition",
    UPCOMING: "px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 text-white shadow-xs transition"
  };
  ['ALL', 'URGENT', 'UPCOMING'].forEach(f => {
    const btn = document.getElementById(`alert-filter-${f}`);
    if (!btn) return;
    btn.className = f === filter
      ? activeCls[f]
      : "px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition";
  });
  renderNotificationsView();
}

function copyAlertZalo(encodedMsg, title, merchantId = "", picName = "") {
  const msg = decodeURIComponent(encodedMsg);
  if (navigator.clipboard) navigator.clipboard.writeText(msg).catch(() => {});

  const picLower = (picName || "").toLowerCase();
  const matchedStakeholder =
    state.stakeholders.find(s => s.phone && picLower && (picLower.includes((s.name || "").toLowerCase()) || (s.name || "").toLowerCase().includes(picLower))) ||
    (merchantId ? state.stakeholders.find(s => s.merchant_id === merchantId && s.phone) : null);

  const phone = matchedStakeholder ? matchedStakeholder.phone.replace(/[^0-9]/g, "") : "";
  const zaloUrl = phone ? `https://zalo.me/${phone}` : "https://zalo.me";
  window.open(zaloUrl, "_blank", "noopener");

  addNotificationLog(`Đã sao chép tin nhắn & mở Zalo nhắc "${title}"${phone ? ' (' + phone + ')' : ''}`);
  showToast(phone ? `Đã sao chép tin nhắn & mở Zalo (${phone})!` : "Đã sao chép tin nhắn & mở Zalo!");
}

function resolveProjectBlockerFromAlert(projectId) {
  const p = state.projects.find(item => item.id === projectId);
  if (!p) return;
  const beforeProjects = JSON.parse(JSON.stringify(state.projects));
  p.is_blocked = false;
  p.blocker_reason = "";
  saveStateStorage();
  updateAllKpis();
  renderDashboardBlockers();
  renderMerchantWorkspaceBody();
  updateNotificationDot();
  renderNotificationsView();
  addNotificationLog(`Đã gỡ vướng mắc cho dự án "${p.title}"`);
  if (typeof pushUndoAction === "function") {
    pushUndoAction({
      module: "BLOCKER",
      action_type: "UPDATE",
      entity_id: p.id,
      display_label: p.title,
      before: { projects: beforeProjects },
      after: { projects: state.projects },
      toastMessage: `Đã đóng vướng mắc kỹ thuật của "${p.title}".`
    });
  } else {
    showToast(`Đã đóng vướng mắc kỹ thuật của "${p.title}".`);
  }
}

function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) {
    showToast("Trình duyệt hiện tại không hỗ trợ thông báo trên laptop.");
    return;
  }
  Notification.requestPermission().then(perm => {
    if (perm === "granted") {
      runDesktopNotificationCheck(true);
      showToast("Đã bật thông báo Pop-up trên Laptop!");
    } else {
      showToast("Bạn đã từ chối quyền thông báo trên trình duyệt.", true);
    }
  });
}

function toggleTopbarNotifPopover() {
  if (typeof closeAppLauncherPopover === "function") closeAppLauncherPopover();
  const pop = document.getElementById("topbar-notif-popover");
  if (!pop) return;
  const isHidden = pop.classList.contains("hidden");
  if (isHidden) {
    renderTopbarNotifPopover();
    pop.classList.remove("hidden");
  } else {
    pop.classList.add("hidden");
  }
}

function closeTopbarNotifPopover() {
  document.getElementById("topbar-notif-popover")?.classList.add("hidden");
}

function renderTopbarNotifPopover() {
  const list = document.getElementById("topbar-notif-list");
  if (!list) return;
  const alerts = getActiveAlerts();
  if (alerts.length === 0) {
    list.innerHTML = `<div class="py-6 text-center text-slate-400">Không có lịch họp hay đầu việc nào sắp đến hạn.</div>`;
    return;
  }
  list.innerHTML = alerts.slice(0, 6).map(a => {
    const isUrgent = a.category === 'URGENT';
    const badge = a.kind === 'BLOCKER' ? 'VƯỚNG MẮC' : (a.kind === 'TASK_OVERDUE' ? 'QUÁ HẠN' : (a.kind === 'MEETING' ? 'LỊCH HỌP' : (a.kind === 'CONTRACT_RENEWAL' ? 'GIA HẠN HĐ' : 'SẮP HẠN')));
    return `
      <div class="p-2.5 rounded-xl border ${isUrgent ? 'border-rose-200 bg-rose-50/40' : 'border-amber-200 bg-amber-50/40'} space-y-1">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded ${isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">${badge}</span>
          ${a.taskId ? `<button onclick="toggleTaskQuickDone('${a.taskId}')" class="text-[10px] font-bold text-emerald-700 hover:underline">✓ Hoàn tất</button>` : ''}
        </div>
        <div class="font-bold text-slate-800 truncate">${a.title}</div>
        <div class="text-[11px] text-slate-500 truncate">${a.detail}</div>
      </div>
    `;
  }).join('') + (alerts.length > 6 ? `<div class="text-center text-[11px] text-slate-400 pt-1">Và ${alerts.length - 6} nhắc hẹn khác...</div>` : '');
}

const BRYAN_ALERT_RECIPIENTS = "quantritc1805@gmail.com,tri.nguyen2@vietunion.com.vn";

function sendAlertsDigestEmail() {
  const alerts = getActiveAlerts();
  const today = new Date().toLocaleDateString('vi-VN');
  const lines = [
    `Xin chào Bryan,`,
    `Dưới đây là tổng hợp ${alerts.length} lịch họp, đầu việc sắp đến hạn và cảnh báo ngày ${today}:`,
    ``
  ];
  if (alerts.length === 0) {
    lines.push("- Hiện tại mọi đầu việc và hợp đồng đều đúng tiến độ.");
  } else {
    alerts.forEach((a, i) => {
      lines.push(`${i + 1}. [${a.kind}] ${a.title} — ${a.detail}`);
    });
  }
  const subject = `[Bryan Portal] Nhắc lịch họp & Đầu việc cần xử lý (${today})`;
  const body = lines.join("\n");
  if (navigator.clipboard) navigator.clipboard.writeText(`${subject}\n\n${body}`).catch(() => {});
  window.location.href = `mailto:${BRYAN_ALERT_RECIPIENTS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  addNotificationLog(`Đã tạo Email nhắc việc gửi tới ${BRYAN_ALERT_RECIPIENTS} (${alerts.length} mục)`);
  showToast(`Đã soạn Email gửi ${BRYAN_ALERT_RECIPIENTS}!`);
}

function runDesktopNotificationCheck(forceShowSummary = false) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const alerts = getActiveAlerts();
  const todayKey = "bryan_portal_popped_" + getTodayIsoDate();
  let poppedIds = [];
  try {
    poppedIds = JSON.parse(localStorage.getItem(todayKey) || "[]");
  } catch (e) {}

  if (forceShowSummary) {
    new Notification("Bryan Portal — Thông Báo Đã Bật", {
      body: alerts.length > 0
        ? `Hiện có ${alerts.length} lịch họp / đầu việc sắp đến hạn cần chú ý.`
        : "Hệ thống đang theo dõi lịch họp & hạn chót cho bạn."
    });
    return;
  }

  const newAlerts = alerts.filter(a => !poppedIds.includes(a.id));
  if (newAlerts.length > 0) {
    const first = newAlerts[0];
    new Notification(`Bryan Portal: ${first.title}`, {
      body: newAlerts.length > 1
        ? `${first.detail} (+${newAlerts.length - 1} nhắc hẹn khác)`
        : first.detail
    });
    poppedIds.push(...newAlerts.map(a => a.id));
    localStorage.setItem(todayKey, JSON.stringify(Array.from(new Set(poppedIds))));
  }
}

document.addEventListener("click", (e) => {
  const pop = document.getElementById("topbar-notif-popover");
  const btn = document.getElementById("topbar-bell-btn");
  if (pop && !pop.classList.contains("hidden") && !pop.contains(e.target) && (!btn || !btn.contains(e.target))) {
    pop.classList.add("hidden");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => runDesktopNotificationCheck(false), 1500);
  setInterval(() => runDesktopNotificationCheck(false), 60000);
});

function renderNotificationsView() {
  const container = document.getElementById("active-alerts-container");
  if (!container) return;

  const allAlerts = getActiveAlerts();
  const urgentCount = allAlerts.filter(a => a.category === 'URGENT').length;
  const upcomingCount = allAlerts.filter(a => a.category === 'UPCOMING').length;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt("alert-count-ALL", allAlerts.length);
  setTxt("alert-count-URGENT", urgentCount);
  setTxt("alert-count-UPCOMING", upcomingCount);

  const visible = allAlerts.filter(a => activeAlertFilter === 'ALL' || a.category === activeAlertFilter);

  if (visible.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center bg-emerald-50/40 rounded-2xl border border-emerald-200">
        <i data-lucide="shield-check" class="w-8 h-8 text-emerald-600 mx-auto mb-2"></i>
        <p class="text-sm font-bold text-emerald-900">Không có cảnh báo hay nhắc hẹn nào đang chờ xử lý!</p>
        <p class="text-xs text-emerald-700 mt-1">Mọi đầu việc và dự án chuỗi đều đang đúng tiến độ.</p>
      </div>
    `;
  } else {
    container.innerHTML = visible.map(a => {
      const isUrgent = a.category === 'URGENT';
      const badge = a.kind === 'BLOCKER' ? 'VƯỚNG MẮC DỰ ÁN' : (a.kind === 'TASK_OVERDUE' ? 'QUÁ HẠN' : (a.kind === 'MEETING' ? 'LỊCH HỌP' : (a.kind === 'CONTRACT_RENEWAL' ? 'GIA HẠN HỢP ĐỒNG' : 'SẮP TỚI HẠN')));
      return `
        <div class="p-4 rounded-2xl border ${isUrgent ? 'border-rose-200 bg-rose-50/30' : 'border-amber-200 bg-amber-50/30'} flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">${badge}</span>
              <span class="text-xs font-bold text-slate-900">${a.title}</span>
            </div>
            <p class="text-xs text-slate-600">${a.detail}</p>
            <p class="text-[11px] text-slate-500">Phụ trách: <span class="font-semibold text-slate-700">${a.pic}</span></p>
          </div>
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            ${(a.kind !== 'BLOCKER' || automationSettings.autoZaloBlocker) ? `
              <button onclick="copyAlertZalo('${encodeURIComponent(a.zaloText)}', '${a.title.replace(/'/g, "\\'")}', '${a.merchantId || ''}', '${(a.pic || '').replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Nhắc Zalo</span>
              </button>
            ` : ''}
            ${a.taskId ? `
              <button onclick="toggleTaskQuickDone('${a.taskId}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                <span>Hoàn tất</span>
              </button>
            ` : ''}
            ${a.projectId ? `
              <button onclick="resolveProjectBlockerFromAlert('${a.projectId}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition">Gỡ vướng mắc</button>
            ` : ''}
            ${a.merchantId ? `
              <button onclick="openMerchantWorkspace('${a.merchantId}')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition">Mở dự án</button>
            ` : (a.kind === 'MEETING' ? `
              <button onclick="navigateTo('CALENDAR')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition">Mở lịch</button>
            ` : '')}
          </div>
        </div>
      `;
    }).join('');
  }
  renderNotificationLogs();
  lucide.createIcons();
}

// -------------------------------------------------------------
// 11C. CÁ NHÂN HÓA NHẮC HẸN & ENGINE CHẠY ĐÚNG MỐC THỜI GIAN
// -------------------------------------------------------------
const REMINDER_LABELS = {
  "none": "Không có",
  "0": "Vào lúc diễn ra / đến hạn",
  "5": "Trước 5 phút",
  "10": "Trước 10 phút",
  "15": "Trước 15 phút",
  "30": "Trước 30 phút",
  "60": "Trước 1 giờ",
  "120": "Trước 2 giờ",
  "1440": "Trước 1 ngày",
  "2880": "Trước 2 ngày",
  "10080": "Trước 1 tuần",
  "43200": "Trước 30 ngày"
};

function getUserNotifPrefsKey() {
  const email = (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "default") || "default";
  return `bryan_portal_notif_prefs_${email}`;
}

function getUserFiredRemindersKey() {
  const email = (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "default") || "default";
  return `bryan_portal_fired_reminders_${email}`;
}

function getUserNotifPrefs() {
  const userEmail = (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "") || "";
  const defaults = {
    email: userEmail,
    channels: { bell: true, popup: true, email: true },
    defaultMeetingReminder: "15",
    defaultTaskReminder: "1440",
    defaultContractReminder: "43200"
  };
  try {
    const saved = JSON.parse(localStorage.getItem(getUserNotifPrefsKey()) || "null");
    if (saved && typeof saved === "object") {
      return {
        ...defaults,
        ...saved,
        channels: { ...defaults.channels, ...(saved.channels || {}) }
      };
    }
  } catch (e) {}
  return defaults;
}

function saveUserNotifPrefs(prefs) {
  localStorage.setItem(getUserNotifPrefsKey(), JSON.stringify(prefs));
}

function ensureNotifPrefsModal() {
  if (document.getElementById("modal-notif-prefs")) return;
  const div = document.createElement("div");
  div.id = "modal-notif-prefs";
  div.className = "hidden fixed inset-0 z-[10001] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
  const optsHtml = Object.entries(REMINDER_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
  div.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="text-sm font-black">Cá Nhân Hóa Nhắc Hẹn &amp; Kênh Thông Báo</h3>
        <button onclick="document.getElementById('modal-notif-prefs').classList.add('hidden')" class="text-slate-300 hover:text-white text-sm">✕</button>
      </div>
      <form onsubmit="saveNotifPrefsFromModal(event)" class="p-5 space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Email nhận nhắc hẹn của bạn *</label>
          <input id="prefs-email-input" type="text" required placeholder="VD: ten.ban@vietunion.com.vn" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium" />
          <p class="text-[11px] text-slate-400 mt-1">Có thể nhập nhiều email cách nhau bằng dấu phẩy.</p>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="font-bold text-slate-700">Kênh nhận thông báo mặc định của bạn</div>
          <div class="flex flex-wrap gap-3 font-semibold text-slate-700">
            <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" id="prefs-ch-bell" class="accent-teal-600"> 🔔 Icon Chuông</label>
            <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" id="prefs-ch-popup" class="accent-teal-600"> 💻 Pop-up Laptop</label>
            <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" id="prefs-ch-email" class="accent-teal-600"> ✉️ Gửi Email</label>
          </div>
        </div>

        <div class="space-y-2.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mặc định nhắc Lịch họp</label>
            <select id="prefs-meet-rem" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold">${optsHtml}</select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mặc định nhắc Nhiệm vụ / To-do list</label>
            <select id="prefs-task-rem" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold">${optsHtml}</select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mặc định nhắc Gia hạn Hợp đồng</label>
            <select id="prefs-contract-rem" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold">${optsHtml}</select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onclick="document.getElementById('modal-notif-prefs').classList.add('hidden')" class="px-3.5 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">Hủy</button>
          <button type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold">Lưu Cài Đặt Riêng</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}

function openNotifPrefsModal() {
  ensureNotifPrefsModal();
  const p = getUserNotifPrefs();
  document.getElementById("prefs-email-input").value = p.email || "";
  document.getElementById("prefs-ch-bell").checked = p.channels.bell !== false;
  document.getElementById("prefs-ch-popup").checked = p.channels.popup !== false;
  document.getElementById("prefs-ch-email").checked = p.channels.email !== false;
  document.getElementById("prefs-meet-rem").value = String(p.defaultMeetingReminder || "15");
  document.getElementById("prefs-task-rem").value = String(p.defaultTaskReminder || "1440");
  document.getElementById("prefs-contract-rem").value = String(p.defaultContractReminder || "43200");
  document.getElementById("modal-notif-prefs").classList.remove("hidden");
}

function saveNotifPrefsFromModal(e) {
  e.preventDefault();
  const prefs = {
    email: document.getElementById("prefs-email-input").value.trim(),
    channels: {
      bell: document.getElementById("prefs-ch-bell").checked,
      popup: document.getElementById("prefs-ch-popup").checked,
      email: document.getElementById("prefs-ch-email").checked
    },
    defaultMeetingReminder: document.getElementById("prefs-meet-rem").value,
    defaultTaskReminder: document.getElementById("prefs-task-rem").value,
    defaultContractReminder: document.getElementById("prefs-contract-rem").value
  };
  saveUserNotifPrefs(prefs);
  document.getElementById("modal-notif-prefs").classList.add("hidden");
  if (prefs.channels.popup && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
  showToast("✓ Đã lưu cài đặt nhắc hẹn cá nhân của bạn!");
  checkDueRemindersEngine();
}

function parseReminderTargetTimestamp(dateStr, timeStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ""))) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const tMatch = String(timeStr || "").match(/(\d{1,2}):(\d{2})/);
  const hh = tMatch ? Number(tMatch[1]) : 9;
  const mm = tMatch ? Number(tMatch[2]) : 0;
  return new Date(y, m - 1, d, hh, mm, 0).getTime();
}

function dispatchPersonalizedReminder(item, prefs) {
  const channels = item.notify_channels
    ? String(item.notify_channels).split(",").filter(Boolean)
    : Object.keys(prefs.channels).filter(k => prefs.channels[k]);

  const label = REMINDER_LABELS[String(item.remMin)] || `Trước ${item.remMin} phút`;
  const fullMsg = `[Nhắc hẹn • ${label}] ${item.title}`;

  if (channels.includes("bell")) {
    addNotificationLog(fullMsg);
    updateNotificationDot();
    showToast("🔔 " + fullMsg);
  }
  if (channels.includes("popup") && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("BPortal • Nhắc hẹn", { body: `${item.title}\n${item.detail}`, tag: item.dedupKey });
    } catch (e) {}
  }
  if (channels.includes("email") && prefs.email && typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({
      action: "SEND_REMINDER_EMAIL",
      recipient_email: prefs.email,
      subject: `[BPortal Nhắc Hẹn] ${item.title}`,
      body: `Xin chào,\n\nĐây là nhắc hẹn tự động (${label}) từ BPortal:\n- Nội dung: ${item.title}\n- Chi tiết: ${item.detail}\n\nTrân trọng,\nBPortal Business Operation`
    });
  }
}

function checkDueRemindersEngine() {
  if (typeof state === "undefined") return;
  const prefs = getUserNotifPrefs();
  const nowMs = Date.now();
  let fired = {};
  try {
    fired = JSON.parse(localStorage.getItem(getUserFiredRemindersKey()) || "{}") || {};
  } catch (e) { fired = {}; }

  const candidates = [];

  (state.meetings || []).forEach(mt => {
    const rem = mt.reminder_minutes !== undefined && mt.reminder_minutes !== "" ? String(mt.reminder_minutes) : String(prefs.defaultMeetingReminder || "15");
    if (rem === "none") return;
    const targetMs = parseReminderTargetTimestamp(mt.date, mt.time);
    if (!targetMs) return;
    const remMin = Number(rem);
    candidates.push({
      dedupKey: `mt_${mt.id}_${mt.date}_${rem}`,
      targetMs,
      triggerMs: targetMs - remMin * 60000,
      remMin,
      notify_channels: mt.notify_channels,
      title: `Lịch họp: ${mt.title}`,
      detail: `${mt.date} lúc ${mt.time || 'Trong ngày'} • ${mt.partner || 'Nội bộ'}`
    });
  });

  (state.tasks || []).filter(t => t.stage !== "STAGE_DONE").forEach(t => {
    const rem = t.reminder_minutes !== undefined && t.reminder_minutes !== "" ? String(t.reminder_minutes) : String(prefs.defaultTaskReminder || "1440");
    if (rem === "none") return;
    const targetMs = parseReminderTargetTimestamp(t.due_date, "09:00");
    if (!targetMs) return;
    const remMin = Number(rem);
    candidates.push({
      dedupKey: `task_${t.id}_${t.due_date}_${rem}`,
      targetMs,
      triggerMs: targetMs - remMin * 60000,
      remMin,
      notify_channels: t.notify_channels,
      title: `Đầu việc: ${t.title}`,
      detail: `Hạn chót: ${t.due_date} • Mức độ: ${t.priority}`
    });
  });

  (state.merchants || []).filter(m => m.contract_expiry_date).forEach(m => {
    const rem = m.contract_reminder_minutes !== undefined && m.contract_reminder_minutes !== "" ? String(m.contract_reminder_minutes) : String(prefs.defaultContractReminder || "43200");
    if (rem === "none") return;
    const targetMs = parseReminderTargetTimestamp(m.contract_expiry_date, "09:00");
    if (!targetMs) return;
    const remMin = Number(rem);
    candidates.push({
      dedupKey: `contract_${m.id}_${m.contract_expiry_date}_${rem}`,
      targetMs,
      triggerMs: targetMs - remMin * 60000,
      remMin,
      notify_channels: m.contract_notify_channels,
      title: `Gia hạn hợp đồng: ${m.name}`,
      detail: `Ngày hết hạn: ${m.contract_expiry_date}`
    });
  });

  let changed = false;
  candidates.forEach(c => {
    // Kích hoạt khi đã tới mốc nhắc và sự kiện chưa trôi qua quá 24h
    if (!fired[c.dedupKey] && nowMs >= c.triggerMs && nowMs <= c.targetMs + 86400000) {
      fired[c.dedupKey] = nowMs;
      changed = true;
      dispatchPersonalizedReminder(c, prefs);
    }
  });

  if (changed) {
    localStorage.setItem(getUserFiredRemindersKey(), JSON.stringify(fired));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(checkDueRemindersEngine, 2500);
  setInterval(checkDueRemindersEngine, 30000);
});


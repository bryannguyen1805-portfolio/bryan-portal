// -------------------------------------------------------------
// 2. NAVIGATION & SCREEN SWITCHING
// -------------------------------------------------------------
const SIDEBAR_COLLAPSE_KEY = "bryan_portal_sidebar_collapsed";

function applySidebarCollapseState() {
  const sidebar = document.getElementById("app-sidebar");
  const icon = document.getElementById("sidebar-collapse-icon");
  if (!sidebar) return;
  const isCollapsed = localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
  sidebar.classList.toggle("sidebar-collapsed", isCollapsed);
  if (icon) {
    icon.setAttribute("data-lucide", isCollapsed ? "panel-left-open" : "panel-left-close");
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
}

function toggleSidebarCollapse() {
  if (window.innerWidth < 768) {
    closeMobileSidebar();
    return;
  }
  const isCollapsed = localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
  localStorage.setItem(SIDEBAR_COLLAPSE_KEY, isCollapsed ? "0" : "1");
  applySidebarCollapseState();
}

function openMobileSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  const backdrop = document.getElementById("mobile-sidebar-backdrop");
  if (sidebar) sidebar.classList.remove("-translate-x-full");
  if (backdrop) backdrop.classList.remove("hidden");
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  const backdrop = document.getElementById("mobile-sidebar-backdrop");
  if (sidebar) sidebar.classList.add("-translate-x-full");
  if (backdrop) backdrop.classList.add("hidden");
}

const DAILY_QUOTES = [
  "Mỗi sáng thức dậy là một cơ hội mới để làm tốt hơn hôm qua.",
  "Không cần làm tất cả hôm nay — chỉ cần hoàn thành trọn vẹn 1–3 việc quan trọng nhất.",
  "Tiến độ đều đặn mỗi ngày luôn thắng sự vội vàng nhất thời.",
  "Giữ tâm trí thoáng đãng để đưa ra những quyết định sắc bén nhất.",
  "Một cuộc họp gọn, một đầu việc xong — ngày làm việc nhẹ tênh.",
  "Bắt đầu bằng việc khó nhất, phần còn lại của ngày sẽ trôi chảy hơn hẳn."
];
let currentQuoteIdx = new Date().getDate() % DAILY_QUOTES.length;

function getTimeGreetingMeta() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { prefix: "Chào buổi sáng", icon: "sun" };
  if (h >= 12 && h < 18) return { prefix: "Chiều năng suất nhé", icon: "coffee" };
  return { prefix: "Buổi tối nhẹ nhàng", icon: "moon" };
}

function getDailyFocusStorageKey() {
  const email = (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "default") || "default";
  const today = new Date().toISOString().slice(0, 10);
  return `bryan_portal_focus_${email}_${today}`;
}

function loadDailyFocusWidget() {
  const input = document.getElementById("daily-focus-input");
  const checkBtn = document.getElementById("daily-focus-check");
  if (!input || !checkBtn) return;

  let saved = { text: "", done: false };
  try {
    const raw = localStorage.getItem(getDailyFocusStorageKey());
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  input.value = saved.text || "";
  applyDailyFocusDoneUI(!!saved.done);
}

function applyDailyFocusDoneUI(isDone) {
  const input = document.getElementById("daily-focus-input");
  const checkBtn = document.getElementById("daily-focus-check");
  if (!input || !checkBtn) return;
  const icon = checkBtn.querySelector("i, svg");
  if (isDone) {
    checkBtn.classList.add("bg-slate-900", "border-slate-900");
    checkBtn.classList.remove("border-slate-300", "border-amber-400");
    if (icon) icon.classList.remove("hidden");
    input.classList.add("line-through", "text-slate-400");
    input.classList.remove("text-slate-800");
  } else {
    checkBtn.classList.remove("bg-slate-900", "border-slate-900", "border-amber-400");
    checkBtn.classList.add("border-slate-300");
    if (icon) icon.classList.add("hidden");
    input.classList.remove("line-through", "text-slate-400");
    input.classList.add("text-slate-800");
  }
}

function saveDailyFocusText() {
  const input = document.getElementById("daily-focus-input");
  if (!input) return;
  let saved = { text: "", done: false };
  try {
    const raw = localStorage.getItem(getDailyFocusStorageKey());
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}
  saved.text = input.value.trim();
  localStorage.setItem(getDailyFocusStorageKey(), JSON.stringify(saved));
}

function toggleDailyFocusDone() {
  const input = document.getElementById("daily-focus-input");
  if (!input) return;
  let saved = { text: input.value.trim(), done: false };
  try {
    const raw = localStorage.getItem(getDailyFocusStorageKey());
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}
  saved.text = input.value.trim();
  saved.done = !saved.done;
  localStorage.setItem(getDailyFocusStorageKey(), JSON.stringify(saved));
  applyDailyFocusDoneUI(saved.done);
  if (saved.done && saved.text && typeof showToast === "function") {
    showToast("✓ Tuyệt vời! Bạn đã hoàn thành mục tiêu trọng tâm hôm nay!");
  }
}

function cycleDailyQuote() {
  currentQuoteIdx = (currentQuoteIdx + 1) % DAILY_QUOTES.length;
  const quoteEl = document.getElementById("hero-daily-quote");
  if (quoteEl) quoteEl.textContent = `"${DAILY_QUOTES[currentQuoteIdx]}"`;
}

function switchDashboardMode(mode) {
  const focusEl = document.getElementById("dash-mode-focus");
  const opsEl = document.getElementById("dash-mode-operations");
  const btnFocus = document.getElementById("dash-tab-btn-FOCUS");
  const btnOps = document.getElementById("dash-tab-btn-OPERATIONS");
  if (!focusEl || !opsEl) return;

  const isFocus = mode !== "OPERATIONS";
  focusEl.classList.toggle("hidden", !isFocus);
  opsEl.classList.toggle("hidden", isFocus);

  if (btnFocus && btnOps) {
    btnFocus.className = isFocus
      ? "px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 bg-teal-600 text-white shadow-xs"
      : "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 text-slate-500 hover:text-slate-800";
    btnOps.className = !isFocus
      ? "px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 bg-teal-600 text-white shadow-xs"
      : "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 text-slate-500 hover:text-slate-800";
  }
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function syncWelcomeAccountGreeting() {
  const titleEl = document.getElementById("welcome-title");
  const nameEl = document.getElementById("sidebar-user-name");
  const dateEl = document.getElementById("hero-date-label");
  const quoteEl = document.getElementById("hero-daily-quote");
  if (titleEl) {
    const fullName = (nameEl?.textContent || "Bryan").trim();
    const shortName = fullName.split(/\s+/)[0] || "Bryan";
    const safeName = shortName.replace(/[<>&"]/g, "");
    const { prefix, icon } = getTimeGreetingMeta();
    titleEl.innerHTML = `${prefix}, <span class="text-teal-200">${safeName}</span> <i data-lucide="${icon}" class="inline-block w-5 h-5 text-teal-200 align-text-bottom ml-0.5"></i>`;
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
  if (dateEl) {
    const now = new Date();
    const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    dateEl.textContent = `${weekdays[now.getDay()]}, ${dd}/${mm}/${now.getFullYear()}`;
  }
  if (quoteEl) {
    quoteEl.textContent = `"${DAILY_QUOTES[currentQuoteIdx]}"`;
  }
  loadDailyFocusWidget();
  renderBnewsMorningBriefing();
  if (typeof updateDashTaskScopeButton === "function") updateDashTaskScopeButton();
  if (typeof renderDashboardPersonalProgress === "function") renderDashboardPersonalProgress();
  if (typeof renderDashboardDeadlineAlerts === "function") renderDashboardDeadlineAlerts();
}

const DEFAULT_BNEWS_URL = "https://bryanportfolio.io.vn/fintech-intelligence";

function getBnewsUrl() {
  return (localStorage.getItem("bryan_portal_bnews_url") || DEFAULT_BNEWS_URL).trim();
}

function getBnewsReadTodayKey() {
  const email = (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "default") || "default";
  const today = new Date().toISOString().slice(0, 10);
  return `bryan_portal_bnews_read_${email}_${today}`;
}

function markBnewsReadToday() {
  localStorage.setItem(getBnewsReadTodayKey(), "1");
  renderBnewsMorningBriefing();
}

function editBnewsUrl() {
  const current = getBnewsUrl();
  const next = prompt("Nhập đường dẫn trang Bnews của bạn:", current);
  if (next === null) return;
  const trimmed = next.trim();
  if (!trimmed) return;
  localStorage.setItem("bryan_portal_bnews_url", trimmed);
  renderBnewsMorningBriefing();
  if (typeof showToast === "function") showToast("✓ Đã cập nhật liên kết Bnews!");
}

const BNEWS_LOGO_LIGHT_URL = "https://bryanportfolio.io.vn/fintech-intelligence/bnews-logo-light.svg";
const BNEWS_LOGO_DARK_URL = "https://bryanportfolio.io.vn/fintech-intelligence/bnews-logo-dark.svg";

function renderBnewsLogoHtml() {
  return `
    <img src="${BNEWS_LOGO_LIGHT_URL}" alt="Bnews" class="footer-logo-light h-5 w-auto object-contain" />
    <img src="${BNEWS_LOGO_DARK_URL}" alt="Bnews" class="footer-logo-dark hidden h-5 w-auto object-contain" />
  `;
}

function renderBnewsMorningBriefing() {
  const box = document.getElementById("bnews-morning-briefing");
  if (!box) return;
  const bnewsUrl = getBnewsUrl();
  const isRead = localStorage.getItem(getBnewsReadTodayKey()) === "1";

  if (isRead) {
    box.innerHTML = `
      <div class="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/70 space-y-2.5 text-slate-800">
        <div class="flex items-center justify-between gap-2">
          ${renderBnewsLogoHtml()}
          <div class="flex items-center gap-1.5">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold inline-flex items-center gap-1">
              <i data-lucide="check" class="w-3 h-3"></i>
              <span>Đã đọc hôm nay</span>
            </span>
            <button type="button" onclick="editBnewsUrl()" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" title="Cài đặt link Bnews">
              <i data-lucide="settings-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between gap-3 pt-0.5">
          <p class="text-[11px] font-semibold text-slate-600 leading-snug">
            Đã cập nhật <strong class="text-slate-900">40 tin hot nhất hôm nay</strong>. Chúc bạn làm việc hiệu quả!
          </p>
          <a href="${bnewsUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 border border-slate-200 text-[11px] font-bold inline-flex items-center gap-1 transition shrink-0 whitespace-nowrap">
            <span>Mở lại</span>
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/70 space-y-3 text-slate-800">
        <div class="flex items-center justify-between gap-2">
          ${renderBnewsLogoHtml()}
          <div class="flex items-center gap-1.5">
            <span class="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70 text-[10px] font-extrabold">40 tin hot</span>
            <button type="button" onclick="editBnewsUrl()" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition" title="Cài đặt link Bnews">
              <i data-lucide="settings-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
        <p class="text-xs font-semibold text-slate-600 leading-relaxed">
          Trước khi bắt đầu luồng công việc, bạn đã điểm qua <strong class="text-slate-900">40 tin tức hot nhất hôm nay</strong> chưa?
        </p>
        <a href="${bnewsUrl}" target="_blank" rel="noopener noreferrer" onclick="markBnewsReadToday()" class="w-full py-2 px-4 rounded-xl bg-navy-900 hover:bg-teal-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition">
          <span>Đọc ngay trên Bnews</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    `;
  }
  if (typeof lucide !== "undefined") lucide.createIcons();
}

window.addEventListener("DOMContentLoaded", () => {
  applySidebarCollapseState();
  syncWelcomeAccountGreeting();
});

function navigateTo(screenId) {
  const views = ['DASHBOARD', 'PROJECTS', 'ONBOARDING', 'PIPELINE', 'TASKS', 'CALENDAR', 'NOTIFICATIONS', 'AUTOMATION'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const btn = document.getElementById(`nav-${v}`);
    if (el) el.classList.add('hidden');
    if (btn) {
      btn.classList.remove('text-white', 'bg-teal-600/90', 'shadow-sm', 'shadow-teal-700/30');
      btn.classList.add('text-slate-400');
    }
  });

  const targetView = document.getElementById(`view-${screenId}`);
  const targetBtn = document.getElementById(`nav-${screenId}`);
  if (targetView) targetView.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.remove('text-slate-400');
    targetBtn.classList.add('text-white', 'bg-teal-600/90', 'shadow-sm', 'shadow-teal-700/30');
  }

  // Sync mobile bottom nav active state & close slide-over drawer
  ['DASHBOARD', 'PROJECTS', 'TASKS', 'CALENDAR'].forEach(id => {
    const mBtn = document.getElementById(`mnav-${id}`);
    if (!mBtn) return;
    const active = id === screenId;
    mBtn.classList.toggle('text-teal-700', active);
    mBtn.classList.toggle('bg-teal-50', active);
    mBtn.classList.toggle('font-bold', active);
    mBtn.classList.toggle('text-slate-500', !active);
    mBtn.classList.toggle('font-semibold', !active);
  });
  closeMobileSidebar();

  if (screenId === 'DASHBOARD') {
    updateAllKpis();
    renderDashboardMeetings();
    renderDashboardBlockers();
    renderDashboardQuickTasks();
    renderDashboardOnboardingSummary();
    renderDashboardProjectsProgress();
    renderDashboardUpcomingDeadlines();
  } else if (screenId === 'PROJECTS') {
    renderMerchantPillsBar();
    renderMerchantSubTabs();
    renderMerchantWorkspaceBody();
  } else if (screenId === 'ONBOARDING') {
    renderOnboardingView();
  } else if (screenId === 'CALENDAR') {
    renderCalendarView();
  } else if (screenId === 'TASKS') {
    renderTasksMainView();
  } else if (screenId === 'NOTIFICATIONS') {
    renderNotificationsView();
  } else if (screenId === 'AUTOMATION') {
    syncAutomationCheckboxes();
    renderCustomAutomationRules();
  }
}

// -------------------------------------------------------------
// 3. DASHBOARD RENDERS (100% DYNAMIC REAL DATA)
// -------------------------------------------------------------
function renderDashboardBlockers() {
  const section = document.getElementById("dash-blocker-section");
  if (!section) return;

  const blockedProjects = state.projects.filter(p => p.is_blocked);

  // Khi không có vướng mắc -> Thu gọn thành dải trạng thái mảnh cao tối đa 32px
  if (blockedProjects.length === 0) {
    section.innerHTML = `
      <div class="h-9 px-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2 text-slate-700 font-semibold">
          <span class="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
          <span>Tiến độ toàn hệ thống thông suốt</span>
        </div>
        <span class="text-[11px] text-slate-500 font-semibold">0 vướng mắc</span>
      </div>
    `;
    return;
  }

  // Khi có >= 1 vướng mắc -> Mở rộng hiển thị chi tiết
  section.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col">
      <div class="flex items-center justify-between mb-3 pb-2.5 border-b border-rose-100">
        <div class="flex items-center space-x-2 text-rose-700 font-bold text-sm">
          <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600"></i>
          <span>Vướng Mắc Cần Xử Lý Gấp (${blockedProjects.length})</span>
        </div>
        <span class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">Cần can thiệp ngay</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${blockedProjects.map(p => {
          const m = state.merchants.find(item => item.id === p.merchant_id);
          return `
            <div class="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 border-l-4 border-l-rose-500 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-rose-950 truncate">${m ? m.name : ''} • ${p.title}</span>
                <button onclick="selectMerchant('${p.merchant_id}'); selectSubTab('${p.id}'); navigateTo('PROJECTS');" class="text-[11px] text-rose-700 font-bold hover:underline shrink-0">Mở dự án →</button>
              </div>
              <p class="text-xs text-rose-800">${p.blocker_reason}</p>
              <div class="flex items-center justify-between pt-2 border-t border-rose-200/70">
                <span class="text-[11px] text-rose-700">Phụ trách: <strong>${p.blocker_owner || 'Đối tác'}</strong></span>
                <button onclick="handlePingPIC('${m ? m.name : ''}', '${p.title}', '${p.blocker_reason}')" class="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition flex items-center space-x-1 shadow-2xs">
                  <i data-lucide="message-circle" class="w-3 h-3"></i>
                  <span>Liên hệ Zalo</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function renderDashboardOnboardingSummary() {
  const container = document.getElementById("dash-onboarding-summary");
  if (!container) return;

  const activeObs = onboardingList.filter(o => !o.graduated).slice(0, 4);
  if (activeObs.length === 0) {
    container.innerHTML = `
      <div class="h-full min-h-[120px] rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center space-y-1.5">
        <div class="text-xs font-bold text-slate-600">Tất cả quy trình Onboarding đã bàn giao xong!</div>
        <button onclick="navigateTo('ONBOARDING'); openNewOnboardingModal();" class="text-xs text-teal-600 font-bold hover:underline">+ Khởi tạo quy trình mới</button>
      </div>
    `;
    return;
  }

  container.innerHTML = activeObs.map(ob => {
    const doneCnt = ob.tasks.filter(t => t.status === "DONE").length;
    const pct = Math.round((doneCnt / ob.total_steps) * 100);
    const nextTask = ob.tasks.filter(t => t.status !== "DONE").sort((a, b) => a.step_no - b.step_no)[0];
    const chLabel = SOP_CHANNELS[ob.channel]?.label || ob.channel;

    return `
      <div onclick="selectOnboardingMerchant('${ob.id}'); navigateTo('ONBOARDING');" class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 cursor-pointer transition space-y-1.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 min-w-0">
            <span class="font-bold text-xs text-slate-800 truncate">${ob.merchant_name}</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">${chLabel}</span>
          </div>
          <span class="text-xs font-black text-teal-700 shrink-0">${pct}% (${doneCnt}/${ob.total_steps})</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-1.5">
          <div class="bg-teal-600 h-1.5 rounded-full transition-all" style="width: ${pct}%"></div>
        </div>
        <div class="text-[11px] text-slate-500 truncate">
          ${nextTask ? `Đang tới: <strong class="text-slate-700">B${nextTask.step_no} - ${nextTask.title}</strong>` : '<strong class="text-emerald-600">Sẵn sàng bàn giao!</strong>'}
        </div>
      </div>
    `;
  }).join('');
}

let quickTodoDuePreset = "TODAY";
let dashTaskScope = localStorage.getItem("bryan_portal_dash_task_scope") || "MINE";

function getIsoDateOffset(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getCurrentUserMatchTokens() {
  const email = (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "") || "";
  const name = (document.getElementById("sidebar-user-name")?.textContent || "").trim();
  const emailPrefix = email.split("@")[0] || "";
  return [email, name, emailPrefix]
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

function isTaskMine(task) {
  if (!task) return false;
  if (task.type === "PERSONAL" || !task.owner) return true;
  const ownerLower = String(task.owner).toLowerCase();
  const tokens = getCurrentUserMatchTokens();
  return tokens.some(tok => ownerLower.includes(tok) || tok.includes(ownerLower));
}

function updateDashTaskScopeButton() {
  const btn = document.getElementById("dash-task-scope-btn");
  if (!btn) return;
  if (dashTaskScope === "MINE") {
    btn.textContent = "Việc của tôi";
    btn.className = "text-[11px] px-2.5 py-1 rounded-lg font-bold bg-teal-600 text-white hover:bg-teal-700 transition whitespace-nowrap";
  } else {
    btn.textContent = "Toàn bộ team";
    btn.className = "text-[11px] px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition whitespace-nowrap";
  }
}

function toggleDashTaskScope() {
  dashTaskScope = dashTaskScope === "MINE" ? "ALL" : "MINE";
  localStorage.setItem("bryan_portal_dash_task_scope", dashTaskScope);
  updateDashTaskScopeButton();
  renderDashboardQuickTasks();
}

function setQuickTodoDuePreset(preset) {
  quickTodoDuePreset = preset;
  document.querySelectorAll(".quick-due-chip").forEach(btn => {
    const isActive = btn.getAttribute("data-quick-due") === preset;
    btn.className = isActive
      ? "quick-due-chip px-2 py-1 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 transition"
      : "quick-due-chip px-2 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition";
  });
}

let quickTodoPriority = "CAO";

function toggleQuickTodoPriority() {
  quickTodoPriority = quickTodoPriority === "KHẨN CẤP" ? "TRUNG BÌNH" : quickTodoPriority === "CAO" ? "KHẨN CẤP" : "CAO";
  const btn = document.getElementById("quick-priority-btn");
  if (!btn) return;
  if (quickTodoPriority === "KHẨN CẤP") {
    btn.textContent = "🔥 Gấp";
    btn.className = "px-2 py-1 rounded-lg text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 transition";
  } else if (quickTodoPriority === "CAO") {
    btn.textContent = "Ưu tiên";
    btn.className = "px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 transition";
  } else {
    btn.textContent = "Thường";
    btn.className = "px-2 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition";
  }
}

function handleQuickAddTodo(e) {
  e.preventDefault();
  const input = document.getElementById("dash-quick-add-input");
  const title = (input?.value || "").trim();
  if (!title) {
    if (input) input.focus();
    return;
  }

  let dueOffset = 0;
  if (quickTodoDuePreset === "TOMORROW") dueOffset = 1;
  if (quickTodoDuePreset === "WEEK") dueOffset = 4;

  const ownerName = (document.getElementById("sidebar-user-name")?.textContent || "Bryan").trim();
  const newTask = {
    id: "TASK-" + Date.now(),
    title,
    type: "PERSONAL",
    priority: quickTodoPriority,
    stage: "STAGE_DOING",
    due_date: getIsoDateOffset(dueOffset),
    owner: ownerName,
    project_id: "",
    is_overdue: false,
    created_at: new Date().toISOString()
  };

  state.tasks.unshift(newTask);
  if (input) input.value = "";
  if (typeof syncAllAfterTaskChange === "function") {
    syncAllAfterTaskChange(`Đã thêm To-do nhanh: ${title}`);
  } else {
    saveStateStorage();
    renderDashboardQuickTasks();
  }
  showToast(`✓ Đã thêm "${title}" vào danh sách việc cần làm!`);
}

const QUICK_TASK_TEMPLATES = {
  ONBOARDING: {
    label: "Onboarding đối tác",
    items: [
      { title: "Gửi checklist hồ sơ & thông tin kết nối cho đối tác", offsetDays: 0, priority: "CAO" },
      { title: "Kiểm tra tiến độ hoàn thiện hồ sơ & test kết nối", offsetDays: 2, priority: "CAO" },
      { title: "Chốt lịch Go-live & bàn giao vận hành", offsetDays: 5, priority: "KHẨN CẤP" }
    ]
  },
  FOLLOW_UP: {
    label: "Follow-up sau họp",
    items: [
      { title: "Gửi tóm tắt nội dung & action items sau cuộc họp", offsetDays: 0, priority: "CAO" },
      { title: "Nhắc đối tác phản hồi các đầu việc đã thống nhất", offsetDays: 2, priority: "TRUNG BÌNH" }
    ]
  },
  WEEKLY_SYNC: {
    label: "Rà soát tuần",
    items: [
      { title: "Rà soát các đầu việc tồn đọng & lịch sự cố tuần", offsetDays: 0, priority: "CAO" },
      { title: "Tổng hợp báo cáo tiến độ vận hành gửi team", offsetDays: 3, priority: "TRUNG BÌNH" }
    ]
  }
};

function applyQuickTaskTemplate(templateKey) {
  const tpl = QUICK_TASK_TEMPLATES[templateKey];
  if (!tpl) return;
  const ownerName = (document.getElementById("sidebar-user-name")?.textContent || "Bryan").trim();
  const baseTs = Date.now();
  const beforeTasks = JSON.parse(JSON.stringify(state.tasks));

  const created = tpl.items.map((item, idx) => ({
    id: `TASK-${baseTs + idx}`,
    title: item.title,
    type: "PERSONAL",
    priority: item.priority,
    stage: "STAGE_DOING",
    due_date: getIsoDateOffset(item.offsetDays),
    owner: ownerName,
    project_id: "",
    is_overdue: false,
    created_at: new Date().toISOString()
  }));

  state.tasks = [...created, ...state.tasks];
  if (typeof syncAllAfterTaskChange === "function") {
    syncAllAfterTaskChange(`Đã tạo ${created.length} việc từ mẫu "${tpl.label}"`);
  } else {
    saveStateStorage();
    renderDashboardQuickTasks();
  }
  if (typeof pushUndoAction === "function") {
    pushUndoAction({
      module: "TODO",
      action_type: "CREATE",
      entity_id: `tpl-${baseTs}`,
      display_label: `Mẫu ${tpl.label} (${created.length} việc)`,
      before: { tasks: beforeTasks },
      after: { tasks: state.tasks },
      toastMessage: `✓ Đã tạo ${created.length} việc từ mẫu "${tpl.label}"`
    });
  } else {
    showToast(`✓ Đã tạo ${created.length} việc từ mẫu "${tpl.label}"`);
  }
}

document.addEventListener("keydown", function (e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
  if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;
  if (e.key === "n" || e.key === "N") {
    const authOverlay = document.getElementById("auth-login-overlay");
    if (authOverlay && !authOverlay.classList.contains("hidden")) return;
    e.preventDefault();
    if (typeof navigateTo === "function") navigateTo("DASHBOARD");
    if (typeof switchDashboardMode === "function") switchDashboardMode("FOCUS");
    const quickInput = document.getElementById("dash-quick-add-input");
    if (quickInput) {
      quickInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => quickInput.focus(), 120);
    }
  }
});

function formatRelativeDueBadge(task) {
  if (!task || !task.due_date) {
    return { label: "Chưa hẹn hạn", badgeCls: "bg-slate-100 text-slate-500", urgencyRank: 4 };
  }
  const todayStr = getIsoDateOffset(0);
  const tomorrowStr = getIsoDateOffset(1);

  if (task.due_date < todayStr) {
    const diffMs = new Date(todayStr + "T00:00:00") - new Date(task.due_date + "T00:00:00");
    const days = Math.max(1, Math.round(diffMs / 86400000));
    return { label: `Quá hạn ${days} ngày`, badgeCls: "bg-rose-100 text-rose-700", urgencyRank: 0 };
  }
  if (task.due_date === todayStr) {
    return { label: "Hôm nay", badgeCls: "bg-amber-100 text-amber-800", urgencyRank: 1 };
  }
  if (task.due_date === tomorrowStr) {
    return { label: "Ngày mai", badgeCls: "bg-orange-100 text-orange-700", urgencyRank: 2 };
  }
  const diffMs = new Date(task.due_date + "T00:00:00") - new Date(todayStr + "T00:00:00");
  const days = Math.max(2, Math.round(diffMs / 86400000));
  return { label: `Còn ${days} ngày`, badgeCls: "bg-emerald-50 text-emerald-700", urgencyRank: 3 };
}

function snoozeTaskOneDay(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  const todayStr = getIsoDateOffset(0);
  const baseStr = task.due_date && task.due_date >= todayStr ? task.due_date : todayStr;
  const baseDate = new Date(baseStr + "T00:00:00");
  baseDate.setDate(baseDate.getDate() + 1);
  const y = baseDate.getFullYear();
  const m = String(baseDate.getMonth() + 1).padStart(2, "0");
  const d = String(baseDate.getDate()).padStart(2, "0");
  task.due_date = `${y}-${m}-${d}`;
  task.is_overdue = false;

  if (typeof syncAllAfterTaskChange === "function") {
    syncAllAfterTaskChange(`Đã dời hạn "${task.title}" sang ${task.due_date}`);
  } else {
    saveStateStorage();
    renderDashboardQuickTasks();
  }
  showToast(`⏰ Đã dời hạn sang ${d}/${m}`);
}

function renderDashboardPersonalProgress() {
  const headlineEl = document.getElementById("dash-progress-headline");
  const subEl = document.getElementById("dash-progress-sub");
  const pctEl = document.getElementById("dash-progress-pct");
  const ringEl = document.getElementById("dash-progress-ring-circle");
  if (!headlineEl || !subEl || !pctEl || !ringEl) return;

  const todayStr = getIsoDateOffset(0);
  const scopedTasks = dashTaskScope === "MINE" ? state.tasks.filter(isTaskMine) : state.tasks;

  const doneToday = scopedTasks.filter(t => t.stage === "STAGE_DONE" && t.completed_at && t.completed_at.slice(0, 10) === todayStr).length;
  const openUrgentToday = scopedTasks.filter(t => t.stage !== "STAGE_DONE" && t.due_date && t.due_date <= todayStr).length;
  const totalTodayBucket = doneToday + openUrgentToday;

  const pct = totalTodayBucket === 0
    ? (scopedTasks.some(t => t.stage === "STAGE_DONE") ? 100 : 0)
    : Math.round((doneToday / totalTodayBucket) * 100);

  const circumference = 138.23;
  const offset = circumference - (pct / 100) * circumference;
  ringEl.style.strokeDashoffset = offset.toFixed(2);
  pctEl.textContent = `${pct}%`;

  if (totalTodayBucket === 0) {
    headlineEl.textContent = "Hôm nay khá nhẹ nhàng";
    subEl.textContent = "Chưa có đầu việc nào tới hạn hôm nay — bạn có thể thêm To-do mới.";
  } else if (openUrgentToday === 0) {
    headlineEl.textContent = `Hoàn tất ${doneToday}/${totalTodayBucket} việc hôm nay`;
    subEl.textContent = "Xuất sắc! Bạn đã xử lý gọn toàn bộ việc tới hạn.";
  } else {
    headlineEl.textContent = `Đã xong ${doneToday}/${totalTodayBucket} việc hôm nay`;
    subEl.textContent = `Còn ${openUrgentToday} đầu việc cần chốt để đạt 100% mục tiêu ngày.`;
  }
}

const BROWSER_NOTIF_OPTIN_KEY = "bryan_portal_browser_notif_optin";
const BROWSER_NOTIF_SENT_KEY = "bryan_portal_browser_notif_sent_date";

function isBrowserNotifEnabled() {
  return typeof Notification !== "undefined" && Notification.permission === "granted" && localStorage.getItem(BROWSER_NOTIF_OPTIN_KEY) === "1";
}

function maybeSendDailyDeadlineBrowserNotif(urgentCount, topTitle) {
  if (!isBrowserNotifEnabled() || urgentCount <= 0) return;
  const todayStr = getIsoDateOffset(0);
  if (sessionStorage.getItem(BROWSER_NOTIF_SENT_KEY) === todayStr) return;
  sessionStorage.setItem(BROWSER_NOTIF_SENT_KEY, todayStr);
  try {
    new Notification(`BPortal • ${urgentCount} việc cần chốt hôm nay`, {
      body: topTitle ? `Ưu tiên: ${topTitle}` : "Kiểm tra danh sách việc sắp tới hạn trong BPortal."
    });
  } catch (err) {}
}

function enableBrowserDeadlineNotifications() {
  if (typeof Notification === "undefined") {
    showToast("Trình duyệt hiện tại không hỗ trợ thông báo.");
    return;
  }
  if (Notification.permission === "denied") {
    showToast("Bạn đang chặn thông báo trình duyệt cho trang này. Hãy bật lại trong cài đặt trình duyệt.");
    return;
  }
  Notification.requestPermission().then(perm => {
    if (perm === "granted") {
      localStorage.setItem(BROWSER_NOTIF_OPTIN_KEY, "1");
      sessionStorage.removeItem(BROWSER_NOTIF_SENT_KEY);
      renderDashboardDeadlineAlerts();
      showToast("🔔 Đã bật nhắc việc tới hạn trên trình duyệt!");
    } else {
      showToast("Chưa cấp quyền thông báo trình duyệt.");
    }
  });
}

function getBrowserNotifButtonHtml() {
  if (typeof Notification === "undefined") return "";
  if (isBrowserNotifEnabled()) {
    return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/70 text-[10px] font-bold whitespace-nowrap"><i data-lucide="bell-ring" class="w-3 h-3"></i><span>Đang nhắc</span></span>`;
  }
  return `<button type="button" onclick="enableBrowserDeadlineNotifications()" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold transition whitespace-nowrap" title="Nhận thông báo trình duyệt khi có việc tới hạn"><i data-lucide="bell" class="w-3 h-3"></i><span>Bật nhắc</span></button>`;
}

function renderDashboardDeadlineAlerts() {
  const stripEl = document.getElementById("dash-deadline-alert-strip");
  if (!stripEl) return;

  const todayStr = getIsoDateOffset(0);
  const tomorrowStr = getIsoDateOffset(1);
  const scopedOpen = (dashTaskScope === "MINE" ? state.tasks.filter(isTaskMine) : state.tasks)
    .filter(t => t.stage !== "STAGE_DONE" && t.due_date);

  const overdueList = scopedOpen.filter(t => t.due_date < todayStr);
  const dueTodayList = scopedOpen.filter(t => t.due_date === todayStr);
  const dueTomorrowList = scopedOpen.filter(t => t.due_date === tomorrowStr);

  const urgentCount = overdueList.length + dueTodayList.length;
  const soonCount = dueTomorrowList.length;

  // Cập nhật badge ngay trên tiêu đề tab trình duyệt
  if (urgentCount > 0) {
    document.title = `(${urgentCount}) BPortal — Điều phối vận hành`;
  } else {
    document.title = "BPortal — Điều phối vận hành";
  }

  const topTask = overdueList[0] || dueTodayList[0] || dueTomorrowList[0];
  maybeSendDailyDeadlineBrowserNotif(urgentCount, topTask ? topTask.title : "");

  if (urgentCount === 0 && soonCount === 0) {
    stripEl.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-slate-100 text-teal-700 flex items-center justify-center shrink-0">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0">
            <div class="text-sm font-black text-slate-800">Không có việc sắp trễ hạn</div>
            <div class="text-xs text-slate-500">Mọi đầu việc trong 48 giờ tới đều đang trong tầm kiểm soát.</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          ${getBrowserNotifButtonHtml()}
          <button onclick="navigateTo('TASKS')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">Xem To-do</button>
        </div>
      </div>
    `;
    if (typeof lucide !== "undefined") lucide.createIcons();
    return;
  }

  const parts = [];
  if (overdueList.length > 0) parts.push(`<span class="text-rose-600 font-extrabold">${overdueList.length} quá hạn</span>`);
  if (dueTodayList.length > 0) parts.push(`<span class="text-amber-700 font-extrabold">${dueTodayList.length} hạn hôm nay</span>`);
  if (dueTomorrowList.length > 0) parts.push(`<span class="text-orange-600 font-bold">${dueTomorrowList.length} hạn ngày mai</span>`);

  const isCritical = overdueList.length > 0;

  stripEl.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl ${isCritical ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"} flex items-center justify-center shrink-0">
          <i data-lucide="bell-ring" class="w-5 h-5"></i>
        </div>
        <div class="min-w-0">
          <div class="text-xs font-bold text-slate-800 flex flex-wrap items-center gap-1.5">
            <span>Nhắc hạn 48h tới:</span>
            ${parts.join('<span class="text-slate-300">•</span>')}
          </div>
          <div class="text-xs text-slate-500 truncate mt-0.5">
            Ưu tiên xử lý: <strong class="text-slate-700">${topTask ? topTask.title : ""}</strong>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
        ${getBrowserNotifButtonHtml()}
        ${topTask ? `
        <button onclick="toggleTaskDone('${topTask.id}')" class="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition whitespace-nowrap">✓ Xong ngay</button>
        <button onclick="snoozeTaskOneDay('${topTask.id}')" class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition whitespace-nowrap">+1 ngày</button>
        ` : ""}
      </div>
    </div>
  `;
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function renderDashboardQuickTasks() {
  const container = document.getElementById("dash-quick-tasks");
  if (!container) return;

  updateDashTaskScopeButton();
  renderDashboardPersonalProgress();
  renderDashboardDeadlineAlerts();

  const priorityRank = { "KHẨN CẤP": 1, "CAO": 2, "TRUNG BÌNH": 3 };
  const quickTasks = state.tasks
    .filter(t => t.stage !== 'STAGE_DONE')
    .filter(t => dashTaskScope === "MINE" ? isTaskMine(t) : true)
    .sort((a, b) => {
      const ua = formatRelativeDueBadge(a).urgencyRank;
      const ub = formatRelativeDueBadge(b).urgencyRank;
      if (ua !== ub) return ua - ub;
      return (priorityRank[a.priority] || 9) - (priorityRank[b.priority] || 9);
    })
    .slice(0, 6);

  let html = quickTasks.map(t => {
    const proj = state.projects.find(p => p.id === t.project_id);
    const m = proj ? state.merchants.find(merchant => merchant.id === proj.merchant_id) : null;
    const dueMeta = formatRelativeDueBadge(t);

    return `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:border-teal-300 transition group">
        <div class="flex items-center space-x-2.5 min-w-0">
          <input type="checkbox" onchange="toggleTaskDone('${t.id}')" class="w-4 h-4 accent-teal-600 rounded cursor-pointer shrink-0" title="Đánh dấu hoàn thành">
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 truncate">${t.title}</div>
            <div class="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
              <span class="px-1.5 py-0.5 rounded font-bold ${dueMeta.badgeCls}">${dueMeta.label}</span>
              <span class="text-slate-500 font-semibold truncate max-w-[140px]">${m ? m.name : 'Việc cá nhân'}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" onclick="snoozeTaskOneDay('${t.id}')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-700 text-[10px] font-bold text-slate-600 transition" title="Dời hạn sang ngày mai">+1d</button>
          <span class="px-2 py-0.5 rounded text-[9px] font-extrabold ${
            t.priority === 'KHẨN CẤP' ? 'bg-rose-100 text-rose-700' :
            t.priority === 'CAO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
          }">${t.priority}</span>
        </div>
      </div>
    `;
  }).join('');

  if (quickTasks.length === 0) {
    html = `
      <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
        <div class="text-sm font-bold text-slate-800">✓ Mọi việc ưu tiên hôm nay đã gọn gàng</div>
        <div class="text-xs text-slate-500">Bạn có thể gõ nhanh ở ô bên trên để thêm To-do mới bất kỳ lúc nào.</div>
      </div>
    `;
  }

  container.innerHTML = html;
  lucide.createIcons();
}

function renderDashboardMeetings() {
  const container = document.getElementById("dash-meetings-list");
  if (!container) return;

  const todayMeetings = (state.meetings || []).filter(mt => !mt.date || mt.date === "2026-11-21");
  if (todayMeetings.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
        <div class="text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5"><i data-lucide="calendar-check-2" class="w-3.5 h-3.5 text-teal-600"></i><span>Hôm nay chưa có lịch họp nào</span></div>
        <div class="text-[11px] text-slate-400">Không gian yên tĩnh tuyệt vời để tập trung xử lý việc sâu! Bấm <b>+ Thêm lịch</b> nếu cần đặt hẹn.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = todayMeetings.map((mt, idx) => `
    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2 group">
      <div class="min-w-0">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 text-[10px] font-extrabold rounded ${idx % 2 === 0 ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'} shrink-0">${mt.time}</span>
          <span class="text-xs font-bold text-slate-800 truncate">${mt.title}</span>
        </div>
        <div class="text-[11px] text-slate-500 mt-1 truncate">${mt.partner ? mt.partner + ' • ' : ''}${mt.attendees || 'Bryan'}</div>
      </div>
      <div class="flex items-center space-x-1 shrink-0">
        <button onclick="showToast('Đang mở phòng họp trực tuyến...')" class="p-1.5 text-teal-700 hover:bg-teal-100 rounded-lg transition" title="Vào phòng họp"><i data-lucide="video" class="w-4 h-4"></i></button>
        <button onclick="deleteMeeting('${mt.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition opacity-0 group-hover:opacity-100" title="Xóa lịch"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function openNewMeetingModal(presetDate) {
  const prefs = typeof getUserNotifPrefs === "function" ? getUserNotifPrefs() : { defaultMeetingReminder: "15", channels: { bell: true, popup: true, email: true } };
  document.getElementById("meet-title").value = "";
  document.getElementById("meet-date").value = presetDate || new Date().toISOString().slice(0, 10);
  document.getElementById("meet-time").value = "10:00 - 11:00";
  document.getElementById("meet-partner").value = "";
  document.getElementById("meet-attendees").value = "";
  const remSel = document.getElementById("meet-reminder-select");
  if (remSel) remSel.value = String(prefs.defaultMeetingReminder || "15");
  const chBell = document.getElementById("meet-ch-bell");
  const chPopup = document.getElementById("meet-ch-popup");
  const chEmail = document.getElementById("meet-ch-email");
  if (chBell) chBell.checked = prefs.channels?.bell !== false;
  if (chPopup) chPopup.checked = prefs.channels?.popup !== false;
  if (chEmail) chEmail.checked = prefs.channels?.email !== false;
  document.getElementById("modal-new-meeting").classList.remove("hidden");
}

function closeNewMeetingModal() {
  document.getElementById("modal-new-meeting").classList.add("hidden");
}

function handleSaveMeeting(e) {
  e.preventDefault();
  const title = document.getElementById("meet-title").value.trim();
  const date = document.getElementById("meet-date").value || new Date().toISOString().slice(0, 10);
  const time = document.getElementById("meet-time").value.trim() || "Trong ngày";
  const partner = document.getElementById("meet-partner").value.trim();
  const attendees = document.getElementById("meet-attendees").value.trim() || "Bryan";
  const reminderVal = document.getElementById("meet-reminder-select")?.value || "15";
  const notifyChannels = [];
  if (document.getElementById("meet-ch-bell")?.checked) notifyChannels.push("bell");
  if (document.getElementById("meet-ch-popup")?.checked) notifyChannels.push("popup");
  if (document.getElementById("meet-ch-email")?.checked) notifyChannels.push("email");

  const beforeMeetings = JSON.parse(JSON.stringify(state.meetings));
  const newMt = {
    id: "mt-" + Date.now().toString().slice(-4),
    date: date,
    time: time,
    title: title,
    partner: partner,
    attendees: attendees,
    reminder_minutes: reminderVal,
    notify_channels: notifyChannels.join(",")
  };
  state.meetings.push(newMt);
  saveStateStorage();
  closeNewMeetingModal();
  renderDashboardMeetings();
  if (typeof renderCalendarView === "function") renderCalendarView();
  if (typeof runAutomationRules === "function") runAutomationRules("MEETING_CREATED", { title, merchantName: partner, pic: attendees });
  if (typeof pushUndoAction === "function") {
    pushUndoAction({
      module: "CALENDAR",
      action_type: "CREATE",
      entity_id: newMt.id,
      display_label: title,
      before: { meetings: beforeMeetings },
      after: { meetings: state.meetings },
      toastMessage: `Đã lên lịch họp "${title}" lúc ${time}.`
    });
  } else {
    showToast(`Đã lên lịch họp "${title}" lúc ${time}.`);
  }
}

function deleteMeeting(mtId) {
  const target = state.meetings.find(m => m.id === mtId);
  const beforeMeetings = JSON.parse(JSON.stringify(state.meetings));
  state.meetings = state.meetings.filter(m => m.id !== mtId);
  saveStateStorage();
  renderDashboardMeetings();
  if (typeof renderCalendarView === "function") renderCalendarView();
  if (typeof pushUndoAction === "function") {
    pushUndoAction({
      module: "CALENDAR",
      action_type: "DELETE",
      entity_id: mtId,
      display_label: target ? target.title : mtId,
      before: { meetings: beforeMeetings },
      after: { meetings: state.meetings },
      toastMessage: `Đã xóa lịch họp${target ? ': "' + target.title + '"' : ''}.`
    });
  } else {
    showToast("Đã xóa lịch họp.");
  }
}

function renderDashboardUpcomingDeadlines() {
  const container = document.getElementById("dash-upcoming-deadlines");
  if (!container) return;

  const items = [];
  // Gom dự án đang chạy có due_date
  state.projects.filter(p => !p.is_archived && p.progress < 100 && p.due_date).forEach(p => {
    const m = state.merchants.find(item => item.id === p.merchant_id);
    items.push({
      kind: "DỰ ÁN",
      title: p.title,
      sub: m ? m.name : "Chuỗi",
      due_date: p.due_date,
      action: `selectMerchant('${p.merchant_id}'); selectSubTab('${p.id}'); navigateTo('PROJECTS');`
    });
  });

  // Gom đầu việc chưa xong có due_date
  state.tasks.filter(t => t.stage !== 'STAGE_DONE' && t.due_date).forEach(t => {
    const p = state.projects.find(proj => proj.id === t.project_id);
    const m = p ? state.merchants.find(item => item.id === p.merchant_id) : null;
    items.push({
      kind: "ĐẦU VIỆC",
      title: t.title,
      sub: m ? m.name : "Nội bộ",
      due_date: t.due_date,
      action: `navigateTo('TASKS');`
    });
  });

  items.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const topItems = items.slice(0, 6);

  if (topItems.length === 0) {
    container.innerHTML = `<div class="col-span-3 p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">Không có cột mốc hay hạn chót nào sắp tới!</div>`;
    return;
  }

  const today = new Date("2026-11-21");
  container.innerHTML = topItems.map(it => {
    const diffDays = Math.ceil((new Date(it.due_date) - today) / (1000 * 60 * 60 * 24));
    let badge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700">Còn ${diffDays} ngày</span>`;
    if (diffDays < 0) {
      badge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700">Quá hạn ${Math.abs(diffDays)} ngày</span>`;
    } else if (diffDays <= 3) {
      badge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">Sắp tới (${diffDays} ngày)</span>`;
    }

    return `
      <div onclick="${it.action}" class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 cursor-pointer transition space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded ${it.kind === 'DỰ ÁN' ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-700'}">${it.kind}</span>
          ${badge}
        </div>
        <div class="text-xs font-bold text-slate-800 truncate" title="${it.title}">${it.title}</div>
        <div class="text-[11px] text-slate-500 flex items-center justify-between">
          <span>${it.sub}</span>
          <span class="font-mono font-semibold text-slate-600">${it.due_date}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderDashboardProjectsProgress() {
  const container = document.getElementById("dash-projects-progress");
  if (!container) return;

  const activeProjs = state.projects.filter(p => !p.is_archived && p.progress < 100).slice(0, 4);
  if (activeProjs.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">Tất cả dự án đã vận hành chính thức!</div>`;
    return;
  }

  container.innerHTML = activeProjs.map(p => {
    const m = state.merchants.find(item => item.id === p.merchant_id);
    return `
      <div onclick="selectMerchant('${p.merchant_id}'); selectSubTab('${p.id}'); navigateTo('PROJECTS');" class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-500 cursor-pointer transition space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="font-bold text-xs text-slate-800 truncate">${m ? m.name : ''} • ${p.title}</span>
          <span class="font-black text-xs text-teal-700 shrink-0">${p.progress}%</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-1.5">
          <div class="bg-teal-600 h-1.5 rounded-full" style="width: ${p.progress}%"></div>
        </div>
        <div class="text-[11px] text-slate-500 flex items-center justify-between">
          <span class="truncate mr-2">${p.milestone_name}</span>
          <span class="shrink-0 ${p.is_blocked ? 'text-rose-600 font-bold' : 'text-slate-500'}">${p.is_blocked ? '⚠ Vướng mắc' : p.due_date}</span>
        </div>
      </div>
    `;
  }).join('');
}

function toggleTaskDone(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.stage = task.stage === 'STAGE_DONE' ? 'STAGE_DOING' : 'STAGE_DONE';
    task.completed_at = task.stage === 'STAGE_DONE' ? new Date().toISOString() : null;
    saveStateStorage();
    showToast(`✓ Đã cập nhật trạng thái đầu việc!`);
    updateAllKpis();
    renderDashboardQuickTasks();
    renderMerchantWorkspaceBody();
    if (typeof renderTasksMainView === "function") renderTasksMainView();
  }
}

// -------------------------------------------------------------
// GIAO DIỆN (SÁNG / TỐI / HỆ THỐNG) & FEEDBACK GỬI VỀ BRYAN
// -------------------------------------------------------------
const THEME_STORAGE_KEY = "bryan_portal_theme_v1";

function applyAppearanceTheme(mode) {
  const saved = mode || localStorage.getItem(THEME_STORAGE_KEY) || "light";
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved === "dark" || (saved === "system" && prefersDark);

  document.documentElement.classList.toggle("theme-dark", isDark);

  const iconEl = document.getElementById("theme-toggle-icon");
  const labelEl = document.getElementById("theme-toggle-label");
  if (iconEl) {
    iconEl.setAttribute("data-lucide", saved === "dark" ? "moon" : (saved === "system" ? "monitor" : "sun"));
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
  if (labelEl) {
    labelEl.textContent = saved === "dark" ? "Tối" : (saved === "system" ? "Hệ thống" : "Sáng");
  }
}

function cycleAppearanceTheme() {
  const current = localStorage.getItem(THEME_STORAGE_KEY) || "light";
  const order = ["light", "dark", "system"];
  const next = order[(order.indexOf(current) + 1) % order.length];
  localStorage.setItem(THEME_STORAGE_KEY, next);
  applyAppearanceTheme(next);
}

function ensureFeedbackModal() {
  if (document.getElementById("modal-feedback")) return;
  const div = document.createElement("div");
  div.id = "modal-feedback";
  div.className = "hidden fixed inset-0 z-[10002] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="text-sm font-black">Gửi Feedback &amp; Đề Xuất Cải Tiến</h3>
        <button onclick="document.getElementById('modal-feedback').classList.add('hidden')" class="text-slate-300 hover:text-white text-sm">✕</button>
      </div>
      <form onsubmit="submitUserFeedback(event)" class="p-5 space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Chủ đề góp ý</label>
          <select id="feedback-type" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold">
            <option value="Đề xuất tính năng mới">Đề xuất tính năng mới</option>
            <option value="Góp ý giao diện (UI/UX)">Góp ý giao diện (UI/UX)</option>
            <option value="Báo lỗi hệ thống">Báo lỗi hệ thống</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Nội dung chi tiết *</label>
          <textarea id="feedback-content" rows="4" required placeholder="Mô tả ý kiến hoặc vấn đề bạn gặp phải..." class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"></textarea>
        </div>
        <div class="text-[11px] text-slate-400">
          Góp ý sẽ được gửi trực tiếp về email quản trị: <strong class="text-slate-600">quangtritc1805@gmail.com</strong>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onclick="document.getElementById('modal-feedback').classList.add('hidden')" class="px-3.5 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">Hủy</button>
          <button type="submit" id="btn-submit-feedback" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold">Gửi Feedback →</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}

function openFeedbackModal() {
  ensureFeedbackModal();
  const ta = document.getElementById("feedback-content");
  if (ta) ta.value = "";
  document.getElementById("modal-feedback").classList.remove("hidden");
  if (typeof closeMobileSidebar === "function") closeMobileSidebar();
}

async function submitUserFeedback(e) {
  e.preventDefault();
  const type = document.getElementById("feedback-type")?.value || "Góp ý";
  const content = (document.getElementById("feedback-content")?.value || "").trim();
  if (!content) return;

  const senderEmail = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "user";
  const senderName = document.getElementById("sidebar-user-name")?.textContent?.trim() || senderEmail;
  const btn = document.getElementById("btn-submit-feedback");
  if (btn) { btn.disabled = true; btn.textContent = "Đang gửi..."; }

  try {
    if (typeof postDataToGoogleSheets === "function") {
      await postDataToGoogleSheets({
        action: "SEND_REMINDER_EMAIL",
        recipient_email: "quangtritc1805@gmail.com",
        subject: `[BPortal Feedback - ${type}] từ ${senderName}`,
        body: `Người gửi: ${senderName} (${senderEmail})\nChủ đề: ${type}\nThời gian: ${new Date().toLocaleString("vi-VN")}\n\nNội dung:\n${content}`
      });
    }
    document.getElementById("modal-feedback").classList.add("hidden");
    if (typeof showToast === "function") showToast("✓ Đã gửi Feedback tới quangtritc1805@gmail.com!");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Gửi Feedback →"; }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  applyAppearanceTheme();
});


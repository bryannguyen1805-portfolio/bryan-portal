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
  if (h >= 5 && h < 12) return { prefix: "Chào buổi sáng", emoji: "☀️" };
  if (h >= 12 && h < 18) return { prefix: "Chiều năng suất nhé", emoji: "☕" };
  return { prefix: "Buổi tối nhẹ nhàng", emoji: "🌙" };
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
    checkBtn.classList.add("bg-emerald-500", "border-emerald-500");
    checkBtn.classList.remove("border-amber-400");
    if (icon) icon.classList.remove("hidden");
    input.classList.add("line-through", "text-slate-400");
    input.classList.remove("text-slate-800");
  } else {
    checkBtn.classList.remove("bg-emerald-500", "border-emerald-500");
    checkBtn.classList.add("border-amber-400");
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
    showToast("🎉 Tuyệt vời! Bạn đã hoàn thành mục tiêu trọng tâm hôm nay!");
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
    const { prefix, emoji } = getTimeGreetingMeta();
    titleEl.innerHTML = `${prefix}, <span class="text-amber-300">${safeName}</span> ${emoji}`;
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

function renderBnewsMorningBriefing() {
  const box = document.getElementById("bnews-morning-briefing");
  if (!box) return;
  const bnewsUrl = getBnewsUrl();
  const isRead = localStorage.getItem(getBnewsReadTodayKey()) === "1";

  if (isRead) {
    box.innerHTML = `
      <div class="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/70 space-y-2.5 text-slate-800">
        <div class="flex items-center justify-between gap-2">
          <img src="${BNEWS_LOGO_LIGHT_URL}" alt="Bnews" class="h-5 w-auto object-contain" />
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
          <img src="${BNEWS_LOGO_LIGHT_URL}" alt="Bnews" class="h-5 w-auto object-contain" />
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
      <div class="h-8 px-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2 text-emerald-800 font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span>Tiến độ toàn hệ thống thông suốt</span>
        </div>
        <span class="text-[11px] text-emerald-700 font-bold">0 vướng mắc</span>
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

function renderDashboardQuickTasks() {
  const container = document.getElementById("dash-quick-tasks");
  if (!container) return;

  const priorityRank = { "KHẨN CẤP": 1, "CAO": 2, "TRUNG BÌNH": 3 };
  const quickTasks = state.tasks
    .filter(t => t.stage !== 'STAGE_DONE')
    .sort((a, b) => (priorityRank[a.priority] || 9) - (priorityRank[b.priority] || 9))
    .slice(0, 4);

  let html = quickTasks.map(t => {
    const proj = state.projects.find(p => p.id === t.project_id);
    const m = proj ? state.merchants.find(merchant => merchant.id === proj.merchant_id) : null;

    let typeBadge = 'Thương mại';
    let typeCls = 'bg-purple-100 text-purple-700';
    if (t.type === 'TECH_DELIVERY') { typeBadge = 'Kỹ thuật'; typeCls = 'bg-blue-100 text-blue-700'; }
    if (t.type === 'PERSONAL') { typeBadge = 'Cá nhân'; typeCls = 'bg-slate-200 text-slate-700'; }

    return `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:border-teal-300 transition">
        <div class="flex items-center space-x-2.5 min-w-0">
          <input type="checkbox" onchange="toggleTaskDone('${t.id}')" class="w-4 h-4 accent-teal-600 rounded cursor-pointer shrink-0">
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 truncate">${t.title}</div>
            <div class="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
              <span class="px-1.5 py-0.2 rounded font-bold ${typeCls}">${typeBadge}</span>
              <span class="text-slate-500 font-semibold">${m ? m.name : 'Nội bộ'}</span>
              <span class="text-slate-300">•</span>
              <span class="${t.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-500'}">Hạn: ${t.due_date}</span>
            </div>
          </div>
        </div>

        <span class="shrink-0 px-2 py-0.5 rounded text-[9px] font-extrabold ${
          t.priority === 'KHẨN CẤP' ? 'bg-rose-100 text-rose-700' :
          t.priority === 'CAO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
        }">${t.priority}</span>
      </div>
    `;
  }).join('');

  if (quickTasks.length === 0) {
    html = `
      <div class="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-200/60 text-center space-y-1.5">
        <div class="text-sm font-extrabold text-emerald-800">✨ Mọi việc ưu tiên hôm nay đã gọn gàng!</div>
        <div class="text-xs text-emerald-700/80">Bạn có thể thêm việc mới hoặc dành thời gian cho mục tiêu chiến lược.</div>
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
        <div class="text-xs font-bold text-slate-600">🌿 Hôm nay chưa có lịch họp nào</div>
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
          <span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded ${it.kind === 'DỰ ÁN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${it.kind}</span>
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


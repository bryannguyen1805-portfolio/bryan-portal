// -------------------------------------------------------------
// 13. UNIFIED SMART CALENDAR ENGINE (LỊCH THÁNG + LỘ TRÌNH CỘT MỐC)
// -------------------------------------------------------------
function getCalendarTodayInfo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  const weekdays = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return {
    year: y,
    month: m,
    day: d,
    weekdayIdx: now.getDay(),
    weekdayLabel: weekdays[now.getDay()],
    shortDate: `${dd}/${mm}`,
    iso: `${y}-${mm}-${dd}`
  };
}

const _initToday = getCalendarTodayInfo();
let calYear = _initToday.year;
let calMonth = _initToday.month; // 0-indexed
let selectedCalendarDate = _initToday.iso;
let calendarFilter = "ALL"; // ALL | MEETING | PROJECT | TASK
let calendarMode = "MONTH"; // MONTH | TIMELINE

function changeCalendarMonth(delta) {
  calMonth += delta;
  if (calMonth < 0) {
    calMonth = 11;
    calYear--;
  } else if (calMonth > 11) {
    calMonth = 0;
    calYear++;
  }
  renderCalendarView();
}

function goToTodayCalendar() {
  const today = getCalendarTodayInfo();
  calYear = today.year;
  calMonth = today.month;
  selectedCalendarDate = today.iso;
  renderCalendarView();
}

function setCalendarFilter(f) {
  calendarFilter = f;
  ['ALL', 'MEETING', 'PROJECT', 'TASK'].forEach(key => {
    const btn = document.getElementById(`cal-filter-${key}`);
    if (btn) {
      if (key === f) {
        btn.className = "px-3 py-1.5 rounded-full font-bold bg-teal-600 text-white transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap";
      } else {
        btn.className = "px-3 py-1.5 rounded-full font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5 shrink-0 whitespace-nowrap";
      }
    }
  });
  renderCalendarView();
}

function setCalendarMode(mode) {
  calendarMode = mode;
  const btnM = document.getElementById("cal-mode-MONTH");
  const btnT = document.getElementById("cal-mode-TIMELINE");
  const vM = document.getElementById("cal-view-month");
  const vT = document.getElementById("cal-view-timeline");

  if (mode === "MONTH") {
    btnM.className = "px-3 py-1 rounded-lg bg-white text-teal-700 shadow-2xs";
    btnT.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900";
    vM.classList.remove("hidden");
    vT.classList.add("hidden");
  } else {
    btnT.className = "px-3 py-1 rounded-lg bg-white text-teal-700 shadow-2xs";
    btnM.className = "px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900";
    vT.classList.remove("hidden");
    vM.classList.add("hidden");
  }
  renderCalendarView();
}

function selectCalendarDay(dateStr) {
  selectedCalendarDate = dateStr;
  renderCalendarGrid();
  renderCalendarDayDetails();
}

function getAllCalendarEvents() {
  const events = [];

  // 1. Lịch họp
  if (calendarFilter === "ALL" || calendarFilter === "MEETING") {
    (state.meetings || []).forEach(mt => {
      const d = mt.date || "2026-11-21";
      events.push({
        id: mt.id,
        kind: "MEETING",
        date: d,
        time: mt.time,
        title: mt.title,
        sub: (mt.partner ? mt.partner + " • " : "") + (mt.attendees || "Bryan"),
        raw: mt
      });
    });
  }

  // 2. Cột mốc Dự án
  if (calendarFilter === "ALL" || calendarFilter === "PROJECT") {
    state.projects.filter(p => p.due_date).forEach(p => {
      const m = state.merchants.find(item => item.id === p.merchant_id);
      events.push({
        id: p.id,
        kind: "PROJECT",
        date: p.due_date,
        title: p.title,
        sub: `${m ? m.name : ""} • ${p.milestone_name} (${p.progress}%)`,
        isDone: p.is_archived || p.progress >= 100,
        isBlocked: p.is_blocked,
        merchantId: p.merchant_id,
        raw: p
      });
    });
  }

  // 3. Hạn chót Đầu việc
  if (calendarFilter === "ALL" || calendarFilter === "TASK") {
    state.tasks.filter(t => t.due_date).forEach(t => {
      const p = state.projects.find(proj => proj.id === t.project_id);
      const m = p ? state.merchants.find(item => item.id === p.merchant_id) : null;
      events.push({
        id: t.id,
        kind: "TASK",
        date: t.due_date,
        title: t.title,
        sub: `${m ? m.name : "Nội bộ"} • Phụ trách: ${t.pic}`,
        isDone: t.stage === "STAGE_DONE",
        isOverdue: t.is_overdue && t.stage !== "STAGE_DONE",
        raw: t
      });
    });
  }

  return events;
}

function renderCalendarView() {
  const labelEl = document.getElementById("cal-month-label");
  if (labelEl) labelEl.textContent = `Tháng ${calMonth + 1} / ${calYear}`;

  if (calendarMode === "MONTH") {
    renderCalendarGrid();
    renderCalendarDayDetails();
  } else {
    renderCalendarTimeline();
  }
}

function renderCalendarGrid() {
  const grid = document.getElementById("cal-grid-cells");
  if (!grid) return;

  const todayInfo = getCalendarTodayInfo();
  const todayBtn = document.getElementById("cal-today-btn");
  if (todayBtn) {
    todayBtn.textContent = `Hôm nay • ${todayInfo.weekdayLabel} (${todayInfo.shortDate})`;
  }

  // Highlight cột Thứ của hôm nay khi đang xem tháng hiện tại (giống Google Calendar)
  const isViewingCurrentMonth = calYear === todayInfo.year && calMonth === todayInfo.month;
  document.querySelectorAll("[data-cal-weekday]").forEach(el => {
    const wd = Number(el.getAttribute("data-cal-weekday"));
    const isTodayCol = isViewingCurrentMonth && wd === todayInfo.weekdayIdx;
    if (isTodayCol) {
      el.className = "py-1 mx-1 rounded-lg bg-teal-50 text-teal-700 font-black";
    } else if (wd === 0) {
      el.className = "py-1 mx-1 rounded-lg text-rose-600";
    } else {
      el.className = "py-1 mx-1 rounded-lg";
    }
  });

  const events = getAllCalendarEvents();
  const firstDay = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // JS getDay(): 0 = CN, 1 = T2 ... -> đổi sang 0 = T2, 6 = CN
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  let cellsHtml = "";
  const prevMonthDate = new Date(calYear, calMonth, 0);
  const prevMonthDays = prevMonthDate.getDate();
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  // Các ngày cuối tháng trước (hiển thị nhạt hơn để phân biệt)
  for (let i = 0; i < startOffset; i++) {
    const prevDay = prevMonthDays - startOffset + 1 + i;
    const pmm = String(prevMonth + 1).padStart(2, "0");
    const pdd = String(prevDay).padStart(2, "0");
    const prevIso = `${prevYear}-${pmm}-${pdd}`;
    cellsHtml += `
      <div onclick="selectedCalendarDate='${prevIso}'; changeCalendarMonth(-1);" class="min-h-[58px] md:min-h-[104px] bg-slate-50/70 p-1 md:p-2 cursor-pointer transition hover:bg-slate-100 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1">
          <span class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[11px] md:text-xs font-normal text-slate-500">${prevDay}</span>
        </div>
      </div>
    `;
  }

  // Các ngày trong tháng
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(calMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${calYear}-${mm}-${dd}`;

    const isToday = dateStr === todayInfo.iso;
    const isSelected = dateStr === selectedCalendarDate;
    const dayEvents = events.filter(ev => ev.date === dateStr);

    const pillsHtml = dayEvents.slice(0, 3).map(ev => {
      let cls = "bg-teal-100 text-teal-800";
      let label = (ev.time ? ev.time.split("-")[0].trim() + " " : "") + ev.title;
      if (ev.kind === "PROJECT") {
        cls = ev.isBlocked ? "bg-rose-100 text-rose-800" : "bg-teal-50 text-teal-800 border border-teal-200/60";
        const partnerShort = ev.sub ? ev.sub.split("•")[0].trim() : ev.title;
        label = partnerShort;
      } else if (ev.kind === "TASK") {
        if (ev.isDone) cls = "bg-slate-100 text-slate-400 line-through";
        else if (ev.isOverdue) cls = "bg-rose-100 text-rose-700 font-bold";
        else cls = "bg-slate-100 text-slate-700";
      }
      return `<div class="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${cls}" title="${ev.title} (${ev.sub || ''})">${label}</div>`;
    }).join('');

    const dotsHtml = dayEvents.slice(0, 4).map(ev => {
      let dotCls = "bg-teal-500";
      if (ev.kind === "PROJECT") dotCls = ev.isBlocked ? "bg-rose-500" : "bg-teal-600";
      else if (ev.kind === "TASK") dotCls = ev.isDone ? "bg-slate-300" : (ev.isOverdue ? "bg-rose-500" : "bg-amber-500");
      return `<span class="w-1.5 h-1.5 rounded-full ${dotCls}"></span>`;
    }).join('');

    const moreHtml = dayEvents.length > 3
      ? `<div class="text-[9px] font-bold text-slate-400 pl-1">+${dayEvents.length - 3} mục khác</div>`
      : "";

    cellsHtml += `
      <div onclick="selectCalendarDay('${dateStr}')" class="min-h-[58px] md:min-h-[104px] p-1 md:p-2 cursor-pointer transition hover:bg-teal-50/30 flex flex-col justify-between ${
        isSelected ? 'bg-teal-50/50 ring-2 ring-inset ring-teal-500' : 'bg-white'
      }">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[11px] md:text-xs font-extrabold ${
              isToday ? 'bg-teal-600 text-white' : (isSelected ? 'text-teal-800 font-black' : 'text-slate-900')
            }">${d}</span>
            ${dayEvents.length > 0 ? `<span class="text-[9px] font-bold text-slate-500">${dayEvents.length}</span>` : ''}
          </div>
          <div class="md:hidden flex flex-wrap items-center gap-0.5 pt-0.5">
            ${dotsHtml}
          </div>
          <div class="hidden md:block space-y-1">
            ${pillsHtml}
            ${moreHtml}
          </div>
        </div>
      </div>
    `;
  }

  // Các ngày đầu tháng sau (lấp đầy tuần cuối, hiển thị nhạt hơn)
  const totalRendered = startOffset + daysInMonth;
  const trailingCount = (7 - (totalRendered % 7)) % 7;
  const nextMonthDate = new Date(calYear, calMonth + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth();
  for (let nd = 1; nd <= trailingCount; nd++) {
    const nmm = String(nextMonth + 1).padStart(2, "0");
    const ndd = String(nd).padStart(2, "0");
    const nextIso = `${nextYear}-${nmm}-${ndd}`;
    cellsHtml += `
      <div onclick="selectedCalendarDate='${nextIso}'; changeCalendarMonth(1);" class="min-h-[58px] md:min-h-[104px] bg-slate-50/70 p-1 md:p-2 cursor-pointer transition hover:bg-slate-100 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1">
          <span class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[11px] md:text-xs font-normal text-slate-500">${nd}</span>
        </div>
      </div>
    `;
  }

  grid.innerHTML = cellsHtml;
}

function renderCalendarDayDetails() {
  const labelEl = document.getElementById("cal-selected-date-label");
  const listEl = document.getElementById("cal-day-details-list");
  if (!listEl) return;

  const parts = selectedCalendarDate.split("-");
  if (labelEl && parts.length === 3) {
    labelEl.textContent = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const events = getAllCalendarEvents().filter(ev => ev.date === selectedCalendarDate);

  if (events.length === 0) {
    listEl.innerHTML = `
      <div class="p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
        <div class="text-xs font-semibold text-slate-400">Ngày này chưa có lịch họp hay hạn chót nào.</div>
        <button onclick="openNewMeetingModal('${selectedCalendarDate}')" class="text-xs font-bold text-teal-600 hover:underline">+ Lên lịch họp cho ngày này</button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = events.map(ev => {
    if (ev.kind === "MEETING") {
      return `
        <div class="p-3 rounded-xl bg-teal-50/50 border border-teal-200 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800">🟢 LỊCH HỌP • ${ev.time}</span>
            <button onclick="deleteMeeting('${ev.id}')" class="text-slate-400 hover:text-rose-600 p-0.5" title="Xóa lịch"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
          <div class="text-xs font-bold text-slate-900">${ev.title}</div>
          <div class="text-[11px] text-slate-500">${ev.sub}</div>
        </div>
      `;
    }
    if (ev.kind === "PROJECT") {
      const partnerName = ev.sub ? ev.sub.split("•")[0].trim() : ev.title;
      const stageDetail = ev.sub && ev.sub.includes("•") ? ev.sub.split("•").slice(1).join("•").trim() : "";
      return `
        <div onclick="selectMerchant('${ev.merchantId}'); selectSubTab('${ev.id}'); navigateTo('PROJECTS');" class="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-400 cursor-pointer transition space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-50 text-teal-800">CỘT MỐC DỰ ÁN</span>
            <span class="text-[10px] font-bold text-teal-700">Mở dự án →</span>
          </div>
          <div class="text-xs font-bold text-slate-900">${partnerName}</div>
          <div class="text-[11px] text-slate-500">${ev.title}${stageDetail ? ' • ' + stageDetail : ''}</div>
        </div>
      `;
    }
    // TASK
    return `
      <div class="p-3 rounded-xl ${ev.isOverdue ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'} border space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${ev.isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}">
            ${ev.isOverdue ? 'TRỄ HẠN ĐẦU VIỆC' : 'HẠN CHÓT ĐẦU VIỆC'}
          </span>
          <input type="checkbox" aria-label="Đánh dấu hoàn thành ${ev.title}" ${ev.isDone ? 'checked' : ''} onchange="toggleTaskDone('${ev.id}'); renderCalendarView();" class="w-4 h-4 accent-teal-600 rounded cursor-pointer">
        </div>
        <div class="text-xs font-bold ${ev.isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${ev.title}</div>
        <div class="text-[11px] text-slate-500">${ev.sub}</div>
      </div>
    `;
  }).join('');
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function renderCalendarTimeline() {
  const list = document.getElementById("cal-timeline-list");
  if (!list) return;

  const events = getAllCalendarEvents().sort((a, b) => new Date(a.date) - new Date(b.date));
  if (events.length === 0) {
    list.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Chưa có sự kiện hay cột mốc nào.</div>`;
    return;
  }

  list.innerHTML = events.map(ev => {
    const p = ev.date.split("-");
    const vnDate = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : ev.date;

    let badge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800">LỊCH HỌP ${ev.time ? '• ' + ev.time : ''}</span>`;
    let clickAttr = "";
    if (ev.kind === "PROJECT") {
      badge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-50 text-teal-800">CỘT MỐC DỰ ÁN</span>`;
      clickAttr = `onclick="selectMerchant('${ev.merchantId}'); selectSubTab('${ev.id}'); navigateTo('PROJECTS');"`;
    } else if (ev.kind === "TASK") {
      badge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${ev.isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">${ev.isOverdue ? 'QUÁ HẠN' : 'HẠN ĐẦU VIỆC'}</span>`;
    }

    return `
      <div ${clickAttr} class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 ${clickAttr ? 'hover:border-teal-400 cursor-pointer' : ''} flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition">
        <div class="flex items-center space-x-3 min-w-0">
          <div class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-800 shrink-0 font-mono">${vnDate}</div>
          <div class="min-w-0">
            <div class="flex items-center space-x-2 mb-0.5">${badge}</div>
            <div class="text-xs font-bold text-slate-900 truncate ${ev.isDone ? 'line-through text-slate-400' : ''}">${ev.title}</div>
            <div class="text-[11px] text-slate-500 truncate">${ev.sub}</div>
          </div>
        </div>
        ${ev.kind === "PROJECT" ? `<span class="text-xs font-bold text-teal-600 shrink-0">Mở dự án →</span>` : ''}
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// INITIALIZATION (Chunked across frames to keep TBT = 0ms)
// -------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  syncGraduatedOnboardingToState();
  if (typeof autoPruneCompletedTasksOlderThan30Days === "function") autoPruneCompletedTasksOlderThan30Days();
  updateSyncStatusUI();
  updateAllKpis();

  const yieldFrame = (fn) => setTimeout(fn, 0);

  yieldFrame(() => {
    renderDashboardMeetings();
    renderDashboardBlockers();
    renderDashboardQuickTasks();
    renderDashboardOnboardingSummary();
    renderDashboardProjectsProgress();
    renderDashboardUpcomingDeadlines();

    yieldFrame(() => {
      renderMerchantPillsBar();
      renderMerchantSubTabs();
      renderMerchantWorkspaceBody();
      if (typeof renderTasksMainView === "function") renderTasksMainView();
      renderOnboardingView();
      renderCharts();
      syncAutomationCheckboxes();
      renderNotificationLogs();
      updateNotificationDot();
      if (typeof lucide !== "undefined") lucide.createIcons();

      yieldFrame(() => {
        if (API_ENDPOINT) {
          syncDataFromGoogleSheets();
        }
        if (notificationLogs.length === 0) {
          addNotificationLog("Bryan Portal khởi động thành công. Sẵn sàng điều phối B2B Delivery!");
        }
      });
    });
  });
});

// -------------------------------------------------------------
// ĐỒNG BỘ GOOGLE CALENDAR & APPLE CALENDAR (KHÔNG CẦN UP FILE)
// -------------------------------------------------------------
function getCalendarSubscribeUrl() {
  const apiUrl = (typeof API_ENDPOINT !== "undefined" && API_ENDPOINT) ? API_ENDPOINT : (localStorage.getItem("bryan_portal_api") || "");
  if (!apiUrl) return "";
  const email = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "";
  const pin = typeof getCurrentUserPin === "function" ? getCurrentUserPin() : "";
  const sep = apiUrl.includes("?") ? "&" : "?";
  return `${apiUrl}${sep}action=ics&user_email=${encodeURIComponent(email)}&user_pin=${encodeURIComponent(pin)}`;
}

function ensureCalendarSyncModal() {
  if (document.getElementById("modal-calendar-sync")) return;
  const div = document.createElement("div");
  div.id = "modal-calendar-sync";
  div.className = "hidden fixed inset-0 z-[10001] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="text-sm font-black">Đồng Bộ Google Calendar &amp; Apple Calendar</h3>
        <button onclick="document.getElementById('modal-calendar-sync').classList.add('hidden')" class="text-slate-300 hover:text-white text-sm">✕</button>
      </div>
      <div class="p-5 space-y-4 text-xs">
        <div class="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 space-y-2">
          <div class="font-extrabold text-teal-900">1. Đồng bộ 2 chiều Google Calendar (Tự động)</div>
          <p class="text-teal-800/90 leading-relaxed">Mỗi lần bạn tạo/sửa/xóa lịch họp trên Portal, hệ thống tự đẩy lên Google Calendar của bạn. Bấm nút dưới để kéo thêm lịch từ Google Calendar về Portal ngay:</p>
          <button type="button" onclick="syncWithGoogleCalendarNow()" id="btn-gcal-sync-now" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition">
            🔄 Đồng bộ 2 chiều Google Calendar ngay
          </button>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="font-extrabold text-slate-900">2. Link Đăng Ký Tự Động cho Apple Calendar (iPhone / Mac) &amp; Google Calendar</div>
          <p class="text-slate-600 leading-relaxed">Không cần tải hay up file: copy link dưới đây dán 1 lần vào Apple Calendar (<i>Cài đặt → Lịch → Tài khoản → Thêm lịch đã đăng ký</i>) hoặc Google Calendar (<i>Other calendars → From URL</i>), lịch sẽ tự cập nhật:</p>
          <div class="flex items-center gap-2">
            <input id="cal-ics-url-input" type="text" readonly class="flex-1 p-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] text-slate-700 outline-none" />
            <button type="button" onclick="copyCalendarSubscribeLink()" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shrink-0">Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

function openCalendarSyncModal() {
  ensureCalendarSyncModal();
  const inp = document.getElementById("cal-ics-url-input");
  if (inp) inp.value = getCalendarSubscribeUrl() || "Chưa cấu hình URL Google Apps Script";
  document.getElementById("modal-calendar-sync").classList.remove("hidden");
}

function copyCalendarSubscribeLink() {
  const url = getCalendarSubscribeUrl();
  if (!url) {
    showToast("Chưa có URL Google Apps Script.", true);
    return;
  }
  navigator.clipboard?.writeText(url).then(() => {
    showToast("✓ Đã copy Link đồng bộ Lịch! Dán vào Apple Calendar / Google Calendar để tự động cập nhật.");
  }).catch(() => {
    const inp = document.getElementById("cal-ics-url-input");
    if (inp) { inp.select(); document.execCommand("copy"); }
    showToast("✓ Đã copy Link đồng bộ Lịch!");
  });
}

async function syncWithGoogleCalendarNow() {
  const apiUrl = (typeof API_ENDPOINT !== "undefined" && API_ENDPOINT) ? API_ENDPOINT : (localStorage.getItem("bryan_portal_api") || "");
  if (!apiUrl) {
    showToast("Chưa cấu hình URL Google Apps Script.", true);
    return;
  }
  const btn = document.getElementById("btn-gcal-sync-now");
  if (btn) { btn.disabled = true; btn.textContent = "Đang đồng bộ..."; }
  try {
    const email = typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "";
    const pin = typeof getCurrentUserPin === "function" ? getCurrentUserPin() : "";
    const sep = apiUrl.includes("?") ? "&" : "?";
    const res = await fetch(`${apiUrl}${sep}action=syncGoogleCalendar&user_email=${encodeURIComponent(email)}&user_pin=${encodeURIComponent(pin)}`);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.meetings)) {
      state.meetings = data.meetings;
      localStorage.setItem(getUserStateStorageKey(), JSON.stringify(state));
      renderCalendarView();
      if (typeof renderDashboardMeetings === "function") renderDashboardMeetings();
      showToast(`✓ Đã đồng bộ 2 chiều (${state.meetings.length} lịch họp) với Google Calendar!`);
    } else {
      showToast(data?.error || "Không thể đồng bộ Google Calendar. Hãy kiểm tra quyền Calendar trên Apps Script.", true);
    }
  } catch (err) {
    showToast("Lỗi kết nối khi đồng bộ Google Calendar.", true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "🔄 Đồng bộ 2 chiều Google Calendar ngay"; }
  }
}

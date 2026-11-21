// -------------------------------------------------------------
// 13. UNIFIED SMART CALENDAR ENGINE (LỊCH THÁNG + LỘ TRÌNH CỘT MỐC)
// -------------------------------------------------------------
let calYear = 2026;
let calMonth = 10; // 0-indexed: 10 = Tháng 11
let selectedCalendarDate = "2026-11-21";
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
  calYear = 2026;
  calMonth = 10;
  selectedCalendarDate = "2026-11-21";
  renderCalendarView();
}

function setCalendarFilter(f) {
  calendarFilter = f;
  ['ALL', 'MEETING', 'PROJECT', 'TASK'].forEach(key => {
    const btn = document.getElementById(`cal-filter-${key}`);
    if (btn) {
      if (key === f) {
        btn.className = "px-3 py-1.5 rounded-xl font-bold bg-teal-600 text-white transition flex items-center space-x-1.5";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5";
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

  const events = getAllCalendarEvents();
  const firstDay = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // JS getDay(): 0 = CN, 1 = T2 ... -> đổi sang 0 = T2, 6 = CN
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  let cellsHtml = "";

  // Ô trống đầu tháng
  for (let i = 0; i < startOffset; i++) {
    cellsHtml += `<div class="min-h-[104px] bg-slate-50/60 p-2"></div>`;
  }

  // Các ngày trong tháng
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(calMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${calYear}-${mm}-${dd}`;

    const isToday = dateStr === "2026-11-21";
    const isSelected = dateStr === selectedCalendarDate;
    const dayEvents = events.filter(ev => ev.date === dateStr);

    const pillsHtml = dayEvents.slice(0, 3).map(ev => {
      let cls = "bg-teal-100 text-teal-800";
      let prefix = ev.time ? ev.time.split("-")[0].trim() + " " : "";
      if (ev.kind === "PROJECT") {
        cls = ev.isBlocked ? "bg-rose-100 text-rose-800" : "bg-purple-100 text-purple-800";
        prefix = "Mốc: ";
      } else if (ev.kind === "TASK") {
        if (ev.isDone) cls = "bg-slate-100 text-slate-400 line-through";
        else if (ev.isOverdue) cls = "bg-rose-100 text-rose-700 font-bold";
        else cls = "bg-amber-100 text-amber-800";
      }
      return `<div class="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${cls}" title="${ev.title}">${prefix}${ev.title}</div>`;
    }).join('');

    const moreHtml = dayEvents.length > 3
      ? `<div class="text-[9px] font-bold text-slate-400 pl-1">+${dayEvents.length - 3} mục khác</div>`
      : "";

    cellsHtml += `
      <div onclick="selectCalendarDay('${dateStr}')" class="min-h-[104px] p-2 cursor-pointer transition hover:bg-teal-50/30 flex flex-col justify-between ${
        isSelected ? 'bg-teal-50/50 ring-2 ring-inset ring-teal-500' : 'bg-white'
      }">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isToday ? 'bg-teal-600 text-white' : (isSelected ? 'text-teal-800 font-black' : 'text-slate-700')
            }">${d}</span>
            ${dayEvents.length > 0 ? `<span class="text-[9px] font-bold text-slate-400">${dayEvents.length}</span>` : ''}
          </div>
          <div class="space-y-1">
            ${pillsHtml}
            ${moreHtml}
          </div>
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
      return `
        <div onclick="selectMerchant('${ev.merchantId}'); selectSubTab('${ev.id}'); navigateTo('PROJECTS');" class="p-3 rounded-xl bg-purple-50/50 border border-purple-200 hover:border-purple-400 cursor-pointer transition space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">🟣 CỘT MỐC DỰ ÁN</span>
            <span class="text-[10px] font-bold text-purple-700">Mở dự án →</span>
          </div>
          <div class="text-xs font-bold text-slate-900">${ev.title}</div>
          <div class="text-[11px] text-slate-500">${ev.sub}</div>
        </div>
      `;
    }
    // TASK
    return `
      <div class="p-3 rounded-xl ${ev.isOverdue ? 'bg-rose-50/60 border-rose-200' : 'bg-amber-50/40 border-amber-200'} border space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${ev.isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">
            ${ev.isOverdue ? '🔴 TRỄ HẠN ĐẦU VIỆC' : '🟠 HẠN CHÓT ĐẦU VIỆC'}
          </span>
          <input type="checkbox" ${ev.isDone ? 'checked' : ''} onchange="toggleTaskDone('${ev.id}'); renderCalendarView();" class="w-4 h-4 accent-teal-600 rounded cursor-pointer">
        </div>
        <div class="text-xs font-bold ${ev.isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${ev.title}</div>
        <div class="text-[11px] text-slate-500">${ev.sub}</div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
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
      badge = `<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">CỘT MỐC DỰ ÁN</span>`;
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
// INITIALIZATION
// -------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  syncGraduatedOnboardingToState();
  if (typeof autoPruneCompletedTasksOlderThan30Days === "function") autoPruneCompletedTasksOlderThan30Days();
  lucide.createIcons();
  updateSyncStatusUI();
  updateAllKpis();
  renderDashboardMeetings();
  renderDashboardBlockers();
  renderDashboardQuickTasks();
  renderDashboardOnboardingSummary();
  renderDashboardProjectsProgress();
  renderDashboardUpcomingDeadlines();
  renderMerchantPillsBar();
  renderMerchantSubTabs();
  renderMerchantWorkspaceBody();
  if (typeof renderTasksMainView === "function") renderTasksMainView();
  renderOnboardingView();
  renderCharts();
  syncAutomationCheckboxes();
  renderNotificationLogs();
  updateNotificationDot();

  if (API_ENDPOINT) {
    syncDataFromGoogleSheets();
  }

  if (notificationLogs.length === 0) {
    addNotificationLog("Bryan Portal khởi động thành công. Sẵn sàng điều phối B2B Delivery!");
  }
});

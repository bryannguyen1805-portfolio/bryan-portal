// -------------------------------------------------------------
// 6. TASKS & MULTI-VIEW
// -------------------------------------------------------------
function switchTaskView(viewMode) {
  activeTaskView = viewMode;
  const btnList = document.getElementById("btn-view-list");
  const btnCards = document.getElementById("btn-view-cards");
  const btnKanban = document.getElementById("btn-view-kanban");
  const cList = document.getElementById("container-task-list");
  const cCards = document.getElementById("container-task-cards");
  const cKanban = document.getElementById("container-task-kanban");

  const activeCls = "px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-teal-700 shadow-xs flex items-center space-x-1";
  const idleCls = "px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1";

  if (btnList) btnList.className = viewMode === 'LIST' ? activeCls : idleCls;
  if (btnCards) btnCards.className = viewMode === 'CARDS' ? activeCls : idleCls;
  if (btnKanban) btnKanban.className = viewMode === 'KANBAN' ? activeCls : idleCls;

  if (cList) cList.classList.toggle('hidden', viewMode !== 'LIST');
  if (cCards) cCards.classList.toggle('hidden', viewMode !== 'CARDS');
  if (cKanban) cKanban.classList.toggle('hidden', viewMode !== 'KANBAN');

  renderTasksMainView();
}

let activeTaskStatusFilter = 'OPEN';
let taskPageLimit = 12;
let draggedTaskId = null;

function showMoreTasks() {
  taskPageLimit += 12;
  renderTasksMainView();
}

function clearCompletedTasks() {
  const doneCount = state.tasks.filter(t => t.stage === 'STAGE_DONE').length;
  if (doneCount === 0) {
    showToast("Không có đầu việc đã hoàn tất nào để dọn.");
    return;
  }
  const beforeTasks = JSON.parse(JSON.stringify(state.tasks));
  state.tasks = state.tasks.filter(t => t.stage !== 'STAGE_DONE');
  syncAllAfterTaskChange(`Đã dọn ${doneCount} đầu việc đã hoàn tất`);
  if (typeof pushUndoAction === "function") {
    pushUndoAction({
      module: "TODO",
      action_type: "DELETE",
      entity_id: "bulk-done",
      display_label: `${doneCount} việc đã hoàn tất`,
      before: { tasks: beforeTasks },
      after: { tasks: state.tasks },
      toastMessage: `Đã dọn gọn ${doneCount} việc đã hoàn tất.`
    });
  } else {
    showToast(`Đã dọn gọn ${doneCount} việc đã hoàn tất.`);
  }
}

function getTodayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTaskOverdueDays(task) {
  if (!task || task.stage === 'STAGE_DONE' || !task.due_date) return 0;
  const todayStr = getTodayIsoDate();
  if (task.due_date >= todayStr) return 0;
  const diffMs = new Date(todayStr + 'T00:00:00') - new Date(task.due_date + 'T00:00:00');
  return Math.max(1, Math.round(diffMs / 86400000));
}

function refreshTasksOverdueFlags() {
  state.tasks.forEach(t => {
    t.is_overdue = getTaskOverdueDays(t) > 0;
  });
}

function updateNotificationDot(skipViewRefresh = false) {
  const badge = document.getElementById("badge-notif-count");
  const topBellCount = document.getElementById("topbar-bell-count");
  const alerts = typeof getActiveAlerts === "function" ? getActiveAlerts() : [];
  const count = typeof getUnreadAlertsCount === "function" ? getUnreadAlertsCount(alerts) : alerts.length;
  if (badge) {
    badge.textContent = count;
    if (count > 0) {
      badge.className = "sidebar-badge px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 rounded font-bold whitespace-nowrap shrink-0";
    } else {
      badge.className = "sidebar-badge px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-bold whitespace-nowrap shrink-0";
    }
  }
  if (topBellCount) {
    topBellCount.textContent = count;
    topBellCount.classList.toggle("hidden", count === 0);
  }
  if (!skipViewRefresh) {
    if (typeof renderTopbarNotifPopover === "function") {
      const pop = document.getElementById("topbar-notif-popover");
      if (pop && !pop.classList.contains("hidden")) renderTopbarNotifPopover();
    }
    const notifView = document.getElementById("view-NOTIFICATIONS");
    if (notifView && !notifView.classList.contains("hidden") && typeof renderNotificationsView === "function") {
      renderNotificationsView();
    }
  }
}

function syncAllAfterTaskChange(logMessage) {
  refreshTasksOverdueFlags();
  saveStateStorage();
  updateAllKpis();
  renderTasksMainView();
  renderDashboardQuickTasks();
  if (typeof renderDashboardUpcomingDeadlines === "function") renderDashboardUpcomingDeadlines();
  renderMerchantWorkspaceBody();
  if (typeof renderCalendarView === "function") renderCalendarView();
  updateNotificationDot();
  if (logMessage && typeof addNotificationLog === "function") {
    addNotificationLog(logMessage);
  }
}

function filterTasksByType(type) {
  activeTaskTypeFilter = type;
  ['ALL', 'COMMERCIAL', 'TECH_DELIVERY', 'PERSONAL'].forEach(t => {
    const btn = document.getElementById(`filter-type-${t}`);
    if (btn) {
      if (t === type) {
        btn.className = "px-3 py-1 text-xs font-bold rounded-lg bg-teal-600 text-white shadow-xs";
      } else {
        btn.className = "px-3 py-1 text-xs font-bold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-100";
      }
    }
  });
  renderTasksMainView();
}

function filterTasksByStatus(status) {
  activeTaskStatusFilter = status;
  const activeClasses = {
    ALL: "px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white shadow-xs transition",
    OPEN: "px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-600 text-white shadow-xs transition",
    OVERDUE: "px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 text-white shadow-xs transition",
    DONE: "px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-xs transition"
  };
  ['ALL', 'OPEN', 'OVERDUE', 'DONE'].forEach(s => {
    const btn = document.getElementById(`filter-status-${s}`);
    if (!btn) return;
    btn.className = s === status
      ? activeClasses[s]
      : "px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition";
  });
  renderTasksMainView();
}

function resetTaskFilters() {
  activeTaskStatusFilter = 'ALL';
  activeTaskTypeFilter = 'ALL';
  const sInput = document.getElementById("filter-task-search");
  const mSel = document.getElementById("filter-task-merchant");
  const pSel = document.getElementById("filter-task-priority");
  if (sInput) sInput.value = "";
  if (mSel) mSel.value = "ALL";
  if (pSel) pSel.value = "ALL";
  filterTasksByType('ALL');
  filterTasksByStatus('ALL');
}

function populateTaskMerchantFilter() {
  const sel = document.getElementById("filter-task-merchant");
  if (!sel) return;
  const currentVal = sel.value || "ALL";
  sel.innerHTML = `<option value="ALL">Tất cả chuỗi đối tác</option>` +
    state.merchants.map(m => `<option value="${m.id}">${m.name}</option>`).join('') +
    `<option value="INTERNAL">Nội bộ Bryan</option>`;
  if (Array.from(sel.options).some(o => o.value === currentVal)) {
    sel.value = currentVal;
  }
}

function updateTaskStatusCounts() {
  refreshTasksOverdueFlags();
  const allCount = state.tasks.length;
  const doneCount = state.tasks.filter(t => t.stage === 'STAGE_DONE').length;
  const overdueCount = state.tasks.filter(t => t.stage !== 'STAGE_DONE' && getTaskOverdueDays(t) > 0).length;
  const openCount = allCount - doneCount;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt("count-status-ALL", allCount);
  setTxt("count-status-OPEN", openCount);
  setTxt("count-status-OVERDUE", overdueCount);
  setTxt("count-status-DONE", doneCount);
}

function renderTasksMainView() {
  populateTaskMerchantFilter();
  updateTaskStatusCounts();
  if (activeTaskView === 'LIST') {
    renderTasksList();
  } else if (activeTaskView === 'CARDS') {
    renderTasksCards();
  } else {
    renderTasksKanban();
    const pagEl = document.getElementById("container-task-pagination");
    if (pagEl) pagEl.innerHTML = "";
  }
}

function renderTaskPagination(totalCount, shownCount) {
  const pagEl = document.getElementById("container-task-pagination");
  if (!pagEl) return;
  if (totalCount <= shownCount) {
    pagEl.innerHTML = totalCount > 0 ? `<div class="text-[11px] text-slate-400 text-center">Đang hiển thị ${shownCount}/${totalCount} đầu việc</div>` : "";
    return;
  }
  const remain = totalCount - shownCount;
  pagEl.innerHTML = `
    <div class="flex items-center justify-center gap-3 pt-2">
      <span class="text-xs text-slate-400">Đang hiện ${shownCount}/${totalCount} đầu việc</span>
      <button onclick="showMoreTasks()" class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition">Xem thêm ${Math.min(12, remain)} việc nữa</button>
    </div>
  `;
}

function renderTasksList() {
  const container = document.getElementById("container-task-list");
  if (!container) return;

  const allTasks = getFilteredTasks();
  const tasks = allTasks.slice(0, taskPageLimit);
  renderTaskPagination(allTasks.length, tasks.length);

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <p class="text-sm font-bold text-slate-700">Không có đầu việc nào ở bộ lọc này</p>
        <button onclick="resetTaskFilters()" class="mt-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition">Xem tất cả</button>
      </div>
    `;
    return;
  }

  container.innerHTML = tasks.map(t => {
    const proj = state.projects.find(p => p.id === t.project_id);
    const merchant = proj ? state.merchants.find(m => m.id === proj.merchant_id) : null;
    const isDone = t.stage === 'STAGE_DONE';
    const overdueDays = getTaskOverdueDays(t);
    return `
      <div class="px-3.5 py-2.5 rounded-xl border ${overdueDays > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-teal-400 transition text-xs">
        <div class="flex items-center space-x-2.5 min-w-0 flex-1">
          <button onclick="toggleTaskQuickDone('${t.id}')" class="shrink-0 ${isDone ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}" title="Hoàn tất nhanh">
            <i data-lucide="check-circle-2" class="w-4 h-4"></i>
          </button>
          <span class="font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}">${t.title}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">${merchant ? merchant.name : 'Nội bộ'}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[11px] ${overdueDays > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}">${t.due_date || ''}${overdueDays > 0 ? ' (Trễ ' + overdueDays + 'd)' : ''}</span>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${t.priority === 'KHẨN CẤP' ? 'bg-rose-100 text-rose-700' : (t.priority === 'CAO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}">${t.priority}</span>
          <select onchange="updateTaskStage('${t.id}', this.value)" class="text-[11px] font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 outline-none">
            <option value="STAGE_BACKLOG" ${t.stage === 'STAGE_BACKLOG' ? 'selected' : ''}>1. Chuẩn bị</option>
            <option value="STAGE_TODO" ${(!t.stage || t.stage === 'STAGE_TODO') ? 'selected' : ''}>2. Cần làm</option>
            <option value="STAGE_DOING" ${t.stage === 'STAGE_DOING' ? 'selected' : ''}>3. Đang làm</option>
            <option value="STAGE_REVIEW" ${t.stage === 'STAGE_REVIEW' ? 'selected' : ''}>4. Đang duyệt</option>
            <option value="STAGE_DONE" ${t.stage === 'STAGE_DONE' ? 'selected' : ''}>5. Hoàn tất</option>
          </select>
          <button onclick="openEditTaskModal('${t.id}')" class="p-1 text-slate-400 hover:text-teal-600"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
          <button onclick="deleteTask('${t.id}')" class="p-1 text-slate-400 hover:text-rose-600"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function getFilteredTasks() {
  refreshTasksOverdueFlags();
  const priority = document.getElementById("filter-task-priority")?.value || "ALL";
  const merchantFilter = document.getElementById("filter-task-merchant")?.value || "ALL";
  const searchQ = (document.getElementById("filter-task-search")?.value || "").trim().toLowerCase();

  const priorityRank = { 'KHẨN CẤP': 0, 'CAO': 1, 'TRUNG BÌNH': 2 };

  return state.tasks
    .filter(t => {
      if (activeTaskTypeFilter !== 'ALL' && t.type !== activeTaskTypeFilter) return false;
      if (priority !== 'ALL' && t.priority !== priority) return false;

      if (activeTaskStatusFilter === 'OPEN' && t.stage === 'STAGE_DONE') return false;
      if (activeTaskStatusFilter === 'DONE' && t.stage !== 'STAGE_DONE') return false;
      if (activeTaskStatusFilter === 'OVERDUE' && (t.stage === 'STAGE_DONE' || getTaskOverdueDays(t) === 0)) return false;

      const proj = state.projects.find(p => p.id === t.project_id);
      const mId = proj ? proj.merchant_id : "INTERNAL";
      if (merchantFilter !== 'ALL' && mId !== merchantFilter) return false;

      if (searchQ) {
        const merchant = proj ? state.merchants.find(m => m.id === proj.merchant_id) : null;
        const hay = `${t.title} ${t.pic || ''} ${merchant ? merchant.name : 'Nội bộ Bryan'} ${proj ? proj.title : ''}`.toLowerCase();
        if (!hay.includes(searchQ)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aDone = a.stage === 'STAGE_DONE' ? 1 : 0;
      const bDone = b.stage === 'STAGE_DONE' ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;

      const aOver = getTaskOverdueDays(a) > 0 ? 0 : 1;
      const bOver = getTaskOverdueDays(b) > 0 ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;

      const pDiff = (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3);
      if (pDiff !== 0) return pDiff;

      return (a.due_date || '9999-12-31').localeCompare(b.due_date || '9999-12-31');
    });
}

function toggleTaskQuickDone(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  const nextStage = task.stage === 'STAGE_DONE' ? 'STAGE_TODO' : 'STAGE_DONE';
  updateTaskStage(taskId, nextStage);
}

function renderTasksCards() {
  const container = document.getElementById("container-task-cards");
  if (!container) return;

  const allTasks = getFilteredTasks();
  const tasks = allTasks.slice(0, taskPageLimit);
  renderTaskPagination(allTasks.length, tasks.length);
  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <p class="text-sm font-bold text-slate-700">Không tìm thấy đầu việc nào phù hợp</p>
        <p class="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc tạo đầu việc mới</p>
        <button onclick="resetTaskFilters()" class="mt-3 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition">Xóa bộ lọc</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = tasks.map(t => {
    const proj = state.projects.find(p => p.id === t.project_id);
    const merchant = proj ? state.merchants.find(m => m.id === proj.merchant_id) : null;
    const isDone = t.stage === 'STAGE_DONE';
    const overdueDays = getTaskOverdueDays(t);
    const isOverdue = overdueDays > 0;

    let badgeText = '📋 THƯƠNG MẠI';
    let badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
    if (t.type === 'TECH_DELIVERY') {
      badgeText = '⚙️ KỸ THUẬT';
      badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (t.type === 'PERSONAL') {
      badgeText = '👤 CÁ NHÂN';
      badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
    }

    return `
      <div class="bg-white p-4 rounded-2xl border ${isOverdue ? 'border-rose-300 bg-rose-50/20' : (isDone ? 'border-emerald-200 bg-emerald-50/10 opacity-85' : 'border-slate-200')} shadow-xs flex flex-col justify-between space-y-3 transition">
        <div>
          <div class="flex items-center justify-between mb-2 gap-2">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded border ${badgeColor} whitespace-nowrap">
              ${badgeText}
            </span>
            <div class="flex items-center space-x-1">
              <button onclick="toggleTaskQuickDone('${t.id}')" class="p-1 rounded-lg transition ${isDone ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}" title="${isDone ? 'Mở lại việc' : 'Đánh dấu hoàn tất nhanh'}">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              </button>
              <button onclick="openEditTaskModal('${t.id}')" class="text-slate-400 hover:text-teal-600 p-1" title="Sửa đầu việc">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="deleteTask('${t.id}')" class="text-slate-400 hover:text-rose-600 p-1" title="Xóa đầu việc">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded whitespace-nowrap ${
                t.priority === 'KHẨN CẤP' ? 'bg-rose-100 text-rose-700' :
                t.priority === 'CAO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
              }">${t.priority}</span>
            </div>
          </div>

          <h4 class="text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}">${t.title}</h4>
          <div class="text-[11px] text-slate-500 mt-1.5 flex items-center flex-wrap gap-1">
            ${merchant
              ? `<button onclick="openMerchantWorkspace('${merchant.id}')" class="font-semibold text-teal-700 hover:underline text-left">${merchant.name}</button>`
              : `<span class="font-semibold text-slate-600">Nội bộ Bryan</span>`
            }
            ${proj ? `<span class="text-slate-400 truncate max-w-[210px]">• ${proj.title}</span>` : ''}
          </div>
          <p class="text-[10px] text-slate-400 mt-1">Phụ trách: <span class="font-semibold text-slate-600">${t.pic || 'Bryan'}</span></p>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
          <div>
            <span class="text-slate-400">Hạn chót:</span>
            <span class="${isOverdue ? 'text-rose-600 font-bold' : (isDone ? 'text-emerald-700 font-semibold' : 'text-slate-700 font-medium')}">${t.due_date || 'Chưa đặt'}</span>
            ${isOverdue ? `<span class="text-[10px] text-rose-600 font-bold block">Quá hạn ${overdueDays} ngày</span>` : ''}
            ${isDone ? '<span class="text-[10px] text-emerald-600 font-bold block">✓ Đã hoàn tất</span>' : ''}
          </div>

          <select onchange="updateTaskStage('${t.id}', this.value)" class="text-[11px] font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 outline-none">
            <option value="STAGE_BACKLOG" ${t.stage === 'STAGE_BACKLOG' ? 'selected' : ''}>1. Chuẩn bị</option>
            <option value="STAGE_TODO" ${(!t.stage || t.stage === 'STAGE_TODO') ? 'selected' : ''}>2. Cần làm</option>
            <option value="STAGE_DOING" ${t.stage === 'STAGE_DOING' ? 'selected' : ''}>3. Đang làm</option>
            <option value="STAGE_REVIEW" ${t.stage === 'STAGE_REVIEW' ? 'selected' : ''}>4. Đang duyệt</option>
            <option value="STAGE_DONE" ${t.stage === 'STAGE_DONE' ? 'selected' : ''}>5. Hoàn tất</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function dragTaskStart(ev, taskId) {
  draggedTaskId = taskId;
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData("text/plain", taskId);
  }
}

function dragTaskOver(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add("ring-2", "ring-teal-400", "bg-teal-50/40");
}

function dragTaskLeave(ev) {
  ev.currentTarget.classList.remove("ring-2", "ring-teal-400", "bg-teal-50/40");
}

function dropTaskToStage(ev, stageId) {
  ev.preventDefault();
  ev.currentTarget.classList.remove("ring-2", "ring-teal-400", "bg-teal-50/40");
  const taskId = draggedTaskId || (ev.dataTransfer ? ev.dataTransfer.getData("text/plain") : null);
  draggedTaskId = null;
  if (taskId) {
    updateTaskStage(taskId, stageId);
  }
}

function renderTasksKanban() {
  const container = document.getElementById("container-task-kanban");
  if (!container) return;

  const columns = [
    { id: 'STAGE_BACKLOG', title: '1. CHUẨN BỊ' },
    { id: 'STAGE_TODO', title: '2. CẦN LÀM' },
    { id: 'STAGE_DOING', title: '3. ĐANG LÀM' },
    { id: 'STAGE_REVIEW', title: '4. ĐANG DUYỆT' },
    { id: 'STAGE_DONE', title: '5. HOÀN TẤT' }
  ];

  const tasks = getFilteredTasks();

  container.innerHTML = columns.map(col => {
    const colTasks = tasks.filter(t => t.stage === col.id || (col.id === 'STAGE_TODO' && !t.stage));

    return `
      <div ondragover="dragTaskOver(event)" ondragleave="dragTaskLeave(event)" ondrop="dropTaskToStage(event, '${col.id}')" class="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col min-h-[380px] transition">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs font-bold text-slate-700">
          <span>${col.title}</span>
          <span class="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">${colTasks.length}</span>
        </div>

        <div class="space-y-2 flex-1">
          ${colTasks.map(t => {
            const overdueDays = getTaskOverdueDays(t);
            const proj = state.projects.find(p => p.id === t.project_id);
            const merchant = proj ? state.merchants.find(m => m.id === proj.merchant_id) : null;
            return `
            <div draggable="true" ondragstart="dragTaskStart(event, '${t.id}')" class="bg-white p-3 rounded-xl border ${overdueDays > 0 ? 'border-rose-300' : 'border-slate-200'} shadow-xs space-y-1.5 cursor-grab active:cursor-grabbing hover:border-teal-400 transition">
              <div class="flex items-center justify-between text-[10px]">
                <span class="font-bold ${t.type === 'COMMERCIAL' ? 'text-purple-700' : (t.type === 'TECH_DELIVERY' ? 'text-blue-700' : 'text-slate-600')}">
                  ${t.type === 'COMMERCIAL' ? '📋 Thương mại' : (t.type === 'TECH_DELIVERY' ? '⚙️ Kỹ thuật' : '👤 Cá nhân')}
                </span>
                <div class="flex items-center space-x-1">
                  <button onclick="toggleTaskQuickDone('${t.id}')" class="${t.stage === 'STAGE_DONE' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}" title="Hoàn tất nhanh"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i></button>
                  <button onclick="openEditTaskModal('${t.id}')" class="text-slate-400 hover:text-teal-600" title="Sửa"><i data-lucide="edit-3" class="w-3 h-3"></i></button>
                </div>
              </div>
              <div class="text-xs font-bold ${t.stage === 'STAGE_DONE' ? 'line-through text-slate-400' : 'text-slate-800'}">${t.title}</div>
              ${merchant ? `<div class="text-[10px] font-semibold text-teal-700">${merchant.name}</div>` : ''}
              <div class="flex items-center justify-between text-[10px] text-slate-400">
                <span>Phụ trách: ${t.pic} • ${t.due_date}</span>
                ${overdueDays > 0 ? `<span class="text-rose-600 font-bold">-${overdueDays}d</span>` : ''}
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function updateTaskStage(taskId, newStage) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    const beforeTasks = JSON.parse(JSON.stringify(state.tasks));
    task.stage = newStage;
    task.completed_at = newStage === 'STAGE_DONE' ? new Date().toISOString() : null;
    const labelMap = {
      STAGE_BACKLOG: 'Chuẩn bị',
      STAGE_TODO: 'Cần làm',
      STAGE_DOING: 'Đang làm',
      STAGE_REVIEW: 'Đang duyệt',
      STAGE_DONE: 'Hoàn tất'
    };
    syncAllAfterTaskChange(`Đầu việc "${task.title}" → ${labelMap[newStage] || newStage}`);
    if (typeof pushUndoAction === "function") {
      pushUndoAction({
        module: "TODO",
        action_type: newStage === "STAGE_DONE" ? "COMPLETE" : "UPDATE",
        entity_id: task.id,
        display_label: task.title,
        before: { tasks: beforeTasks },
        after: { tasks: state.tasks },
        toastMessage: newStage === "STAGE_DONE"
          ? `Đã hoàn thành việc: "${task.title}".`
          : `Đã chuyển "${task.title}" sang ${labelMap[newStage] || newStage}.`
      });
    } else {
      showToast(`Đã chuyển sang: ${labelMap[newStage] || newStage}`);
    }
    if (newStage === 'STAGE_DONE' && typeof runAutomationRules === "function") {
      runAutomationRules("TASK_DONE", { title: task.title, project_id: task.project_id, pic: task.pic, taskObj: task });
    }
  }
}

function deleteTask(taskId) {
  const target = state.tasks.find(t => t.id === taskId);
  if (!target) return;
  const beforeTasks = JSON.parse(JSON.stringify(state.tasks));
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  syncAllAfterTaskChange(`Đã xóa đầu việc "${target.title}"`);
  if (typeof pushUndoAction === "function") {
    pushUndoAction({
      module: "TODO",
      action_type: "DELETE",
      entity_id: taskId,
      display_label: target.title,
      before: { tasks: beforeTasks },
      after: { tasks: state.tasks },
      toastMessage: `Đã xóa việc: "${target.title}".`
    });
  } else {
    showToast(`Đã xóa việc: "${target.title}".`);
  }
}

// Tự động xóa các đầu việc đã hoàn tất quá 30 ngày (T+30)
function autoPruneCompletedTasksOlderThan30Days(nowMs = Date.now()) {
  const THIRTY_DAYS_MS = 30 * 86400000;
  const beforeLen = state.tasks.length;
  state.tasks = state.tasks.filter(t => {
    if (t.stage !== 'STAGE_DONE') return true;
    const refStr = t.completed_at || (t.due_date ? t.due_date + 'T00:00:00' : null);
    if (!refStr) return true;
    const doneMs = new Date(refStr).getTime();
    if (Number.isNaN(doneMs)) return true;
    return (nowMs - doneMs) < THIRTY_DAYS_MS;
  });
  const prunedCount = beforeLen - state.tasks.length;
  if (prunedCount > 0) {
    saveStateStorage();
    if (typeof addNotificationLog === "function") {
      addNotificationLog(`Đã tự động dọn ${prunedCount} đầu việc hoàn tất quá 30 ngày (T+30)`);
    }
  }
  return prunedCount;
}


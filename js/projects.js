// -------------------------------------------------------------
// 4. MERCHANT WORKSPACE SUB-NAVIGATION (TỔNG QUAN VS TRANG RIÊNG TỪNG DỰ ÁN)
// -------------------------------------------------------------
let showMerchantDirectory = false;
let merchantDirSearch = "";
let merchantDirFilter = "ALL"; // ALL | BLOCKED | ACTIVE | LIVE

function toggleMerchantDirectory() {
  showMerchantDirectory = !showMerchantDirectory;
  renderMerchantPillsBar();
  renderMerchantDirectoryPanel();
}

function selectMerchant(mId) {
  activeMerchantId = mId;
  activeSubTab = "OVERVIEW";
  showMerchantDirectory = false;
  renderMerchantPillsBar();
  renderMerchantDirectoryPanel();
  renderMerchantSubTabs();
  renderMerchantWorkspaceBody();
}

function closeActiveMerchantToDirectory() {
  showMerchantDirectory = true;
  renderMerchantPillsBar();
  renderMerchantDirectoryPanel();
}

function selectSubTab(subTabId) {
  activeSubTab = subTabId;
  renderMerchantSubTabs();
  renderMerchantWorkspaceBody();
}

function renderMerchantPillsBar() {
  const container = document.getElementById("merchant-pills-bar");
  if (!container) return;

  const dirBtnHtml = `
    <button onclick="toggleMerchantDirectory()" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 border ${
      showMerchantDirectory ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
    }">
      <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
      <span>Danh sách chuỗi (${state.merchants.length})</span>
    </button>
  `;

  const activeMerchant = state.merchants.find(m => m.id === activeMerchantId);
  const singleSwitcherHtml = !showMerchantDirectory && activeMerchant ? `
    <div class="flex items-center gap-1.5 bg-teal-50/70 border border-teal-200 rounded-full pl-2 pr-1.5 py-1 shrink-0">
      <span class="w-5 h-5 rounded-full ${activeMerchant.color} text-white text-[10px] flex items-center justify-center font-black shrink-0">
        ${activeMerchant.avatar_letter}
      </span>
      <select onchange="if(this.value) selectMerchant(this.value)" class="bg-transparent border-none text-xs font-extrabold text-slate-900 outline-none cursor-pointer pr-1 max-w-[220px]" title="Chọn chuỗi đối tác đang xem">
        ${state.merchants.map(m => {
          const hasBlk = state.projects.some(p => p.merchant_id === m.id && p.is_blocked);
          return `<option value="${m.id}" ${m.id === activeMerchantId ? 'selected' : ''}>${hasBlk ? '⚠ ' : ''}${m.name}</option>`;
        }).join('')}
      </select>
      <button onclick="closeActiveMerchantToDirectory()" class="w-5 h-5 rounded-full hover:bg-teal-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition" title="Đóng chuỗi này để về Danh sách chuỗi">×</button>
    </div>
  ` : '';

  container.innerHTML = dirBtnHtml + singleSwitcherHtml;
  lucide.createIcons();
}

function renderMerchantDirectoryPanel() {
  const panel = document.getElementById("merchant-directory-panel");
  const wsBody = document.getElementById("merchant-workspace-body");
  const subTabs = document.getElementById("merchant-subtabs-bar");
  if (!panel) return;

  if (!showMerchantDirectory) {
    panel.classList.add("hidden");
    if (wsBody) wsBody.classList.remove("hidden");
    if (subTabs) subTabs.parentElement?.classList.remove("hidden");
    return;
  }

  panel.classList.remove("hidden");
  if (wsBody) wsBody.classList.add("hidden");

  const q = merchantDirSearch.trim().toLowerCase();
  const rows = state.merchants.filter(m => {
    const projs = state.projects.filter(p => p.merchant_id === m.id);
    const hasBlk = projs.some(p => p.is_blocked);
    const hasActive = projs.some(p => !p.is_archived && p.progress < 100);
    if (merchantDirFilter === "BLOCKED" && !hasBlk) return false;
    if (merchantDirFilter === "ACTIVE" && !hasActive) return false;
    if (merchantDirFilter === "LIVE" && (hasActive || projs.length === 0)) return false;
    if (q) {
      const hay = `${m.name} ${m.industry || ''} ${m.mid || ''} ${m.acquiring_bank || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  panel.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-black text-slate-900">Danh Mục Chuỗi Đối Tác (${rows.length}/${state.merchants.length})</h3>
          <p class="text-xs text-slate-400">Tìm kiếm nhanh và theo dõi trạng thái toàn bộ chuỗi đang quản lý</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input value="${merchantDirSearch}" oninput="merchantDirSearch=this.value; renderMerchantDirectoryPanel()" type="text" placeholder="Tìm tên chuỗi, MID, ngân hàng..." class="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 w-56" />
          <div class="flex items-center gap-1 text-xs">
            ${[
              { id: "ALL", label: "Tất cả" },
              { id: "BLOCKED", label: "Có vướng mắc" },
              { id: "ACTIVE", label: "Đang triển khai" },
              { id: "LIVE", label: "Đang vận hành" }
            ].map(f => `
              <button onclick="merchantDirFilter='${f.id}'; renderMerchantDirectoryPanel()" class="px-2.5 py-1.5 rounded-xl font-bold transition ${
                merchantDirFilter === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }">${f.label}</button>
            `).join('')}
          </div>
        </div>

      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
              <th class="py-2.5 pr-3">Chuỗi Đối Tác</th>
              <th class="py-2.5 px-3">Mã MID & Ngân Hàng</th>
              <th class="py-2.5 px-3">Số Dự Án</th>
              <th class="py-2.5 px-3">Tiến Độ TB</th>
              <th class="py-2.5 px-3">Trạng Thái</th>
              <th class="py-2.5 pl-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${rows.map(m => {
              const projs = state.projects.filter(p => p.merchant_id === m.id);
              const avgPct = projs.length > 0 ? Math.round(projs.reduce((s, p) => s + (p.progress || 0), 0) / projs.length) : 100;
              const hasBlk = projs.some(p => p.is_blocked);
              return `
                <tr onclick="selectMerchant('${m.id}')" class="hover:bg-slate-50 cursor-pointer transition">
                  <td class="py-3 pr-3 font-bold text-slate-900">
                    <div class="flex items-center space-x-2.5">
                      <span class="w-7 h-7 rounded-lg ${m.color} text-white text-[11px] flex items-center justify-center font-black shrink-0">${m.avatar_letter}</span>
                      <div>
                        <div>${m.name}</div>
                        <div class="text-[10px] font-normal text-slate-400">${m.industry || 'B2B Partner'}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-3">
                    <div class="font-mono text-[11px] text-slate-700">${m.mid || ('MID_' + m.id.replace('m-','').toUpperCase())}</div>
                    <div class="text-[10px] text-slate-400">${m.acquiring_bank || 'VietinBank / Pvcombank'}</div>
                  </td>
                  <td class="py-3 px-3 font-semibold text-slate-700">${projs.length} dự án</td>
                  <td class="py-3 px-3">
                    <div class="flex items-center space-x-2">
                      <div class="w-20 bg-slate-100 rounded-full h-1.5"><div class="bg-teal-600 h-1.5 rounded-full" style="width:${avgPct}%"></div></div>
                      <span class="font-bold text-teal-700">${avgPct}%</span>
                    </div>
                  </td>
                  <td class="py-3 px-3">
                    ${hasBlk
                      ? `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">Có vướng mắc</span>`
                      : `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Thông suốt</span>`}
                  </td>
                  <td class="py-3 pl-3 text-right font-bold text-teal-700">Mở chi tiết →</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function copyWeeklyProgressReport() {
  const today = new Date().toLocaleDateString('vi-VN');
  const lines = [`BÁO CÁO TIẾN ĐỘ TRIỂN KHAI ĐỐI TÁC B2B (${today})`, `Tổng số chuỗi đang quản lý: ${state.merchants.length}`, ``];
  state.merchants.forEach((m, idx) => {
    const projs = state.projects.filter(p => p.merchant_id === m.id);
    const blk = projs.filter(p => p.is_blocked);
    const projSummary = projs.map(p => `${p.title} (${p.progress}%)`).join('; ') || 'Đang vận hành ổn định';
    lines.push(`${idx + 1}. ${m.name}: ${projSummary}${blk.length > 0 ? ' | Vướng mắc: ' + blk.map(b => b.blocker_reason).join(', ') : ''}`);
  });
  const report = lines.join('\n');
  if (navigator.clipboard) navigator.clipboard.writeText(report).catch(() => {});
  if (typeof addNotificationLog === "function") addNotificationLog(`Đã xuất & sao chép Báo cáo tiến độ tuần (${today})`);
  showToast("Đã sao chép Báo cáo tiến độ tuần vào bộ nhớ tạm!");
}

function addProjectNote(projId) {
  const input = document.getElementById(`proj-note-input-${projId}`);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const proj = state.projects.find(p => p.id === projId);
  if (!proj) return;
  proj.notes = Array.isArray(proj.notes) ? proj.notes : [];
  proj.notes.unshift({
    id: "note-" + Date.now().toString().slice(-5),
    text,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('vi-VN')
  });
  saveStateStorage();
  renderMerchantWorkspaceBody();
  showToast("Đã lưu ghi chú dự án!");
}

let showCompletedProjects = false;
let showCompletedTasks = false;

function toggleCompletedProjectsAccordion() {
  showCompletedProjects = !showCompletedProjects;
  renderMerchantWorkspaceBody();
}

function toggleCompletedTasksAccordion() {
  showCompletedTasks = !showCompletedTasks;
  renderMerchantWorkspaceBody();
}

function archiveProjectToggle(projId, event) {
  if (event) event.stopPropagation();
  const proj = state.projects.find(p => p.id === projId);
  if (!proj) return;
  if (proj.is_archived || proj.progress >= 100) {
    proj.is_archived = false;
    if (proj.progress >= 100) proj.progress = 90;
    showToast("✓ Đã khôi phục dự án về danh sách Đang Triển Khai.");
  } else {
    proj.is_archived = true;
    proj.progress = 100;
    proj.stage = "GO-LIVE";
    proj.gate_step = 5;
    showToast("✓ Đã đánh dấu Hoàn Tất & chuyển dự án vào mục Lưu Trữ!");
  }
  saveStateStorage();
  updateAllKpis();
  renderMerchantWorkspaceBody();
}

function renderMerchantSubTabs() {
  // Đã tích hợp trực tiếp vào đầu Cột Trái trong renderMerchantWorkspaceBody()
}

function renderMerchantWorkspaceBody() {
  const container = document.getElementById("merchant-workspace-body");
  if (!container) return;

  const merchant = state.merchants.find(m => m.id === activeMerchantId) || state.merchants[0];
  if (!merchant) return;

  const merchantStakeholders = state.stakeholders.filter(s => s.merchant_id === merchant.id);
  const merchantFolders = state.folders.filter(f => f.merchant_id === merchant.id);
  const merchantProjects = state.projects.filter(p => p.merchant_id === merchant.id);

  // Build Sub-Tabs HTML (Đặt gọn trong Cột Trái)
  let subTabsHtml = `
    <button onclick="selectSubTab('OVERVIEW')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
      activeSubTab === 'OVERVIEW' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }">
      <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>
      <span>Tổng Quan</span>
    </button>
  `;
  merchantProjects.forEach(p => {
    const isTabActive = activeSubTab === p.id;
    const isDoneProj = p.is_archived || p.progress >= 100;
    subTabsHtml += `
      <button onclick="selectSubTab('${p.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
        isTabActive ? 'bg-teal-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }">
        <i data-lucide="${isDoneProj ? 'check-circle-2' : 'folder'}" class="w-3.5 h-3.5 ${p.is_blocked ? 'text-rose-400 animate-pulse' : ''}"></i>
        <span class="max-w-[180px] truncate">${p.title}</span>
        ${p.is_blocked ? '<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>' : ''}
      </button>
    `;
  });
  subTabsHtml += `
    <button onclick="openNewProjectModal()" class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-teal-700 border border-dashed border-teal-300 transition flex items-center space-x-1 shrink-0">
      <i data-lucide="plus" class="w-3.5 h-3.5"></i>
      <span>Thêm Dự Án</span>
    </button>
  `;

  // CỘT PHẢI (4/12 = 33%): NHÂN SỰ 3 BÊN + THƯ MỤC MÁY TÍNH (TRA CỨU CỐ ĐỊNH)
  const rightColumnHtml = `
    <div class="lg:col-span-4 space-y-4">
      <!-- KHỐI TRA CỨU 1: NHÂN SỰ PHỤ TRÁCH 3 BÊN -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center space-x-2">
            <i data-lucide="users" class="w-4 h-4 text-teal-600"></i>
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider">Nhân Sự Phụ Trách (${merchantStakeholders.length})</h4>
          </div>
          <button onclick="openNewStakeholderModal('${merchant.id}')" class="text-[11px] text-teal-600 font-bold hover:underline flex items-center">
            <i data-lucide="user-plus" class="w-3 h-3 mr-0.5"></i> Thêm
          </button>
        </div>

        <div class="space-y-2">
          ${merchantStakeholders.length > 0 ? merchantStakeholders.map(s => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center space-x-1.5">
                  <span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                    s.group.includes('Chuỗi') ? 'bg-purple-100 text-purple-700' :
                    s.group.includes('Ngân Hàng') ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-800'
                  }">${s.group}</span>
                  <span class="text-xs font-bold text-slate-800 truncate">${s.name}</span>
                </div>
                <div class="text-[11px] text-slate-500 truncate mt-0.5">${s.role}</div>
                <div class="text-[11px] text-slate-700 font-semibold">${s.phone || 'Chưa có SĐT'}</div>
              </div>
              <div class="flex items-center space-x-1 shrink-0">
                <button onclick="openEditStakeholderModal('${s.id}')" class="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-teal-600 transition" title="Sửa">
                  <i data-lucide="edit-3" class="w-3 h-3"></i>
                </button>
                ${s.phone ? `<a href="tel:${s.phone}" class="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-teal-600 transition" title="Gọi"><i data-lucide="phone" class="w-3 h-3"></i></a>` : ''}
              </div>
            </div>
          `).join('') : `
            <div class="p-3 border border-dashed border-slate-300 rounded-xl text-center text-[11px] text-slate-400">
              Chưa có nhân sự. Bấm "+ Thêm" để lưu danh bạ 3 bên.
            </div>
          `}
        </div>

      </div>

      <!-- KHỐI TRA CỨU 2: HỒ SƠ & TÀI LIỆU DỰ ÁN -->

      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center space-x-2">
            <i data-lucide="file-text" class="w-4 h-4 text-teal-600"></i>
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider">Hồ Sơ & Tài Liệu Dự Án (${merchantFolders.length})</h4>
          </div>
          <button onclick="openNewFolderModal('${merchant.id}')" class="text-[11px] text-teal-600 font-bold hover:underline flex items-center">
            <i data-lucide="plus" class="w-3 h-3 mr-0.5"></i> Đính kèm liên kết tài liệu
          </button>
        </div>

        <div class="space-y-2">
          ${merchantFolders.length > 0 ? merchantFolders.map(f => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-slate-800 truncate">${f.title}</span>
                  ${f.badge ? `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200 shrink-0">${f.badge}</span>` : ''}
                </div>
                <div class="text-[10px] font-mono text-slate-500 truncate mt-0.5">${f.file_name || f.path}</div>
              </div>
              <div class="flex items-center space-x-1 shrink-0">
                <a href="${f.path}" target="_blank" rel="noopener" class="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-700 border border-slate-200 rounded-lg text-[10px] font-bold transition whitespace-nowrap">
                  ${f.action_label || 'Mở tài liệu'}
                </a>
                <button onclick="openEditFolderModal('${f.id}')" class="p-1 text-slate-400 hover:text-teal-600" title="Sửa">
                  <i data-lucide="edit-3" class="w-3 h-3"></i>
                </button>
                <button onclick="deleteFolder('${f.id}')" class="p-1 text-slate-400 hover:text-rose-600" title="Xóa">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
              </div>
            </div>
          `).join('') : `
            <div class="p-3 border border-dashed border-slate-300 rounded-xl text-center text-[11px] text-slate-400">
              Chưa có tài liệu số nào. Bấm "+ Đính kèm liên kết tài liệu" để thêm.
            </div>
          `}
        </div>

      </div>
    </div>
  `;

  // CỘT TRÁI (8/12 = 67%): HÀNH ĐỘNG & TIẾN ĐỘ
  let leftColumnHtml = "";

  if (activeSubTab === 'OVERVIEW') {
    const activeProjects = merchantProjects.filter(p => !p.is_archived && p.progress < 100);
    const completedProjects = merchantProjects.filter(p => p.is_archived || p.progress >= 100);

    const allMerchantTasks = state.tasks.filter(t => {
      const p = state.projects.find(proj => proj.id === t.project_id);
      return p && p.merchant_id === merchant.id;
    });
    const activeTasks = allMerchantTasks.filter(t => t.stage !== 'STAGE_DONE');
    const completedTasks = allMerchantTasks.filter(t => t.stage === 'STAGE_DONE');

    leftColumnHtml = `
      <div class="lg:col-span-8 space-y-4">
        <!-- HEADER CHUỖI + SUB-TABS TÍCH HỢP -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl ${merchant.color} text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                ${merchant.avatar_letter}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h2 class="text-lg font-black text-slate-900 tracking-tight">${merchant.name}</h2>
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">${merchant.alias}</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">${merchant.industry} • <strong class="text-teal-700">${merchant.expected_gmv}</strong></p>
              </div>
            </div>
            <button onclick="openNewTaskModalForMerchant('${merchant.id}')" class="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs shrink-0">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Tạo Đầu Việc</span>
            </button>
          </div>

          <!-- Sub-Tabs nội bộ Chuỗi -->
          <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            ${subTabsHtml}
          </div>
        </div>

        <!-- KHỐI 1: DỰ ÁN ĐANG TRIỂN KHAI -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <i data-lucide="rocket" class="w-4 h-4 text-teal-600"></i>
              <span>Dự Án Đang Triển Khai (${activeProjects.length})</span>
            </h4>
            <span class="text-[11px] text-slate-400">Click vào dự án để mở trang quản lý riêng</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${activeProjects.length > 0 ? activeProjects.map(p => `
              <div onclick="selectSubTab('${p.id}')" class="p-4 rounded-xl border ${p.is_blocked ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-slate-50/50'} hover:border-teal-500 cursor-pointer transition space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${p.stage.includes('UAT') ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
                    ${p.stage}
                  </span>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs font-black text-teal-700">${p.progress}%</span>
                    <button onclick="archiveProjectToggle('${p.id}', event)" class="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 font-bold transition" title="Đánh dấu dự án đã Go-Live hoàn tất">
                      ✓ Xong
                    </button>
                  </div>
                </div>
                <h4 class="font-bold text-xs text-slate-900 leading-snug">${p.title}</h4>
                <div class="w-full bg-slate-200 rounded-full h-1.5">
                  <div class="bg-teal-600 h-1.5 rounded-full" style="width: ${p.progress}%"></div>
                </div>
                <div class="text-[11px] text-slate-500 flex items-center justify-between">
                  <span class="truncate mr-2">${p.milestone_name}</span>
                  <span class="shrink-0 font-semibold">${p.due_date}</span>
                </div>
                ${p.is_blocked ? `<div class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 truncate">⚠ ${p.blocker_reason}</div>` : ''}
              </div>
            `).join('') : `
              <div class="col-span-2 p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Tất cả dự án của chuỗi này đã Go-Live hoàn tất! (Xem bên dưới)
              </div>
            `}
          </div>

          <!-- NGĂN THU GỌN DỰ ÁN ĐÃ HOÀN THÀNH / GO-LIVE -->
          ${completedProjects.length > 0 ? `
            <div class="pt-2 border-t border-slate-100">
              <button onclick="toggleCompletedProjectsAccordion()" class="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1.5 transition">
                <i data-lucide="${showCompletedProjects ? 'chevron-down' : 'chevron-right'}" class="w-3.5 h-3.5"></i>
                <span>✓ Dự án đã Go-Live / Hoàn thành (${completedProjects.length})</span>
              </button>
              ${showCompletedProjects ? `
                <div class="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  ${completedProjects.map(p => `
                    <div onclick="selectSubTab('${p.id}')" class="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:border-emerald-400 cursor-pointer flex items-center justify-between gap-2">
                      <div class="min-w-0">
                        <div class="text-xs font-bold text-emerald-900 truncate">${p.title}</div>
                        <div class="text-[10px] text-emerald-700">100% Go-Live • ${p.due_date}</div>
                      </div>
                      <button onclick="archiveProjectToggle('${p.id}', event)" class="shrink-0 text-[10px] px-2 py-1 bg-white border border-emerald-200 text-slate-600 hover:text-amber-700 rounded-lg font-bold">
                        Mở lại
                      </button>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- KHỐI 2: ĐẦU VIỆC CẦN XỬ LÝ (TÁCH RÕ ACTIVE VS COMPLETED) -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <i data-lucide="check-square" class="w-4 h-4 text-teal-600"></i>
              <span>Đầu Việc Cần Xử Lý (${activeTasks.length})</span>
            </h4>
            <button onclick="openNewTaskModalForMerchant('${merchant.id}')" class="text-xs text-teal-600 font-bold hover:underline">+ Thêm việc</button>
          </div>

          <div class="space-y-2">
            ${activeTasks.length > 0 ? activeTasks.map(t => {
              const proj = state.projects.find(p => p.id === t.project_id);
              return `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-teal-300 transition">
                  <div class="flex items-center space-x-3 min-w-0">
                    <input type="checkbox" onchange="toggleTaskDone('${t.id}')" class="w-4 h-4 accent-teal-600 rounded cursor-pointer shrink-0">
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-slate-800 truncate">${t.title}</div>
                      <div class="text-[10px] text-slate-400 mt-0.5 truncate">
                        ${proj ? proj.title : 'Chung'} • PIC: <strong class="text-slate-600">${t.pic}</strong> • Hạn: <strong class="${t.is_overdue ? 'text-rose-600' : 'text-slate-600'}">${t.due_date}</strong>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-1.5 shrink-0">
                    <span class="px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      t.priority === 'KHẨN CẤP' ? 'bg-rose-100 text-rose-700' :
                      t.priority === 'CAO' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }">${t.priority}</span>
                    <button onclick="openEditTaskModal('${t.id}')" class="p-1 text-slate-400 hover:text-teal-600" title="Sửa"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
                    <button onclick="deleteTask('${t.id}')" class="p-1 text-slate-400 hover:text-rose-600" title="Xóa"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Không có đầu việc nào đang chờ xử lý!
              </div>
            `}
          </div>

          <!-- NGĂN THU GỌN ĐẦU VIỆC ĐÃ HOÀN THÀNH -->
          ${completedTasks.length > 0 ? `
            <div class="pt-2 border-t border-slate-100">
              <button onclick="toggleCompletedTasksAccordion()" class="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1.5 transition">
                <i data-lucide="${showCompletedTasks ? 'chevron-down' : 'chevron-right'}" class="w-3.5 h-3.5"></i>
                <span>✓ Đã hoàn thành (${completedTasks.length})</span>
              </button>
              ${showCompletedTasks ? `
                <div class="mt-2 space-y-1.5">
                  ${completedTasks.map(t => `
                    <div class="px-3 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200/70 flex items-center justify-between gap-2">
                      <div class="flex items-center space-x-2.5 min-w-0">
                        <input type="checkbox" checked onchange="toggleTaskDone('${t.id}')" class="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer shrink-0">
                        <span class="text-xs font-semibold text-slate-400 line-through truncate">${t.title}</span>
                      </div>
                      <button onclick="deleteTask('${t.id}')" class="p-1 text-slate-400 hover:text-rose-600 shrink-0" title="Xóa"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

      </div>
    `;
  } else {
    // TRANG RIÊNG CỦA 1 DỰ ÁN CỤ THỂ
    const project = state.projects.find(p => p.id === activeSubTab);
    if (!project) return;

    const projectTasks = state.tasks.filter(t => t.project_id === project.id);
    const activeProjTasks = projectTasks.filter(t => t.stage !== 'STAGE_DONE');
    const completedProjTasks = projectTasks.filter(t => t.stage === 'STAGE_DONE');
    const isDoneProj = project.is_archived || project.progress >= 100;

    leftColumnHtml = `
      <div class="lg:col-span-8 space-y-4">
        <!-- HEADER & SUB-TABS -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-1.5">
              ${subTabsHtml}
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="archiveProjectToggle('${project.id}', event)" class="px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                isDoneProj ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
              }">
                ${isDoneProj ? '✓ Đã Go-Live (Mở lại)' : '✓ Đánh Dấu Hoàn Tất'}
              </button>
              <button onclick="openEditProjectModal('${project.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
                Sửa Dự Án
              </button>
            </div>
          </div>

          <!-- CHI TIẾT DỰ ÁN -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${isDoneProj ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                ${project.stage}
              </span>
              <h3 class="text-base font-black text-slate-900 mt-1">${project.title}</h3>
              <p class="text-xs text-slate-500 mt-0.5">Mốc hiện tại: <strong class="text-slate-700">${project.milestone_name}</strong> • Hạn: <strong>${project.due_date}</strong></p>
            </div>
            <div class="flex items-center space-x-3 shrink-0">
              <div class="text-right">
                <div class="text-xs font-black text-teal-700">${project.progress}%</div>
                <div class="w-24 bg-slate-100 rounded-full h-2 mt-1"><div class="bg-teal-600 h-2 rounded-full" style="width: ${project.progress}%"></div></div>
              </div>
              <button onclick="toggleBlocker('${project.id}')" class="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                project.is_blocked ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              }">
                ${project.is_blocked ? 'Đang vướng mắc' : 'Báo vướng mắc'}
              </button>
            </div>
          </div>

          ${project.is_blocked ? `
            <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="text-xs text-rose-800 font-semibold">⚠ Vướng mắc: ${project.blocker_reason} (${project.blocker_owner})</div>
              <button onclick="handlePingPIC('${merchant.name}', '${project.title}', '${project.blocker_reason}')" class="shrink-0 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition">
                Liên hệ Zalo
              </button>
            </div>
          ` : ''}
        </div>

        <!-- TASKS RIÊNG CỦA DỰ ÁN -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider">Đầu Việc Cần Làm (${activeProjTasks.length})</h4>
            <button onclick="openNewTaskModalForProject('${project.id}')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition">
              + Thêm đầu việc
            </button>
          </div>

          <div class="space-y-2">
            ${activeProjTasks.length > 0 ? activeProjTasks.map(t => `
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div class="flex items-center space-x-3 min-w-0">
                  <input type="checkbox" onchange="toggleTaskDone('${t.id}')" class="w-4 h-4 accent-teal-600 rounded cursor-pointer shrink-0">
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-slate-800 truncate">${t.title}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Phụ trách: <strong class="text-slate-600">${t.pic}</strong> • Hạn: <strong class="${t.is_overdue ? 'text-rose-600' : 'text-slate-600'}">${t.due_date}</strong></div>
                  </div>
                </div>
                <div class="flex items-center space-x-1.5 shrink-0">
                  <span class="px-2 py-0.5 rounded text-[9px] font-extrabold ${t.priority === 'KHẨN CẤP' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}">${t.priority}</span>
                  <button onclick="openEditTaskModal('${t.id}')" class="p-1 text-slate-400 hover:text-teal-600"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
                  <button onclick="deleteTask('${t.id}')" class="p-1 text-slate-400 hover:text-rose-600"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                </div>
              </div>
            `).join('') : `
              <div class="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Chưa có đầu việc nào đang chờ xử lý trong dự án này.
              </div>
            `}
          </div>

          ${completedProjTasks.length > 0 ? `
            <div class="pt-2 border-t border-slate-100">
              <button onclick="toggleCompletedTasksAccordion()" class="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1.5">
                <i data-lucide="${showCompletedTasks ? 'chevron-down' : 'chevron-right'}" class="w-3.5 h-3.5"></i>
                <span>✓ Đã hoàn thành (${completedProjTasks.length})</span>
              </button>
              ${showCompletedTasks ? `
                <div class="mt-2 space-y-1.5">
                  ${completedProjTasks.map(t => `
                    <div class="px-3 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200/70 flex items-center justify-between gap-2">
                      <div class="flex items-center space-x-2.5 min-w-0">
                        <input type="checkbox" checked onchange="toggleTaskDone('${t.id}')" class="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer shrink-0">
                        <span class="text-xs font-semibold text-slate-400 line-through truncate">${t.title}</span>
                      </div>
                      <button onclick="deleteTask('${t.id}')" class="p-1 text-slate-400 hover:text-rose-600 shrink-0"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- NHẬT KÝ TRAO ĐỔI & GHI CHÚ DỰ ÁN -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider">Nhật Ký Trao Đổi & Ghi Chú Dự Án (${(project.notes || []).length})</h4>
          </div>
          <form onsubmit="event.preventDefault(); addProjectNote('${project.id}')" class="flex items-center gap-2">
            <input id="proj-note-input-${project.id}" type="text" placeholder="Ghi nhanh nội dung vừa chốt với đối tác / ngân hàng..." class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 focus:bg-white transition" />
            <button type="submit" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 transition">+ Lưu ghi chú</button>
          </form>
          <div class="space-y-2">
            ${(project.notes && project.notes.length > 0) ? project.notes.map(n => `
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2 text-xs">
                <span class="text-slate-700 font-medium">${n.text}</span>
                <span class="text-[10px] text-slate-400 font-mono shrink-0">${n.time}</span>
              </div>
            `).join('') : `<div class="text-[11px] text-slate-400 text-center py-2">Chưa có ghi chú trao đổi nào cho dự án này.</div>`}
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = leftColumnHtml + rightColumnHtml;
  lucide.createIcons();
}

// Copy đường dẫn thư mục cục bộ
function copyLocalPath(path) {
  navigator.clipboard.writeText(path).then(() => {
    showToast(`✓ Đã copy đường dẫn: "${path}"! Dán vào Terminal hoặc Cmd+Shift+G trong Finder để mở.`);
  }).catch(err => {
    console.error(err);
  });
}

// -------------------------------------------------------------
// 5. PING PIC SLA LOGIC
// -------------------------------------------------------------
function handlePingPIC(merchantName, projectTitle, reason) {
  const m = state.merchants.find(item => item.name === merchantName);
  const pic = m ? state.stakeholders.find(s => s.merchant_id === m.id && s.phone) : null;
  const phone = pic ? pic.phone.replace(/[^0-9]/g, "") : "";
  const zaloUrl = phone ? `https://zalo.me/${phone}` : "https://zalo.me";

  const template = `[BRYAN PORTAL - TRAO ĐỔI TIẾN ĐỘ DỰ ÁN]
Kính gửi anh/chị phụ trách dự án ${merchantName},
Dự án "${projectTitle}" hiện đang có điểm nghẽn cần phối hợp xử lý:
- Nội dung: ${reason}
Nhờ team hỗ trợ kiểm tra sớm giúp Bryan trong hôm nay để kịp tiến độ chung nhé!`;

  if (navigator.clipboard) navigator.clipboard.writeText(template).catch(() => {});
  window.open(zaloUrl, "_blank", "noopener");
  if (typeof addNotificationLog === "function") addNotificationLog(`Đã mở liên hệ Zalo đối tác ${merchantName}: "${reason}"`);
  showToast("Đã mở Zalo & sao chép sẵn nội dung trao đổi!");
}


// -------------------------------------------------------------
// 7. MODALS QUẢN LÝ CRUD (TASK, PROJECT, STAKEHOLDER, FOLDER)
// -------------------------------------------------------------

// TASK MODAL
function openNewTaskModal() {
  document.getElementById("modal-task-title-text").textContent = "Tạo Đầu Việc Mới";
  document.getElementById("task-id-hidden").value = "";
  document.getElementById("task-title-input").value = "";
  document.getElementById("task-pic-input").value = "Bryan";
  document.getElementById("task-priority-select").value = "TRUNG BÌNH";
  document.getElementById("task-stage-select").value = "STAGE_TODO";
  document.getElementById("task-due-date-input").value = "2026-11-30";
  
  const sel = document.getElementById("task-project-select");
  const activeProjs = state.projects.filter(p => !p.is_archived && (p.progress || 0) < 100);
  sel.innerHTML = `<option value="">[Nội bộ Bryan] Việc cá nhân / Nội bộ</option>` + activeProjs.map(p => {
    const m = state.merchants.find(item => item.id === p.merchant_id);
    return `<option value="${p.id}">[${m ? m.name : 'Nội bộ'}] ${p.title}</option>`;
  }).join('');
  if (activeProjs.length > 0) sel.value = activeProjs[0].id;
  
  document.getElementById("modal-task").classList.remove("hidden");
}

function openNewTaskModalForMerchant(mId) {
  openNewTaskModal();
  const p = state.projects.find(proj => proj.merchant_id === mId && !proj.is_archived && (proj.progress || 0) < 100);
  if (p) document.getElementById("task-project-select").value = p.id;
}

function openNewTaskModalForProject(projId) {
  openNewTaskModal();
  const sel = document.getElementById("task-project-select");
  if (!Array.from(sel.options).some(o => o.value === projId)) {
    const p = state.projects.find(item => item.id === projId);
    if (p) {
      const m = state.merchants.find(item => item.id === p.merchant_id);
      sel.insertAdjacentHTML("beforeend", `<option value="${p.id}">[${m ? m.name : 'Nội bộ'}] ${p.title} (Đã xong)</option>`);
    }
  }
  sel.value = projId;
}

function openEditTaskModal(taskId) {
  const t = state.tasks.find(item => item.id === taskId);
  if (!t) return;

  document.getElementById("modal-task-title-text").textContent = "Chỉnh Sửa Đầu Việc";
  document.getElementById("task-id-hidden").value = t.id;
  document.getElementById("task-title-input").value = t.title;
  document.getElementById("task-pic-input").value = t.pic || "Bryan";
  document.getElementById("task-priority-select").value = t.priority || "TRUNG BÌNH";
  document.getElementById("task-stage-select").value = t.stage || "STAGE_TODO";
  document.getElementById("task-due-date-input").value = t.due_date || "";

  // Set radio type
  const radios = document.getElementsByName("modal-task-type");
  radios.forEach(r => { r.checked = (r.value === t.type); });

  const sel = document.getElementById("task-project-select");
  const visibleProjs = state.projects.filter(p => (!p.is_archived && (p.progress || 0) < 100) || p.id === t.project_id);
  sel.innerHTML = `<option value="">[Nội bộ Bryan] Việc cá nhân / Nội bộ</option>` + visibleProjs.map(p => {
    const m = state.merchants.find(item => item.id === p.merchant_id);
    const doneTag = (p.is_archived || (p.progress || 0) >= 100) ? " (Đã hoàn thành)" : "";
    return `<option value="${p.id}" ${p.id === t.project_id ? 'selected' : ''}>[${m ? m.name : 'Nội bộ'}] ${p.title}${doneTag}</option>`;
  }).join('');
  sel.value = t.project_id || "";

  document.getElementById("modal-task").classList.remove("hidden");
}

function closeTaskModal() {
  document.getElementById("modal-task").classList.add("hidden");
}

function handleSaveTask(e) {
  e.preventDefault();
  const id = document.getElementById("task-id-hidden").value;
  const title = document.getElementById("task-title-input").value.trim();
  const projId = document.getElementById("task-project-select").value;
  const pic = document.getElementById("task-pic-input").value.trim() || "Bryan";
  const priority = document.getElementById("task-priority-select").value;
  const stage = document.getElementById("task-stage-select").value;
  const dueDate = document.getElementById("task-due-date-input").value || "2026-11-30";
  const type = document.querySelector('input[name="modal-task-type"]:checked')?.value || "COMMERCIAL";

  if (id) {
    // Cập nhật task cũ
    const task = state.tasks.find(item => item.id === id);
    if (task) {
      task.title = title;
      task.project_id = projId;
      task.pic = pic;
      task.priority = priority;
      task.stage = stage;
      task.due_date = dueDate;
      task.type = type;
    }
    showToast("✓ Đã cập nhật đầu việc thành công!");
  } else {
    // Tạo mới
    const newTask = {
      id: "t-" + Date.now().toString().slice(-4),
      type: type,
      project_id: projId,
      title: title,
      pic: pic,
      stage: stage,
      priority: priority,
      due_date: dueDate,
      is_overdue: false
    };
    state.tasks.unshift(newTask);
    if (typeof runAutomationRules === "function") {
      runAutomationRules("TASK_CREATED", { title: newTask.title, project_id: newTask.project_id, pic: newTask.pic, taskObj: newTask });
    }
    postDataToGoogleSheets({ action: "CREATE_TASK", ...newTask });
    showToast("✓ Đã tạo đầu việc mới thành công!");
  }

  closeTaskModal();
  syncAllAfterTaskChange(id ? `Đã cập nhật đầu việc "${title}"` : `Đã tạo đầu việc mới "${title}"`);
}

// PROJECT MODAL
function openNewProjectModal() {
  document.getElementById("modal-proj-title-text").textContent = "Thêm Dự Án Phối Hợp Mới";
  document.getElementById("proj-id-hidden").value = "";
  document.getElementById("proj-title-input").value = "";
  document.getElementById("proj-stage-select").value = "INTEGRATION";
  document.getElementById("proj-progress-input").value = 10;
  document.getElementById("proj-milestone-input").value = "Cấp Sandbox & Khảo sát luồng";
  document.getElementById("proj-due-date-input").value = "2026-12-25";
  document.getElementById("proj-is-blocked-check").checked = false;
  document.getElementById("proj-blocker-reason-input").value = "";
  document.getElementById("proj-blocker-owner-input").value = "";

  const sel = document.getElementById("proj-merchant-select");
  sel.innerHTML = state.merchants.map(m => `<option value="${m.id}" ${m.id === activeMerchantId ? 'selected' : ''}>${m.name}</option>`).join('');

  document.getElementById("modal-project").classList.remove("hidden");
}

function openEditProjectModal(projId) {
  const p = state.projects.find(item => item.id === projId);
  if (!p) return;

  document.getElementById("modal-proj-title-text").textContent = "Chỉnh Sửa Dự Án Phối Hợp";
  document.getElementById("proj-id-hidden").value = p.id;
  document.getElementById("proj-title-input").value = p.title;
  document.getElementById("proj-stage-select").value = p.stage;
  document.getElementById("proj-progress-input").value = p.progress;
  document.getElementById("proj-milestone-input").value = p.milestone_name || "";
  document.getElementById("proj-due-date-input").value = p.due_date || "";
  document.getElementById("proj-is-blocked-check").checked = !!p.is_blocked;
  document.getElementById("proj-blocker-reason-input").value = p.blocker_reason || "";
  document.getElementById("proj-blocker-owner-input").value = p.blocker_owner || "";

  const sel = document.getElementById("proj-merchant-select");
  sel.innerHTML = state.merchants.map(m => `<option value="${m.id}" ${m.id === p.merchant_id ? 'selected' : ''}>${m.name}</option>`).join('');

  document.getElementById("modal-project").classList.remove("hidden");
}

function closeProjectModal() {
  document.getElementById("modal-project").classList.add("hidden");
}

function handleSaveProject(e) {
  e.preventDefault();
  const id = document.getElementById("proj-id-hidden").value;
  const mId = document.getElementById("proj-merchant-select").value;
  const title = document.getElementById("proj-title-input").value.trim();
  const stage = document.getElementById("proj-stage-select").value;
  const progress = parseInt(document.getElementById("proj-progress-input").value) || 0;
  const milestone = document.getElementById("proj-milestone-input").value.trim();
  const dueDate = document.getElementById("proj-due-date-input").value || "2026-12-25";
  const isBlocked = document.getElementById("proj-is-blocked-check").checked;
  const blockerReason = document.getElementById("proj-blocker-reason-input").value.trim();
  const blockerOwner = document.getElementById("proj-blocker-owner-input").value.trim();

  if (id) {
    const p = state.projects.find(item => item.id === id);
    if (p) {
      p.merchant_id = mId;
      p.title = title;
      p.stage = stage;
      p.progress = progress;
      p.milestone_name = milestone;
      p.due_date = dueDate;
      p.is_blocked = isBlocked;
      p.blocker_reason = blockerReason;
      p.blocker_owner = blockerOwner;
    }
    showToast("✓ Đã cập nhật dự án thành công!");
  } else {
    const newProjId = "p-" + Date.now().toString().slice(-4);
    state.projects.push({
      id: newProjId,
      merchant_id: mId,
      title: title,
      stage: stage,
      progress: progress,
      milestone_name: milestone,
      gate_step: 2,
      due_date: dueDate,
      is_blocked: isBlocked,
      blocker_reason: blockerReason,
      blocker_owner: blockerOwner
    });
    activeSubTab = newProjId; // Nhảy ngay sang trang dự án mới
    showToast("✓ Đã thêm dự án phối hợp mới!");
  }

  closeProjectModal();
  updateAllKpis();
  renderMerchantSubTabs();
  renderMerchantWorkspaceBody();
  renderDashboardProjectsProgress();
}

// STAKEHOLDER MODAL
function openNewStakeholderModal(mId) {
  document.getElementById("modal-stk-title-text").textContent = "Thêm Nhân Sự Stakeholder";
  document.getElementById("stk-id-hidden").value = "";
  document.getElementById("stk-merchant-id-hidden").value = mId || activeMerchantId;
  document.getElementById("stk-name-input").value = "";
  document.getElementById("stk-role-input").value = "";
  document.getElementById("stk-phone-input").value = "";
  document.getElementById("stk-email-input").value = "";
  document.getElementById("modal-stakeholder").classList.remove("hidden");
}

function openEditStakeholderModal(stkId) {
  const s = state.stakeholders.find(item => item.id === stkId);
  if (!s) return;

  document.getElementById("modal-stk-title-text").textContent = "Chỉnh Sửa Nhân Sự Stakeholder";
  document.getElementById("stk-id-hidden").value = s.id;
  document.getElementById("stk-merchant-id-hidden").value = s.merchant_id;
  document.getElementById("stk-group-select").value = s.group;
  document.getElementById("stk-name-input").value = s.name;
  document.getElementById("stk-role-input").value = s.role;
  document.getElementById("stk-phone-input").value = s.phone;
  document.getElementById("stk-email-input").value = s.email;
  document.getElementById("modal-stakeholder").classList.remove("hidden");
}

function closeStakeholderModal() {
  document.getElementById("modal-stakeholder").classList.add("hidden");
}

function handleSaveStakeholder(e) {
  e.preventDefault();
  const id = document.getElementById("stk-id-hidden").value;
  const mId = document.getElementById("stk-merchant-id-hidden").value;
  const group = document.getElementById("stk-group-select").value;
  const name = document.getElementById("stk-name-input").value.trim();
  const role = document.getElementById("stk-role-input").value.trim();
  const phone = document.getElementById("stk-phone-input").value.trim();
  const email = document.getElementById("stk-email-input").value.trim();

  if (id) {
    const s = state.stakeholders.find(item => item.id === id);
    if (s) {
      s.group = group;
      s.name = name;
      s.role = role;
      s.phone = phone;
      s.email = email;
    }
    showToast("✓ Đã cập nhật nhân sự thành công!");
  } else {
    state.stakeholders.push({
      id: "s-" + Date.now().toString().slice(-4),
      merchant_id: mId,
      group: group,
      name: name,
      role: role,
      phone: phone,
      email: email
    });
    showToast("✓ Đã thêm nhân sự vào danh bạ!");
  }

  closeStakeholderModal();
  renderMerchantWorkspaceBody();
}

// FOLDER MODAL
function openNewFolderModal(mId) {
  document.getElementById("modal-folder-title-text").textContent = "Đính Kèm Liên Kết Tài Liệu";
  document.getElementById("folder-id-hidden").value = "";
  document.getElementById("folder-merchant-id-hidden").value = mId || activeMerchantId;
  document.getElementById("folder-title-input").value = "";
  document.getElementById("folder-path-input").value = "https://drive.google.com/";
  document.getElementById("folder-note-input").value = "";
  document.getElementById("modal-folder").classList.remove("hidden");
}

function openEditFolderModal(fId) {
  const f = state.folders.find(item => item.id === fId);
  if (!f) return;

  document.getElementById("modal-folder-title-text").textContent = "Sửa Liên Kết Tài Liệu";
  document.getElementById("folder-id-hidden").value = f.id;
  document.getElementById("folder-merchant-id-hidden").value = f.merchant_id;
  document.getElementById("folder-title-input").value = f.title;
  document.getElementById("folder-path-input").value = f.path;
  document.getElementById("folder-note-input").value = f.note || "";
  document.getElementById("modal-folder").classList.remove("hidden");
}

function closeFolderModal() {
  document.getElementById("modal-folder").classList.add("hidden");
}

function handleSaveFolder(e) {
  e.preventDefault();
  const id = document.getElementById("folder-id-hidden").value;
  const mId = document.getElementById("folder-merchant-id-hidden").value;
  const title = document.getElementById("folder-title-input").value.trim();
  const path = document.getElementById("folder-path-input").value.trim();
  const note = document.getElementById("folder-note-input").value.trim();

  if (id) {
    const f = state.folders.find(item => item.id === id);
    if (f) {
      f.title = title;
      f.path = path;
      f.note = note;
    }
    showToast("✓ Đã cập nhật thư mục máy tính!");
  } else {
    state.folders.push({
      id: "f-" + Date.now().toString().slice(-4),
      merchant_id: mId,
      title: title,
      path: path,
      note: note
    });
    showToast("✓ Đã lưu đường dẫn thư mục máy tính!");
  }

  closeFolderModal();
  renderMerchantWorkspaceBody();
}

function deleteFolder(fId) {
  if (confirm("Bạn có chắc muốn xóa đường dẫn thư mục này?")) {
    state.folders = state.folders.filter(f => f.id !== fId);
    renderMerchantWorkspaceBody();
    showToast("✓ Đã xóa đường dẫn thư mục!");
  }
}

// MERCHANT MODAL (Thêm mới)
function openNewMerchantModal() {
  document.getElementById("modal-new-merchant").classList.remove("hidden");
}

function closeNewMerchantModal() {
  document.getElementById("modal-new-merchant").classList.add("hidden");
}

function handleSaveNewMerchant(e) {
  e.preventDefault();
  const name = document.getElementById("merchant-name").value.trim();
  const alias = document.getElementById("merchant-alias").value.trim();
  const industry = document.getElementById("merchant-industry").value.trim() || "Doanh nghiệp Chuỗi";
  const gmv = document.getElementById("merchant-gmv").value.trim() || "~500M GMV/tháng";
  const folderPath = document.getElementById("merchant-folder-path").value.trim();
  const stkName = document.getElementById("merchant-stk-name").value.trim();
  const stkRole = document.getElementById("merchant-stk-role").value.trim() || "Giám Đốc Vận Hành";
  const stkPhone = document.getElementById("merchant-stk-phone").value.trim();
  const stkEmail = document.getElementById("merchant-stk-email").value.trim();

  const newMId = "m-" + Date.now().toString().slice(-4);
  const newM = {
    id: newMId,
    name: name,
    alias: alias.startsWith("@") ? alias : "@" + alias,
    industry: industry,
    expected_gmv: gmv,
    avatar_letter: name.charAt(0).toUpperCase(),
    color: "bg-teal-700",
    contract_status: "Đã Ký Hợp Đồng • Chuẩn Bị Triển Khai"
  };

  state.merchants.push(newM);

  if (folderPath) {
    state.folders.push({
      id: "f-" + Date.now().toString().slice(-4),
      merchant_id: newMId,
      title: "Thư Mục Tài Liệu " + name,
      path: folderPath,
      note: "Thư mục lưu trữ dự án trên máy Mac"
    });
  }

  if (stkName) {
    state.stakeholders.push({
      id: "s-" + Date.now().toString().slice(-4),
      merchant_id: newMId,
      name: stkName,
      role: stkRole,
      phone: stkPhone,
      email: stkEmail,
      group: "Đại Diện Chuỗi"
    });
  }

  // Tạo dự án khởi đầu
  const newPId = "p-" + Date.now().toString().slice(-4);
  state.projects.push({
    id: newPId,
    merchant_id: newMId,
    title: "Tích Hợp Hạ Tầng Thanh Toán Đa Kênh Chuỗi",
    stage: "KICKOFF",
    due_date: "2026-12-25",
    progress: 15,
    milestone_name: "1. Khảo sát & Ký Hợp Đồng",
    gate_step: 1,
    is_blocked: false,
    blocker_reason: "",
    blocker_owner: ""
  });

  postDataToGoogleSheets({
    action: "CREATE_MERCHANT",
    name: newM.name,
    alias: newM.alias,
    industry: newM.industry,
    expected_gmv: newM.expected_gmv,
    stakeholder: stkName ? { name: stkName, role: stkRole, phone: stkPhone, email: stkEmail } : null
  });

  closeNewMerchantModal();
  selectMerchant(newMId);
  navigateTo("PROJECTS");
  updateAllKpis();
  showToast(`✓ Đã thêm chuỗi ${name} vào Workspace quản lý!`);
}

function toggleBlocker(projId) {
  const proj = state.projects.find(p => p.id === projId);
  if (!proj) return;

  const beforeProjects = JSON.parse(JSON.stringify(state.projects));
  let changed = false;

  if (!proj.is_blocked) {
    const reason = prompt("Nhập lý do vướng mắc làm chậm tiến độ cam kết:", "Chưa mở IP whitelist Webhook Callback");
    if (reason) {
      proj.is_blocked = true;
      proj.blocker_reason = reason;
      proj.blocker_owner = "Đội ngũ Đối tác";
      changed = true;
    }
  } else {
    proj.is_blocked = false;
    proj.blocker_reason = "";
    proj.blocker_owner = "";
    changed = true;
  }

  if (!changed) return;

  saveStateStorage();
  postDataToGoogleSheets({
    action: "UPDATE_BLOCKER",
    project_id: proj.id,
    is_blocked: proj.is_blocked,
    blocker_reason: proj.blocker_reason,
    blocker_owner: proj.blocker_owner
  });

  renderMerchantWorkspaceBody();
  if (typeof renderDashboardBlockers === "function") renderDashboardBlockers();
  updateAllKpis();

  const m = state.merchants.find(item => item.id === proj.merchant_id);
  const mName = m ? m.name : proj.title;
  if (typeof pushUndoAction === "function") {
    pushUndoAction({
      module: "BLOCKER",
      action_type: proj.is_blocked ? "CREATE" : "UPDATE",
      entity_id: proj.id,
      display_label: proj.title,
      context_label: mName,
      before: { projects: beforeProjects },
      after: { projects: state.projects },
      toastMessage: proj.is_blocked
        ? `Đã tạo cảnh báo vướng mắc cho chuỗi ${mName}.`
        : `Đã đóng vướng mắc kỹ thuật của ${mName}.`
    });
  }

  if (proj.is_blocked && typeof runAutomationRules === "function") {
    runAutomationRules("PROJECT_BLOCKED", { title: proj.title, reason: proj.blocker_reason, merchantName: m ? m.name : "", project_id: proj.id, pic: proj.pic || "Bryan" });
  }
}


// -------------------------------------------------------------
// COMPANY APP LAUNCHER (9-DOT SWITCHER + PERSONAL PINS & LINKS)
// -------------------------------------------------------------
const DEFAULT_COMPANY_APPS = [
  {
    id: "app-merchant-care",
    name: "Merchant Care",
    desc: "Quản lý & hỗ trợ đối tác",
    url: "https://merchant.vietunion.com.vn:6006/merchant-care",
    group: "Vận hành & Đối tác",
    icon: "store",
    keywords: "merchant care doi tac mc"
  },
  {
    id: "app-payoo-portal",
    name: "Payoo Portal",
    desc: "Cổng vận hành & giao dịch",
    url: "https://portal.payoo.vn/",
    group: "Vận hành & Đối tác",
    icon: "globe",
    keywords: "portal payoo giao dich"
  },
  {
    id: "app-pm",
    name: "PM (Project)",
    desc: "Theo dõi tiến độ dự án",
    url: "https://pm.vietunion.com.vn:9091/?controller=AuthController&action=login",
    group: "Dự án & Công việc",
    icon: "kanban",
    keywords: "pm project du an task tien do"
  },
  {
    id: "app-wiki",
    name: "Wiki (XWiki)",
    desc: "Tài liệu & quy trình SOP",
    url: "https://wiki.vietunion.com.vn:9093/xwiki/bin/view/Main/",
    group: "Nội bộ & Tài liệu",
    icon: "book-open",
    keywords: "wiki xwiki tai lieu sop quy trinh"
  },
  {
    id: "app-hrm",
    name: "HRM",
    desc: "Chấm công, nghỉ phép, lương",
    url: "https://hrm.vietunion.com.vn/web/index.php/auth/login",
    group: "Nội bộ & Tài liệu",
    icon: "users",
    keywords: "hrm nhan su cham cong nghi phep luong"
  }
];

function getAppLauncherStorageSuffix() {
  const email = (typeof getCurrentUserEmail === "function" ? getCurrentUserEmail() : "default") || "default";
  return email.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
}

function getPinnedAppIds() {
  try {
    const raw = localStorage.getItem(`bportal_pinned_apps_${getAppLauncherStorageSuffix()}`);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function savePinnedAppIds(ids) {
  localStorage.setItem(`bportal_pinned_apps_${getAppLauncherStorageSuffix()}`, JSON.stringify(ids));
}

function getCustomCompanyApps() {
  try {
    const raw = localStorage.getItem(`bportal_custom_apps_${getAppLauncherStorageSuffix()}`);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveCustomCompanyApps(list) {
  localStorage.setItem(`bportal_custom_apps_${getAppLauncherStorageSuffix()}`, JSON.stringify(list));
}

function getAllCompanyPortalApps() {
  return [...DEFAULT_COMPANY_APPS, ...getCustomCompanyApps()];
}

function togglePinCompanyApp(appId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const pinned = getPinnedAppIds();
  const idx = pinned.indexOf(appId);
  if (idx >= 0) pinned.splice(idx, 1);
  else pinned.unshift(appId);
  savePinnedAppIds(pinned);
  renderAppLauncherList();
}

function deleteCustomCompanyApp(appId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const next = getCustomCompanyApps().filter(a => a.id !== appId);
  saveCustomCompanyApps(next);
  savePinnedAppIds(getPinnedAppIds().filter(id => id !== appId));
  renderAppLauncherList();
  showToast("Đã xóa liên kết cá nhân.");
}

function toggleCustomAppAddForm() {
  const form = document.getElementById("app-launcher-add-form");
  if (!form) return;
  form.classList.toggle("hidden");
  if (!form.classList.contains("hidden")) {
    const nameEl = document.getElementById("custom-app-name");
    if (nameEl) nameEl.focus();
  }
}

function handleSaveCustomCompanyApp(e) {
  e.preventDefault();
  const nameEl = document.getElementById("custom-app-name");
  const urlEl = document.getElementById("custom-app-url");
  const descEl = document.getElementById("custom-app-desc");
  const name = (nameEl?.value || "").trim();
  let url = (urlEl?.value || "").trim();
  const desc = (descEl?.value || "").trim() || "Liên kết cá nhân";
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  const custom = getCustomCompanyApps();
  const id = "custom-app-" + Date.now();
  custom.push({
    id,
    name,
    desc,
    url,
    group: "Link cá nhân",
    icon: "link",
    isCustom: true,
    keywords: `${name} ${desc}`.toLowerCase()
  });
  saveCustomCompanyApps(custom);
  if (nameEl) nameEl.value = "";
  if (urlEl) urlEl.value = "";
  if (descEl) descEl.value = "";
  const form = document.getElementById("app-launcher-add-form");
  if (form) form.classList.add("hidden");
  renderAppLauncherList();
  showToast(`✓ Đã thêm "${name}" vào Cổng ứng dụng!`);
}

// -------------------------------------------------------------
// LOCAL / NETWORK PATHS DIRECTORY (Ổ M:, I:)
// -------------------------------------------------------------
const DEFAULT_LOCAL_PATHS = [
  {
    id: "lp-sales-op-front",
    name: "Bộ HĐ PA cơ bản (gửi ĐT review)",
    path: "M:\\SALES OP-FRONT",
    group: "Hợp đồng & BM",
    note: "Bộ Hợp Đồng PA cơ bản gửi Đối tác review",
    keywords: "bo hd hop dong pa co ban sales op front review"
  },
  {
    id: "lp-asm-bm",
    name: "Kho Biểu mẫu (các BM)",
    path: "I:\\General Division\\Account System Management",
    group: "Hợp đồng & BM",
    note: "Các file BM01, BM01.01, BM03...",
    keywords: "bm bieu mau bm01 bm03 asm account system management"
  },
  {
    id: "lp-tra-gop-phi",
    name: "Phí trả góp đầu ra đang áp dụng",
    path: "M:\\Sản phẩm dịch vụ\\Trả góp\\Phí\\23. 03112026-ĐX-VU\\Tra gop_Phi dau ra_ap dung.xlsx",
    group: "Sản phẩm & Phí",
    note: "File Excel biểu phí trả góp đầu ra",
    keywords: "tra gop phi dau ra ap dung excel xlsx"
  },
  {
    id: "lp-qos-inactive",
    name: "DS thiết bị không phát sinh GD",
    path: "M:\\Report\\QoS",
    group: "Báo cáo (Report)",
    note: "File danh sách thiết bị không phát sinh giao dịch",
    password: "PayooPOS",
    keywords: "qos thiet bi khong phat sinh giao dich report pass"
  },
  {
    id: "lp-omni-datalist-2026",
    name: "Omni Datalist 2026",
    path: "M:\\Report\\Sale_Performance\\2026\\Omni Datalist 2026",
    group: "Báo cáo (Report)",
    note: "Sale Performance 2026",
    keywords: "omni datalist 2026 sale performance report"
  },
  {
    id: "lp-du-an",
    name: "Thư mục Dự Án gốc",
    path: "M:\\Dự Án",
    group: "Dự án",
    note: "Kho thư mục dự án tổng",
    keywords: "du an folder goc"
  }
];

let appLauncherTab = "APPS"; // APPS | PATHS

function getCustomLocalPaths() {
  try {
    const raw = localStorage.getItem(`bportal_custom_paths_${getAppLauncherStorageSuffix()}`);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveCustomLocalPaths(list) {
  localStorage.setItem(`bportal_custom_paths_${getAppLauncherStorageSuffix()}`, JSON.stringify(list));
}

function getPinnedPathIds() {
  try {
    const raw = localStorage.getItem(`bportal_pinned_paths_${getAppLauncherStorageSuffix()}`);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function savePinnedPathIds(ids) {
  localStorage.setItem(`bportal_pinned_paths_${getAppLauncherStorageSuffix()}`, JSON.stringify(ids));
}

function getAllLocalPaths() {
  return [...DEFAULT_LOCAL_PATHS, ...getCustomLocalPaths()];
}

function copyLocalPathValue(encodedPath, label) {
  const p = decodeURIComponent(encodedPath || "");
  if (!p) return;
  if (navigator.clipboard) navigator.clipboard.writeText(p).catch(() => {});
  showToast(`✓ Đã copy đường dẫn${label ? ` (${label})` : ""}!`);
}

function copyLocalPathPassword(encodedPass) {
  const pass = decodeURIComponent(encodedPass || "");
  if (!pass) return;
  if (navigator.clipboard) navigator.clipboard.writeText(pass).catch(() => {});
  showToast("✓ Đã copy mật khẩu file!");
}

function togglePinLocalPath(pathId, event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  const pinned = getPinnedPathIds();
  const idx = pinned.indexOf(pathId);
  if (idx >= 0) pinned.splice(idx, 1);
  else pinned.unshift(pathId);
  savePinnedPathIds(pinned);
  renderLocalPathsList();
}

function deleteCustomLocalPath(pathId, event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  saveCustomLocalPaths(getCustomLocalPaths().filter(p => p.id !== pathId));
  savePinnedPathIds(getPinnedPathIds().filter(id => id !== pathId));
  renderLocalPathsList();
  showToast("Đã xóa đường dẫn cá nhân.");
}

function handleSaveCustomLocalPath(e) {
  e.preventDefault();
  const nameEl = document.getElementById("custom-path-name");
  const valEl = document.getElementById("custom-path-value");
  const grpEl = document.getElementById("custom-path-group");
  const passEl = document.getElementById("custom-path-pass");
  const noteEl = document.getElementById("custom-path-note");

  const name = (nameEl?.value || "").trim();
  const pathVal = (valEl?.value || "").trim();
  if (!name || !pathVal) return;

  const custom = getCustomLocalPaths();
  custom.push({
    id: "custom-path-" + Date.now(),
    name,
    path: pathVal,
    group: grpEl?.value || "Dự án",
    password: (passEl?.value || "").trim(),
    note: (noteEl?.value || "").trim(),
    isCustom: true,
    keywords: `${name} ${pathVal} ${noteEl?.value || ""}`.toLowerCase()
  });
  saveCustomLocalPaths(custom);
  [nameEl, valEl, passEl, noteEl].forEach(el => { if (el) el.value = ""; });
  document.getElementById("local-path-add-form")?.classList.add("hidden");
  renderLocalPathsList();
  showToast(`✓ Đã lưu đường dẫn "${name}"!`);
}

function renderLocalPathCard(item, isPinned) {
  const encPath = encodeURIComponent(item.path);
  const encPass = item.password ? encodeURIComponent(item.password) : "";
  const safeName = item.name.replace(/[<>&"]/g, "");
  const safeNote = (item.note || "").replace(/[<>&"]/g, "");
  const safePath = item.path.replace(/[<>&"]/g, "");
  return `
    <div class="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 hover:border-teal-300 transition space-y-1.5">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold text-slate-800 truncate">${safeName}</div>
          ${safeNote ? `<div class="text-[10px] text-slate-500 truncate">${safeNote}</div>` : ""}
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button type="button" onclick="togglePinLocalPath('${item.id}', event)" class="p-1 rounded-lg ${isPinned ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-white'} transition" title="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}">
            <i data-lucide="pin" class="w-3 h-3"></i>
          </button>
          ${item.isCustom ? `
          <button type="button" onclick="deleteCustomLocalPath('${item.id}', event)" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition" title="Xóa đường dẫn">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
          </button>` : ""}
        </div>
      </div>
      <div class="flex items-center justify-between gap-1.5">
        <code title="${safePath}" class="flex-1 min-w-0 truncate text-[10px] font-mono bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700">${safePath}</code>
        ${encPass ? `<button type="button" onclick="copyLocalPathPassword('${encPass}')" class="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold shrink-0 transition" title="Copy mật khẩu mở file">Pass</button>` : ""}
        <button type="button" onclick="copyLocalPathValue('${encPath}', '${safeName.replace(/'/g, "")}')" class="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold shrink-0 transition">Copy</button>
      </div>
    </div>
  `;
}

function renderLocalPathsList() {
  const container = document.getElementById("app-launcher-list");
  if (!container) return;
  const q = (document.getElementById("app-launcher-search")?.value || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

  const pinnedIds = getPinnedPathIds();
  const filtered = getAllLocalPaths().filter(p => {
    if (!q) return true;
    return norm(p.name).includes(q) || norm(p.path).includes(q) || norm(p.note).includes(q) || norm(p.keywords).includes(q);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">Không tìm thấy đường dẫn phù hợp.</div>`;
    return;
  }

  let html = "";
  const pinned = filtered.filter(p => pinnedIds.includes(p.id));
  if (pinned.length > 0) {
    html += `
      <div class="space-y-1.5">
        <div class="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 px-0.5">Đã ghim của bạn</div>
        <div class="space-y-1.5">${pinned.map(p => renderLocalPathCard(p, true)).join("")}</div>
      </div>
    `;
  }

  const groups = ["Hợp đồng & BM", "Sản phẩm & Phí", "Báo cáo (Report)", "Dự án"];
  groups.forEach(g => {
    const items = filtered.filter(p => p.group === g && !pinnedIds.includes(p.id));
    if (items.length === 0) return;
    html += `
      <div class="space-y-1.5">
        <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-0.5">${g}</div>
        <div class="space-y-1.5">${items.map(p => renderLocalPathCard(p, false)).join("")}</div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function switchAppLauncherTab(tab) {
  appLauncherTab = tab === "PATHS" ? "PATHS" : "APPS";
  const appsBtn = document.getElementById("launcher-tab-apps");
  const pathsBtn = document.getElementById("launcher-tab-paths");
  const addBtn = document.getElementById("launcher-add-btn");
  const searchEl = document.getElementById("app-launcher-search");
  document.getElementById("app-launcher-add-form")?.classList.add("hidden");
  document.getElementById("local-path-add-form")?.classList.add("hidden");

  if (appLauncherTab === "PATHS") {
    if (appsBtn) appsBtn.className = "flex-1 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition";
    if (pathsBtn) pathsBtn.className = "flex-1 py-1.5 rounded-xl text-[11px] font-bold bg-teal-600 text-white transition";
    if (addBtn) addBtn.textContent = "+ Thêm path";
    if (searchEl) searchEl.placeholder = "Tìm đường dẫn (QoS, trả góp, BM, HĐ, Omni...)";
  } else {
    if (appsBtn) appsBtn.className = "flex-1 py-1.5 rounded-xl text-[11px] font-bold bg-teal-600 text-white transition";
    if (pathsBtn) pathsBtn.className = "flex-1 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition";
    if (addBtn) addBtn.textContent = "+ Thêm link";
    if (searchEl) searchEl.placeholder = "Tìm nhanh (Wiki, HRM, PM, Merchant...)";
  }
  renderCurrentLauncherTab();
}

function toggleLauncherAddForm() {
  if (appLauncherTab === "PATHS") {
    const f = document.getElementById("local-path-add-form");
    if (!f) return;
    f.classList.toggle("hidden");
    if (!f.classList.contains("hidden")) document.getElementById("custom-path-name")?.focus();
  } else {
    toggleCustomAppAddForm();
  }
}

function renderCurrentLauncherTab() {
  if (appLauncherTab === "PATHS") renderLocalPathsList();
  else renderAppLauncherList();
}

function renderAppLauncherCard(app, isPinned) {
  const safeName = app.name.replace(/[<>&"]/g, "");
  const safeDesc = (app.desc || "").replace(/[<>&"]/g, "");
  return `
    <div class="group relative flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-300 transition">
      <a href="${app.url}" target="_blank" rel="noopener" onclick="closeAppLauncherPopover()" class="flex items-center gap-2.5 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-white border border-slate-200/80 text-teal-700 flex items-center justify-center shrink-0">
          <i data-lucide="${app.icon || 'external-link'}" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0">
          <div class="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
            <span>${safeName}</span>
            <i data-lucide="arrow-up-right" class="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0"></i>
          </div>
          <div class="text-[10px] text-slate-500 truncate">${safeDesc}</div>
        </div>
      </a>
      <div class="flex items-center gap-1 shrink-0">
        <button type="button" onclick="togglePinCompanyApp('${app.id}', event)" class="p-1 rounded-lg ${isPinned ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-white'} transition" title="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}">
          <i data-lucide="pin" class="w-3 h-3"></i>
        </button>
        ${app.isCustom ? `
        <button type="button" onclick="deleteCustomCompanyApp('${app.id}', event)" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition" title="Xóa link">
          <i data-lucide="trash-2" class="w-3 h-3"></i>
        </button>` : ""}
      </div>
    </div>
  `;
}

function renderAppLauncherList() {
  const container = document.getElementById("app-launcher-list");
  if (!container) return;

  const q = (document.getElementById("app-launcher-search")?.value || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

  const pinnedIds = getPinnedAppIds();
  const allApps = getAllCompanyPortalApps().filter(app => {
    if (!q) return true;
    return norm(app.name).includes(q) || norm(app.desc).includes(q) || norm(app.keywords).includes(q);
  });

  if (allApps.length === 0) {
    container.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">Không tìm thấy hệ thống phù hợp.</div>`;
    return;
  }

  let html = "";
  const pinnedApps = allApps.filter(a => pinnedIds.includes(a.id));
  if (pinnedApps.length > 0) {
    html += `
      <div class="space-y-1.5">
        <div class="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 px-0.5">Đã ghim của bạn</div>
        <div class="space-y-1.5">${pinnedApps.map(a => renderAppLauncherCard(a, true)).join("")}</div>
      </div>
    `;
  }

  const groups = ["Vận hành & Đối tác", "Dự án & Công việc", "Nội bộ & Tài liệu", "Link cá nhân"];
  groups.forEach(groupName => {
    const groupApps = allApps.filter(a => a.group === groupName && !pinnedIds.includes(a.id));
    if (groupApps.length === 0) return;
    html += `
      <div class="space-y-1.5">
        <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-0.5">${groupName}</div>
        <div class="space-y-1.5">${groupApps.map(a => renderAppLauncherCard(a, false)).join("")}</div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function toggleAppLauncherPopover(event) {
  if (event) event.stopPropagation();
  const pop = document.getElementById("topbar-apps-popover");
  if (!pop) return;
  const willOpen = pop.classList.contains("hidden");
  if (typeof closeTopbarNotifPopover === "function") closeTopbarNotifPopover();
  pop.classList.toggle("hidden", !willOpen);
  if (willOpen) {
    renderCurrentLauncherTab();
    const searchEl = document.getElementById("app-launcher-search");
    if (searchEl) {
      searchEl.value = "";
      setTimeout(() => searchEl.focus(), 50);
    }
  }
}

function closeAppLauncherPopover() {
  const pop = document.getElementById("topbar-apps-popover");
  if (pop) pop.classList.add("hidden");
}

document.addEventListener("click", function (e) {
  const pop = document.getElementById("topbar-apps-popover");
  if (!pop || pop.classList.contains("hidden")) return;
  if (e.target && e.target.closest && (e.target.closest("#topbar-apps-popover") || e.target.closest("#topbar-apps-btn"))) {
    return;
  }
  pop.classList.add("hidden");
});

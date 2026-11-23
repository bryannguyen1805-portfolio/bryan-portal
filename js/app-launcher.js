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
    renderAppLauncherList();
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

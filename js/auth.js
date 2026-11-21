// -------------------------------------------------------------
// MULTI-USER AUTHENTICATION (STRICT WHITELIST + PIN) & ADMIN PROVISIONING
// -------------------------------------------------------------

const AUTH_EMAIL_KEY = "bryan_portal_current_user_email";
const AUTH_NAME_KEY = "bryan_portal_current_user_name";
const AUTH_PIN_KEY = "bryan_portal_current_user_pin";
const AUTH_ROLE_KEY = "bryan_portal_current_user_role";
const LOCAL_USERS_KEY = "bryan_portal_omni_users_v1";

// Danh sách tài khoản mặc định (Admin chủ động cấp thêm cho 10 nhân sự phòng Omni)
const DEFAULT_OMNI_USERS = [
  { email: "tri.nguyen2@vietunion.com.vn", name: "Bryan Nguyen", role: "ADMIN", pin: "180526", active: true },
  { email: "quantritc1805@gmail.com", name: "Bryan Nguyen", role: "ADMIN", pin: "180526", active: true }
];

function getLocalOmniUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "null");
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_OMNI_USERS));
}

function saveLocalOmniUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function findLocalOmniUser(email) {
  const e = (email || "").trim().toLowerCase();
  return getLocalOmniUsers().find(u => u.email.toLowerCase() === e && u.active !== false) || null;
}

function getCurrentUserEmail() {
  return (localStorage.getItem(AUTH_EMAIL_KEY) || "tri.nguyen2@vietunion.com.vn").trim().toLowerCase();
}

function getCurrentUserPin() {
  return localStorage.getItem(AUTH_PIN_KEY) || "";
}

function getCurrentUserRole() {
  return localStorage.getItem(AUTH_ROLE_KEY) || (findLocalOmniUser(getCurrentUserEmail())?.role || "USER");
}

function getCurrentUserName() {
  const saved = localStorage.getItem(AUTH_NAME_KEY);
  if (saved) return saved;
  const u = findLocalOmniUser(getCurrentUserEmail());
  return u ? u.name : "Nhân sự Omni";
}

function getUserInitials(name) {
  const parts = (name || "BN").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name || "BN").slice(0, 2).toUpperCase();
}

function applyAuthenticatedUserToUI() {
  const email = getCurrentUserEmail();
  const name = getCurrentUserName();
  const role = getCurrentUserRole();
  const nameEl = document.getElementById("sidebar-user-name");
  const emailEl = document.getElementById("sidebar-user-email");
  const avatarEl = document.getElementById("sidebar-user-avatar");
  const adminBtn = document.getElementById("btn-admin-users");

  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (avatarEl) avatarEl.textContent = getUserInitials(name);
  if (adminBtn) adminBtn.classList.toggle("hidden", role !== "ADMIN");
  if (typeof syncWelcomeAccountGreeting === "function") syncWelcomeAccountGreeting();
}

function openAuthLoginModal() {
  const overlay = document.getElementById("auth-login-overlay");
  if (!overlay) return;
  const inp = document.getElementById("auth-email-input");
  const pinInp = document.getElementById("auth-pin-input");
  if (inp) inp.value = localStorage.getItem(AUTH_EMAIL_KEY) || "";
  if (pinInp) pinInp.value = "";
  overlay.classList.remove("hidden");
}

async function handleAuthLoginSubmit(e) {
  e.preventDefault();
  const inp = document.getElementById("auth-email-input");
  const pinInp = document.getElementById("auth-pin-input");
  const errEl = document.getElementById("auth-error-msg");
  const email = (inp?.value || "").trim().toLowerCase();
  const pin = (pinInp?.value || "").trim();

  if (errEl) errEl.classList.add("hidden");

  let authenticatedUser = null;

  // Nếu đã kết nối Google Sheets API -> Xác thực trực tiếp với tab Users trên Server
  const apiUrl = localStorage.getItem("bryan_portal_api") || "";
  if (apiUrl) {
    try {
      const sep = apiUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${apiUrl}${sep}action=login&user_email=${encodeURIComponent(email)}&user_pin=${encodeURIComponent(pin)}`);
      const data = await res.json();
      if (data && data.success && data.user) {
        authenticatedUser = data.user;
      } else {
        if (errEl) {
          errEl.textContent = data?.error || "Sai Email hoặc Mã PIN, hoặc tài khoản chưa được cấp quyền.";
          errEl.classList.remove("hidden");
        }
        return;
      }
    } catch (err) {
      // Fallback sang local whitelist nếu mất mạng
    }
  }

  if (!authenticatedUser) {
    const localU = findLocalOmniUser(email);
    if (!localU || String(localU.pin) !== String(pin)) {
      if (errEl) {
        errEl.textContent = "Email chưa được Admin cấp quyền hoặc Mã PIN không chính xác.";
        errEl.classList.remove("hidden");
      }
      return;
    }
    authenticatedUser = localU;
  }

  localStorage.setItem(AUTH_EMAIL_KEY, authenticatedUser.email.toLowerCase());
  localStorage.setItem(AUTH_NAME_KEY, authenticatedUser.name || "Nhân sự Omni");
  localStorage.setItem(AUTH_PIN_KEY, pin);
  localStorage.setItem(AUTH_ROLE_KEY, authenticatedUser.role || "USER");

  document.getElementById("auth-login-overlay")?.classList.add("hidden");
  applyAuthenticatedUserToUI();
  window.location.reload();
}

function logoutCurrentUser() {
  localStorage.removeItem(AUTH_EMAIL_KEY);
  localStorage.removeItem(AUTH_NAME_KEY);
  localStorage.removeItem(AUTH_PIN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  openAuthLoginModal();
}

// ---------------- ĐỔI MÃ PIN CÁ NHÂN ----------------
function ensureChangePinModal() {
  if (document.getElementById("modal-change-pin")) return;
  const div = document.createElement("div");
  div.id = "modal-change-pin";
  div.className = "hidden fixed inset-0 z-[10001] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="text-sm font-black">Đổi Mã PIN / Mật Khẩu</h3>
        <button onclick="document.getElementById('modal-change-pin').classList.add('hidden')" class="text-slate-300 hover:text-white text-sm">✕</button>
      </div>
      <form onsubmit="handleChangeOwnPin(event)" class="p-5 space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Mã PIN hiện tại *</label>
          <input id="pin-old-input" type="password" required class="w-full p-2.5 border border-slate-300 rounded-xl outline-none" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Mã PIN mới (tối thiểu 4 ký tự) *</label>
          <input id="pin-new-input" type="password" minlength="4" required class="w-full p-2.5 border border-slate-300 rounded-xl outline-none" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Nhập lại Mã PIN mới *</label>
          <input id="pin-confirm-input" type="password" minlength="4" required class="w-full p-2.5 border border-slate-300 rounded-xl outline-none" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="document.getElementById('modal-change-pin').classList.add('hidden')" class="px-3.5 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">Hủy</button>
          <button type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold">Cập nhật PIN</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}

function openChangePinModal() {
  ensureChangePinModal();
  document.getElementById("pin-old-input").value = "";
  document.getElementById("pin-new-input").value = "";
  document.getElementById("pin-confirm-input").value = "";
  document.getElementById("modal-change-pin").classList.remove("hidden");
}

function handleChangeOwnPin(e) {
  e.preventDefault();
  const oldPin = document.getElementById("pin-old-input").value.trim();
  const newPin = document.getElementById("pin-new-input").value.trim();
  const confirmPin = document.getElementById("pin-confirm-input").value.trim();
  const email = getCurrentUserEmail();

  if (oldPin !== getCurrentUserPin()) {
    showToast("Mã PIN hiện tại không đúng.", true);
    return;
  }
  if (newPin !== confirmPin) {
    showToast("Mã PIN nhập lại không khớp.", true);
    return;
  }

  const users = getLocalOmniUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email);
  if (idx !== -1) {
    users[idx].pin = newPin;
    saveLocalOmniUsers(users);
  }
  localStorage.setItem(AUTH_PIN_KEY, newPin);

  if (typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({ action: "CHANGE_PIN", owner_email: email, owner_pin: oldPin, new_pin: newPin });
  }

  document.getElementById("modal-change-pin").classList.add("hidden");
  showToast("Đã cập nhật Mã PIN mới thành công!");
}

// ---------------- ADMIN CẤP & QUẢN LÝ TÀI KHOẢN (10 NHÂN SỰ) ----------------
function ensureAdminUsersModal() {
  if (document.getElementById("modal-admin-users")) return;
  const div = document.createElement("div");
  div.id = "modal-admin-users";
  div.className = "hidden fixed inset-0 z-[10001] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
      <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 class="text-sm font-black">Quản Lý & Cấp Tài Khoản Phòng Omni</h3>
          <p class="text-[11px] text-slate-300">Chỉ tài khoản được Admin cấp mới có quyền đăng nhập (người dùng tự đổi PIN sau khi vào)</p>
        </div>
        <button onclick="document.getElementById('modal-admin-users').classList.add('hidden')" class="text-slate-300 hover:text-white text-sm">✕</button>
      </div>
      <div class="p-5 space-y-4 overflow-y-auto text-xs">
        <form onsubmit="handleAdminProvisionUser(event)" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          <div class="sm:col-span-4">
            <label class="block text-[10px] font-bold text-slate-600 mb-1">Email nhân sự *</label>
            <input id="admin-add-email" type="email" required placeholder="nhanvien@vietunion.com.vn" class="w-full px-2.5 py-2 border border-slate-300 rounded-xl outline-none" />
          </div>
          <div class="sm:col-span-3">
            <label class="block text-[10px] font-bold text-slate-600 mb-1">Họ tên *</label>
            <input id="admin-add-name" type="text" required placeholder="VD: Minh Anh" class="w-full px-2.5 py-2 border border-slate-300 rounded-xl outline-none" />
          </div>
          <div class="sm:col-span-3">
            <label class="block text-[10px] font-bold text-slate-600 mb-1">Mã PIN khởi tạo *</label>
            <input id="admin-add-pin" type="text" required minlength="4" value="123456" class="w-full px-2.5 py-2 border border-slate-300 rounded-xl font-mono outline-none" />
          </div>
          <div class="sm:col-span-2">
            <button type="submit" class="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold">+ Cấp TK</button>
          </div>
        </form>
        <div id="admin-users-list" class="space-y-2"></div>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

function openAdminUsersModal() {
  if (getCurrentUserRole() !== "ADMIN") {
    showToast("Chỉ Admin mới có quyền cấp tài khoản.", true);
    return;
  }
  ensureAdminUsersModal();
  renderAdminUsersList();
  document.getElementById("modal-admin-users").classList.remove("hidden");
}

function renderAdminUsersList() {
  const list = document.getElementById("admin-users-list");
  if (!list) return;
  const users = getLocalOmniUsers();
  list.innerHTML = users.map(u => `
    <div class="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-900">${u.name}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-teal-50 text-teal-800'}">${u.role}</span>
          ${u.active === false ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Đã khóa</span>' : ''}
        </div>
        <div class="text-[11px] text-slate-500 font-mono">${u.email} • PIN: ${u.pin}</div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        ${u.email !== getCurrentUserEmail() ? `
          <button onclick="adminToggleUserActive('${u.email}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700">${u.active === false ? 'Mở khóa' : 'Khóa'}</button>
          <button onclick="adminRemoveUser('${u.email}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold">Xóa</button>
        ` : '<span class="text-[10px] text-slate-400 font-semibold">Đang đăng nhập</span>'}
      </div>
    </div>
  `).join('');
}

function handleAdminProvisionUser(e) {
  e.preventDefault();
  const email = document.getElementById("admin-add-email").value.trim().toLowerCase();
  const name = document.getElementById("admin-add-name").value.trim();
  const pin = document.getElementById("admin-add-pin").value.trim();
  if (!email || !name || !pin) return;

  const users = getLocalOmniUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email);
  const newUser = { email, name, role: "USER", pin, active: true };
  if (idx !== -1) users[idx] = { ...users[idx], ...newUser };
  else users.push(newUser);
  saveLocalOmniUsers(users);

  if (typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({ action: "ADMIN_UPSERT_USER", target_user: newUser });
  }

  document.getElementById("admin-add-email").value = "";
  document.getElementById("admin-add-name").value = "";
  renderAdminUsersList();
  showToast(`Đã cấp tài khoản cho ${email} (PIN: ${pin})!`);
}

function adminToggleUserActive(email) {
  const users = getLocalOmniUsers();
  const u = users.find(item => item.email.toLowerCase() === email.toLowerCase());
  if (!u) return;
  u.active = u.active === false;
  saveLocalOmniUsers(users);
  if (typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({ action: "ADMIN_UPSERT_USER", target_user: u });
  }
  renderAdminUsersList();
}

function adminRemoveUser(email) {
  const users = getLocalOmniUsers().filter(u => u.email.toLowerCase() !== email.toLowerCase());
  saveLocalOmniUsers(users);
  if (typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({ action: "ADMIN_DELETE_USER", target_email: email });
  }
  renderAdminUsersList();
  showToast(`Đã gỡ tài khoản ${email}.`);
}

window.addEventListener("DOMContentLoaded", () => {
  const existingEmail = localStorage.getItem(AUTH_EMAIL_KEY);
  const existingPin = localStorage.getItem(AUTH_PIN_KEY);
  const localU = existingEmail ? findLocalOmniUser(existingEmail) : null;
  if (!existingEmail || !existingPin || (localU && String(localU.pin) !== String(existingPin))) {
    openAuthLoginModal();
  } else {
    applyAuthenticatedUserToUI();
  }
});

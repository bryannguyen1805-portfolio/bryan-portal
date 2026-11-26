// -------------------------------------------------------------
// MULTI-USER AUTHENTICATION (STRICT WHITELIST + PIN) & ADMIN PROVISIONING
// -------------------------------------------------------------

const AUTH_EMAIL_KEY = "bryan_portal_current_user_email";
const AUTH_NAME_KEY = "bryan_portal_current_user_name";
const AUTH_PIN_KEY = "bryan_portal_current_user_pin";
const AUTH_ROLE_KEY = "bryan_portal_current_user_role";
const AUTH_REMEMBER_KEY = "bryan_portal_remember_creds_v1";
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
  return getLocalOmniUsers().find(u => u.email.toLowerCase() === e && u.active !== false && !u.deleted_at) || null;
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
  const remCheck = document.getElementById("auth-remember-check");
  let savedCreds = null;
  try {
    savedCreds = JSON.parse(localStorage.getItem(AUTH_REMEMBER_KEY) || "null");
  } catch (e) {}

  if (inp) inp.value = (savedCreds && savedCreds.email) || localStorage.getItem(AUTH_EMAIL_KEY) || "";
  if (pinInp) pinInp.value = (savedCreds && savedCreds.pin) || "";
  if (remCheck) remCheck.checked = savedCreds ? true : true;
  overlay.classList.remove("hidden");
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function toggleAuthPinVisibility() {
  const pinInp = document.getElementById("auth-pin-input");
  const icon = document.getElementById("auth-pin-eye-icon");
  if (!pinInp) return;
  const nextType = pinInp.type === "password" ? "text" : "password";
  pinInp.type = nextType;
  if (icon) {
    icon.setAttribute("data-lucide", nextType === "text" ? "eye-off" : "eye");
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
}

function ensureForgotPinModal() {
  if (document.getElementById("modal-forgot-pin")) return;
  const div = document.createElement("div");
  div.id = "modal-forgot-pin";
  div.className = "hidden fixed inset-0 z-[10020] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 class="text-sm font-black">Khôi Phục Mã PIN / Mật Khẩu</h3>
          <p class="text-[10px] text-slate-300">Nhận mã OTP 6 số qua Email công ty / cá nhân đã cấp quyền</p>
        </div>
        <button type="button" onclick="closeForgotPinModal()" class="text-slate-300 hover:text-white text-sm">✕</button>
      </div>
      <div class="p-5 space-y-3.5 text-xs">
        <div id="forgot-pin-alert" class="hidden p-2.5 rounded-xl text-[11px] font-semibold"></div>

        <form id="forgot-step-1-form" onsubmit="handleSendResetOtp(event)" class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email tài khoản *</label>
            <input id="forgot-email-input" type="email" required placeholder="vd: tri.nguyen2@vietunion.com.vn" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-teal-600" />
          </div>
          <div class="flex justify-end gap-2 pt-1">
            <button type="button" onclick="closeForgotPinModal()" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600">Hủy</button>
            <button id="forgot-send-otp-btn" type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition">Gửi mã OTP</button>
          </div>
        </form>

        <form id="forgot-step-2-form" onsubmit="handleConfirmResetPin(event)" class="hidden space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mã OTP 6 số (trong Email) *</label>
            <input id="forgot-otp-input" type="text" inputmode="numeric" maxlength="6" required placeholder="Nhập 6 số OTP..." class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-teal-600 font-mono tracking-widest text-center font-bold" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mã PIN mới (tối thiểu 4 ký tự) *</label>
            <input id="forgot-new-pin-input" type="password" minlength="4" required placeholder="Nhập Mã PIN mới..." class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-teal-600" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nhập lại Mã PIN mới *</label>
            <input id="forgot-confirm-pin-input" type="password" minlength="4" required placeholder="Xác nhận Mã PIN mới..." class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-teal-600" />
          </div>
          <div class="flex items-center justify-between gap-2 pt-1">
            <button type="button" onclick="showForgotStep(1)" class="text-[11px] font-bold text-slate-500 hover:text-teal-700">← Gửi lại OTP</button>
            <button id="forgot-confirm-btn" type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition">Đặt lại PIN</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

function showForgotAlert(msg, isError = false) {
  const box = document.getElementById("forgot-pin-alert");
  if (!box) return;
  if (!msg) {
    box.classList.add("hidden");
    return;
  }
  box.textContent = msg;
  box.className = isError
    ? "p-2.5 rounded-xl text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
    : "p-2.5 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200";
  box.classList.remove("hidden");
}

function showForgotStep(step) {
  const s1 = document.getElementById("forgot-step-1-form");
  const s2 = document.getElementById("forgot-step-2-form");
  if (s1) s1.classList.toggle("hidden", step !== 1);
  if (s2) s2.classList.toggle("hidden", step !== 2);
}

function openForgotPinNote() {
  ensureForgotPinModal();
  const loginEmail = (document.getElementById("auth-email-input")?.value || "").trim().toLowerCase();
  const fEmail = document.getElementById("forgot-email-input");
  if (fEmail) fEmail.value = loginEmail;
  ["forgot-otp-input", "forgot-new-pin-input", "forgot-confirm-pin-input"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  showForgotAlert("");
  showForgotStep(1);
  document.getElementById("modal-forgot-pin")?.classList.remove("hidden");
}

function closeForgotPinModal() {
  document.getElementById("modal-forgot-pin")?.classList.add("hidden");
}

async function handleSendResetOtp(e) {
  e.preventDefault();
  const email = (document.getElementById("forgot-email-input")?.value || "").trim().toLowerCase();
  const btn = document.getElementById("forgot-send-otp-btn");
  const apiUrl = (typeof API_ENDPOINT !== "undefined" && API_ENDPOINT) ? API_ENDPOINT : (localStorage.getItem("bryan_portal_api") || "");
  if (!apiUrl) {
    showForgotAlert("Chưa kết nối Google Apps Script API. Vui lòng liên hệ Admin để cấp lại PIN.", true);
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = "Đang gửi OTP..."; }
  showForgotAlert("");
  try {
    const sep = apiUrl.includes("?") ? "&" : "?";
    const res = await fetch(`${apiUrl}${sep}action=sendResetOtp&user_email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data && data.success) {
      showForgotAlert(data.message || `Đã gửi mã OTP tới ${email}.`, false);
      showForgotStep(2);
      setTimeout(() => document.getElementById("forgot-otp-input")?.focus(), 50);
    } else {
      showForgotAlert(data?.error || "Không thể gửi OTP. Vui lòng kiểm tra lại Email.", true);
    }
  } catch (err) {
    showForgotAlert("Lỗi kết nối máy chủ khi gửi OTP. Vui lòng thử lại sau.", true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Gửi mã OTP"; }
  }
}

async function handleConfirmResetPin(e) {
  e.preventDefault();
  const email = (document.getElementById("forgot-email-input")?.value || "").trim().toLowerCase();
  const otp = (document.getElementById("forgot-otp-input")?.value || "").trim();
  const newPin = (document.getElementById("forgot-new-pin-input")?.value || "").trim();
  const confirmPin = (document.getElementById("forgot-confirm-pin-input")?.value || "").trim();
  const btn = document.getElementById("forgot-confirm-btn");

  if (newPin.length < 4) {
    showForgotAlert("Mã PIN mới phải có tối thiểu 4 ký tự.", true);
    return;
  }
  if (newPin !== confirmPin) {
    showForgotAlert("Mã PIN xác nhận không khớp.", true);
    return;
  }
  const apiUrl = (typeof API_ENDPOINT !== "undefined" && API_ENDPOINT) ? API_ENDPOINT : (localStorage.getItem("bryan_portal_api") || "");
  if (!apiUrl) {
    showForgotAlert("Chưa kết nối Google Apps Script API.", true);
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = "Đang xử lý..."; }
  showForgotAlert("");
  try {
    const sep = apiUrl.includes("?") ? "&" : "?";
    const res = await fetch(`${apiUrl}${sep}action=confirmResetPin&user_email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&new_pin=${encodeURIComponent(newPin)}`);
    const data = await res.json();
    if (data && data.success) {
      const localUsers = getLocalOmniUsers();
      const idx = localUsers.findIndex(u => u.email.toLowerCase() === email);
      if (idx !== -1) {
        localUsers[idx].pin = newPin;
        saveLocalOmniUsers(localUsers);
      }
      const loginEmailEl = document.getElementById("auth-email-input");
      const loginPinEl = document.getElementById("auth-pin-input");
      if (loginEmailEl) loginEmailEl.value = email;
      if (loginPinEl) loginPinEl.value = newPin;
      closeForgotPinModal();
      if (typeof showToast === "function") showToast("✓ Đã đặt lại Mã PIN mới thành công! Bấm Đăng nhập để vào hệ thống.");
    } else {
      showForgotAlert(data?.error || "Mã OTP không hợp lệ hoặc đã hết hạn.", true);
    }
  } catch (err) {
    showForgotAlert("Lỗi kết nối máy chủ khi đặt lại PIN.", true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Đặt lại PIN"; }
  }
}

function openBportalTermsModal() {
  let modal = document.getElementById("modal-bportal-terms");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-bportal-terms";
    modal.className = "fixed inset-0 z-[10005] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4";
    modal.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h3 class="text-sm font-black">Điều Khoản &amp; Chính Sách Sử Dụng BPortal</h3>
          <button onclick="document.getElementById('modal-bportal-terms').classList.add('hidden')" class="text-slate-300 hover:text-white text-sm">✕</button>
        </div>
        <div class="p-5 space-y-3 text-xs text-slate-600 leading-relaxed max-h-[65vh] overflow-y-auto">
          <p><strong class="text-slate-900">1. Phạm vi sử dụng:</strong> BPortal là không gian điều phối công việc và dữ liệu chuỗi đối tác B2B dành cho tài khoản được Admin cấp quyền.</p>
          <p><strong class="text-slate-900">2. Bảo mật tài khoản:</strong> Người dùng tự chịu trách nhiệm bảo mật Mã PIN / Mật khẩu cá nhân và không chia sẻ tài khoản ra bên ngoài.</p>
          <p><strong class="text-slate-900">3. Dữ liệu &amp; Quyền riêng tư:</strong> Dữ liệu từng tài khoản được cô lập riêng theo email. Tài khoản khi bị xóa sẽ được lưu trữ tạm 7 ngày trước khi xóa vĩnh viễn.</p>
          <p class="text-[11px] text-slate-400 italic">(Nội dung chính sách chi tiết sẽ tiếp tục được cập nhật thêm).</p>
        </div>
        <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button type="button" onclick="document.getElementById('modal-bportal-terms').classList.add('hidden')" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold">Đã hiểu</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.remove("hidden");
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
  const apiUrl = (typeof API_ENDPOINT !== "undefined" && API_ENDPOINT) ? API_ENDPOINT : (localStorage.getItem("bryan_portal_api") || "");
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

  const remCheck = document.getElementById("auth-remember-check");
  if (remCheck && remCheck.checked) {
    localStorage.setItem(AUTH_REMEMBER_KEY, JSON.stringify({ email: authenticatedUser.email.toLowerCase(), pin }));
  } else {
    localStorage.removeItem(AUTH_REMEMBER_KEY);
  }

  // Đồng bộ lại local whitelist với PIN vừa xác thực thành công từ Server (tránh PIN mặc định 180526 đá văng khi reload)
  const localUsers = getLocalOmniUsers();
  const uIdx = localUsers.findIndex(u => u.email.toLowerCase() === authenticatedUser.email.toLowerCase());
  const syncedUser = {
    email: authenticatedUser.email.toLowerCase(),
    name: authenticatedUser.name || "Nhân sự Omni",
    role: authenticatedUser.role || "USER",
    pin: pin,
    active: true
  };
  if (uIdx !== -1) localUsers[uIdx] = { ...localUsers[uIdx], ...syncedUser };
  else localUsers.push(syncedUser);
  saveLocalOmniUsers(localUsers);

  document.getElementById("auth-login-overlay")?.classList.add("hidden");
  applyAuthenticatedUserToUI();
  window.location.reload();
}

async function logoutCurrentUser() {
  if (typeof flushFullCloudSyncNow === "function") {
    await flushFullCloudSyncNow();
  }
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

  // Đồng bộ danh sách User mới nhất từ Google Sheets (kể cả danh sách chờ xóa 7 ngày)
  if (typeof API_ENDPOINT !== "undefined" && API_ENDPOINT) {
    const sep = API_ENDPOINT.includes("?") ? "&" : "?";
    fetch(`${API_ENDPOINT}${sep}action=listUsers&user_email=${encodeURIComponent(getCurrentUserEmail())}&user_pin=${encodeURIComponent(getCurrentUserPin())}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.users)) {
          saveLocalOmniUsers(data.users);
          renderAdminUsersList();
        }
      })
      .catch(() => {});
  }
}

function renderAdminUsersList() {
  const list = document.getElementById("admin-users-list");
  if (!list) return;
  const nowMs = Date.now();
  const allUsers = getLocalOmniUsers().filter(u => {
    if (u.deleted_at && u.purge_after && new Date(u.purge_after).getTime() <= nowMs) return false;
    return true;
  });
  const activeUsers = allUsers.filter(u => !u.deleted_at);
  const trashUsers = allUsers.filter(u => !!u.deleted_at);

  const activeHtml = activeUsers.map(u => `
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
          <button onclick="adminRemoveUser('${u.email}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold" title="Đưa vào thùng rác 7 ngày trước khi xóa sạch dữ liệu">Xóa (7 ngày)</button>
        ` : '<span class="text-[10px] text-slate-400 font-semibold">Đang đăng nhập</span>'}
      </div>
    </div>
  `).join('');

  const trashHtml = trashUsers.length > 0 ? `
    <div class="pt-3 mt-3 border-t border-dashed border-rose-200 space-y-2">
      <div class="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">
        Thùng rác / Chờ xóa dữ liệu (${trashUsers.length}) — Tự động xóa sạch sau 7 ngày
      </div>
      ${trashUsers.map(u => {
        const daysLeft = Math.max(0, Math.ceil((new Date(u.purge_after).getTime() - nowMs) / 86400000));
        const purgeDateStr = u.purge_after ? new Date(u.purge_after).toLocaleDateString("vi-VN") : "";
        return `
          <div class="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-slate-800 line-through">${u.name}</span>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Còn ${daysLeft} ngày (xóa ${purgeDateStr})</span>
              </div>
              <div class="text-[11px] text-slate-500 font-mono">${u.email}</div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="adminRestoreUser('${u.email}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">Khôi phục</button>
              <button onclick="adminPurgeUserNow('${u.email}')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold">Xóa ngay</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  list.innerHTML = activeHtml + trashHtml;
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
  const target = email.toLowerCase();
  const nowIso = new Date().toISOString();
  const purgeAfterIso = new Date(Date.now() + 7 * 86400000).toISOString();
  const users = getLocalOmniUsers().map(u => {
    if (u.email.toLowerCase() === target) {
      return { ...u, active: false, deleted_at: nowIso, purge_after: purgeAfterIso };
    }
    return u;
  });
  saveLocalOmniUsers(users);
  if (typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({ action: "ADMIN_DELETE_USER", target_email: target });
  }
  renderAdminUsersList();
  showToast(`Đã đưa ${target} vào chờ xóa (tự xóa toàn bộ dữ liệu sau 7 ngày nếu không khôi phục).`);
}

function adminRestoreUser(email) {
  const target = email.toLowerCase();
  const users = getLocalOmniUsers().map(u => {
    if (u.email.toLowerCase() === target) {
      const next = { ...u, active: true };
      delete next.deleted_at;
      delete next.purge_after;
      return next;
    }
    return u;
  });
  saveLocalOmniUsers(users);
  if (typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({ action: "ADMIN_RESTORE_USER", target_email: target });
  }
  renderAdminUsersList();
  showToast(`✓ Đã khôi phục tài khoản & toàn bộ dữ liệu cho ${target}!`);
}

function adminPurgeUserNow(email) {
  const target = email.toLowerCase();
  if (!confirm(`Xác nhận XÓA VĨNH VIỄN ngay lập tức tài khoản "${target}" và TOÀN BỘ dữ liệu liên quan (không thể khôi phục)?`)) {
    return;
  }
  const users = getLocalOmniUsers().filter(u => u.email.toLowerCase() !== target);
  saveLocalOmniUsers(users);
  // Dọn dữ liệu local của user đó trên trình duyệt hiện tại nếu có
  try {
    const safeKey = target.replace(/[^a-z0-9]/g, "_");
    ["bryan_portal_state_v2_" + safeKey, "bryan_portal_onboarding_v2_" + safeKey].forEach(k => localStorage.removeItem(k));
  } catch (e) {}

  if (typeof postDataToGoogleSheets === "function") {
    postDataToGoogleSheets({ action: "ADMIN_PURGE_USER", target_email: target });
  }
  renderAdminUsersList();
  showToast(`Đã xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của ${target}.`);
}

window.addEventListener("DOMContentLoaded", () => {
  const existingEmail = localStorage.getItem(AUTH_EMAIL_KEY);
  const existingPin = localStorage.getItem(AUTH_PIN_KEY);
  const hasCloudApi = typeof API_ENDPOINT !== "undefined" && !!API_ENDPOINT;
  const localU = existingEmail ? findLocalOmniUser(existingEmail) : null;
  if (!existingEmail || !existingPin || (!hasCloudApi && (!localU || String(localU.pin) !== String(existingPin)))) {
    openAuthLoginModal();
  } else {
    applyAuthenticatedUserToUI();
  }
});

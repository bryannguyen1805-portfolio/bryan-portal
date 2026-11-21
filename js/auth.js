// -------------------------------------------------------------
// MULTI-USER AUTHENTICATION & WORKSPACE ISOLATION (OMNI TEAM)
// -------------------------------------------------------------

const AUTH_EMAIL_KEY = "bryan_portal_current_user_email";
const AUTH_NAME_KEY = "bryan_portal_current_user_name";

// Danh sách 10 nhân sự phòng Omni được phép truy cập (hoặc domain @vietunion.com.vn)
const OMNI_ALLOWED_EMAILS = [
  "tri.nguyen2@vietunion.com.vn",
  "quantritc1805@gmail.com"
];

function isAuthorizedOmniEmail(email) {
  const e = (email || "").trim().toLowerCase();
  if (!e || !e.includes("@")) return false;
  if (OMNI_ALLOWED_EMAILS.includes(e)) return true;
  return e.endsWith("@vietunion.com.vn");
}

function getCurrentUserEmail() {
  return (localStorage.getItem(AUTH_EMAIL_KEY) || "tri.nguyen2@vietunion.com.vn").trim().toLowerCase();
}

function getCurrentUserName() {
  const saved = localStorage.getItem(AUTH_NAME_KEY);
  if (saved) return saved;
  const email = getCurrentUserEmail();
  if (email.startsWith("tri.nguyen2") || email.startsWith("quantritc1805")) return "Bryan Nguyen";
  const localPart = email.split("@")[0].replace(/[._0-9]+/g, " ").trim();
  return localPart ? localPart.replace(/\b\w/g, c => c.toUpperCase()) : "Nhân sự Omni";
}

function getUserInitials(name) {
  const parts = (name || "BN").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name || "BN").slice(0, 2).toUpperCase();
}

function applyAuthenticatedUserToUI() {
  const email = getCurrentUserEmail();
  const name = getCurrentUserName();
  const nameEl = document.getElementById("sidebar-user-name");
  const emailEl = document.getElementById("sidebar-user-email");
  const avatarEl = document.getElementById("sidebar-user-avatar");

  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (avatarEl) avatarEl.textContent = getUserInitials(name);
  if (typeof syncWelcomeAccountGreeting === "function") syncWelcomeAccountGreeting();
}

function openAuthLoginModal() {
  const overlay = document.getElementById("auth-login-overlay");
  if (!overlay) return;
  const inp = document.getElementById("auth-email-input");
  if (inp) inp.value = localStorage.getItem(AUTH_EMAIL_KEY) || "";
  overlay.classList.remove("hidden");
}

function handleAuthLoginSubmit(e) {
  e.preventDefault();
  const inp = document.getElementById("auth-email-input");
  const nameInp = document.getElementById("auth-name-input");
  const errEl = document.getElementById("auth-error-msg");
  const email = (inp?.value || "").trim().toLowerCase();

  if (!isAuthorizedOmniEmail(email)) {
    if (errEl) {
      errEl.textContent = "Email chưa nằm trong danh sách phòng Omni (@vietunion.com.vn). Vui lòng kiểm tra lại.";
      errEl.classList.remove("hidden");
    }
    return;
  }

  if (errEl) errEl.classList.add("hidden");
  localStorage.setItem(AUTH_EMAIL_KEY, email);
  const customName = (nameInp?.value || "").trim();
  if (customName) {
    localStorage.setItem(AUTH_NAME_KEY, customName);
  } else {
    localStorage.removeItem(AUTH_NAME_KEY);
  }

  document.getElementById("auth-login-overlay")?.classList.add("hidden");
  applyAuthenticatedUserToUI();
  // Tải lại trang để nạp đúng không gian dữ liệu cô lập theo email mới
  window.location.reload();
}

function logoutCurrentUser() {
  localStorage.removeItem(AUTH_EMAIL_KEY);
  localStorage.removeItem(AUTH_NAME_KEY);
  openAuthLoginModal();
}

window.addEventListener("DOMContentLoaded", () => {
  const existingEmail = localStorage.getItem(AUTH_EMAIL_KEY);
  if (!existingEmail || !isAuthorizedOmniEmail(existingEmail)) {
    openAuthLoginModal();
  } else {
    applyAuthenticatedUserToUI();
  }
});

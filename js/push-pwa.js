// -------------------------------------------------------------
// BPORTAL PWA & WEB PUSH / FCM CLIENT ENGINE
// -------------------------------------------------------------
const BPORTAL_FCM_CONFIG_KEY = "bportal_fcm_config_v1";
const BPORTAL_FCM_TOKEN_KEY = "bportal_fcm_token_v1";

let bportalSwRegistration = null;
let deferredPwaInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPwaInstallPrompt = e;
  updatePwaInstallButtonVisibility();
});

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalonePwaMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updatePwaInstallButtonVisibility() {
  const btn = document.getElementById("btn-install-pwa");
  if (!btn) return;
  if (isStandalonePwaMode()) {
    btn.classList.add("hidden");
  } else if (deferredPwaInstallPrompt || isIosDevice()) {
    btn.classList.remove("hidden");
  }
}

async function registerBportalServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  // Service Worker chỉ chạy trên HTTPS hoặc localhost (không chạy trên file://)
  if (location.protocol === "file:") return null;
  try {
    bportalSwRegistration = await navigator.serviceWorker.register("firebase-messaging-sw.js");
    return bportalSwRegistration;
  } catch (err) {
    console.warn("BPortal SW registration failed:", err);
    return null;
  }
}

async function promptInstallBportalPwa() {
  if (deferredPwaInstallPrompt) {
    deferredPwaInstallPrompt.prompt();
    const { outcome } = await deferredPwaInstallPrompt.userChoice;
    deferredPwaInstallPrompt = null;
    if (outcome === "accepted") {
      showToast("✓ Đã cài BPortal làm ứng dụng trên thiết bị!");
    }
    updatePwaInstallButtonVisibility();
    return;
  }
  if (isIosDevice() && !isStandalonePwaMode()) {
    showToast("Trên iPhone: bấm nút Chia sẻ (↑) ở Safari → chọn 'Thêm vào Màn hình chính' để nhận Push khi đóng trình duyệt.");
    return;
  }
  showToast("Trên MacBook/Chrome: bấm biểu tượng Cài đặt (⊕) ở cuối thanh địa chỉ để cài BPortal thành App.");
}

async function sendTestOsPushNotification() {
  if (typeof Notification === "undefined") {
    showToast("Trình duyệt hiện tại không hỗ trợ Notification.");
    return;
  }
  if (Notification.permission !== "granted") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      showToast("Bạn chưa cấp quyền thông báo cho BPortal.");
      return;
    }
  }

  const urgentCount = (typeof state !== "undefined" && Array.isArray(state.tasks))
    ? state.tasks.filter(t => t.stage !== "STAGE_DONE").length
    : 0;

  const title = "BPortal • Kiểm tra thông báo đẩy";
  const options = {
    body: urgentCount > 0
      ? `Hệ thống đang hoạt động! Bạn hiện có ${urgentCount} đầu việc đang mở.`
      : "Thông báo đẩy trên thiết bị đã sẵn sàng hoạt động!",
    icon: "android-chrome-192x192.png",
    tag: "bportal-test-push"
  };

  if (bportalSwRegistration && bportalSwRegistration.showNotification) {
    await bportalSwRegistration.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
  showToast("✓ Đã gửi thử 1 thông báo đẩy ra màn hình thiết bị!");
}

window.addEventListener("DOMContentLoaded", () => {
  registerBportalServiceWorker();
  updatePwaInstallButtonVisibility();
});

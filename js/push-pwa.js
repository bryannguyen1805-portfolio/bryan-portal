// -------------------------------------------------------------
// BPORTAL PWA & FIREBASE CLOUD MESSAGING (FCM) CLIENT ENGINE
// -------------------------------------------------------------
const BPORTAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCPzOVDec7NjwypmuiKnhW7BQUEO9BSXJ4",
  authDomain: "bryan-portal.firebaseapp.com",
  projectId: "bryan-portal",
  storageBucket: "bryan-portal.firebasestorage.app",
  messagingSenderId: "181983650223",
  appId: "1:181983650223:web:a1e0a3a1296b77f36a0f5a",
  measurementId: "G-7V3XPRP8SW"
};
const BPORTAL_VAPID_KEY = "BFqw5M41QGFa0rdvOGAN8sIOsL40Q4Mz6P5ilvjuV8_UlCNd2vyLszL9bKR1WrDBE_MBbKFAFPIdXXVXfs4eH8s";
const BPORTAL_FCM_TOKEN_KEY = "bportal_fcm_token_v1";

let bportalSwRegistration = null;
let deferredPwaInstallPrompt = null;
let fcmSdkPromise = null;

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

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureFirebaseMessagingReady() {
  if (location.protocol === "file:") return null;
  if (!fcmSdkPromise) {
    fcmSdkPromise = (async () => {
      await loadScriptOnce("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
      await loadScriptOnce("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
      if (typeof firebase === "undefined") return null;
      if (!firebase.apps.length) {
        firebase.initializeApp(BPORTAL_FIREBASE_CONFIG);
      }
      const messaging = firebase.messaging();
      messaging.onMessage((payload) => {
        const notif = payload.notification || payload.data || {};
        const title = notif.title || "BPortal • Nhắc việc";
        const body = notif.body || "";
        if (typeof showToast === "function") showToast(`${title}: ${body}`);
        if (bportalSwRegistration && Notification.permission === "granted") {
          bportalSwRegistration.showNotification(title, {
            body,
            icon: "android-chrome-192x192.png",
            tag: "bportal-fcm-fg"
          });
        }
      });
      return messaging;
    })().catch(err => {
      console.warn("FCM SDK load error:", err);
      return null;
    });
  }
  return fcmSdkPromise;
}

async function registerBportalServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  if (location.protocol === "file:") return null;
  try {
    bportalSwRegistration = await navigator.serviceWorker.register("firebase-messaging-sw.js");
    return bportalSwRegistration;
  } catch (err) {
    console.warn("BPortal SW registration failed:", err);
    return null;
  }
}

async function enableFcmDevicePush(silent = false) {
  if (location.protocol === "file:") {
    if (!silent) showToast("Web Push chỉ chạy trên link HTTPS chính thức (không chạy qua file://).");
    return null;
  }
  if (isIosDevice() && !isStandalonePwaMode()) {
    if (!silent) showToast("Trên iPhone: bấm Chia sẻ (↑) → 'Thêm vào Màn hình chính', sau đó mở app vừa cài để bật Push.");
    return null;
  }
  if (typeof Notification === "undefined") {
    if (!silent) showToast("Trình duyệt hiện tại không hỗ trợ Notification.");
    return null;
  }
  if (Notification.permission !== "granted") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      if (!silent) showToast("Bạn chưa cấp quyền thông báo đẩy cho BPortal.");
      return null;
    }
  }

  const swReg = bportalSwRegistration || await registerBportalServiceWorker();
  const messaging = await ensureFirebaseMessagingReady();
  if (!swReg || !messaging) {
    if (!silent) showToast("Không khởi tạo được Firebase Messaging trên trình duyệt này.");
    return null;
  }

  try {
    const token = await messaging.getToken({
      vapidKey: BPORTAL_VAPID_KEY,
      serviceWorkerRegistration: swReg
    });
    if (token) {
      localStorage.setItem(BPORTAL_FCM_TOKEN_KEY, token);
      if (typeof postDataToGoogleSheets === "function") {
        postDataToGoogleSheets({
          action: "REGISTER_PUSH_TOKEN",
          token,
          platform: isIosDevice() ? "iOS-PWA" : navigator.platform
        });
      }
      if (!silent) showToast("✓ Đã kích hoạt Web Push thiết bị & đồng bộ FCM Token!");
      return token;
    }
  } catch (err) {
    console.warn("getToken failed:", err);
    if (!silent) showToast("Lỗi lấy FCM Token: " + (err.message || err));
  }
  return null;
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
  await enableFcmDevicePush(true);
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    showToast("Hãy cấp quyền thông báo cho BPortal để thử Push.");
    return;
  }

  const urgentCount = (typeof state !== "undefined" && Array.isArray(state.tasks))
    ? state.tasks.filter(t => t.stage !== "STAGE_DONE").length
    : 0;

  const title = "BPortal • Kiểm tra thông báo đẩy";
  const options = {
    body: urgentCount > 0
      ? `Hệ thống Push đã kết nối FCM! Bạn hiện có ${urgentCount} đầu việc đang mở.`
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

window.addEventListener("DOMContentLoaded", async () => {
  await registerBportalServiceWorker();
  updatePwaInstallButtonVisibility();
  if (typeof Notification !== "undefined" && Notification.permission === "granted" && localStorage.getItem(BPORTAL_FCM_TOKEN_KEY)) {
    enableFcmDevicePush(true);
  }
});

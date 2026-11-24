/* =============================================================
   BPORTAL UNIFIED PWA & FIREBASE CLOUD MESSAGING SERVICE WORKER
   Handles installability + background FCM Web Push notifications
   ============================================================= */

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCPzOVDec7NjwypmuiKnhW7BQUEO9BSXJ4",
  authDomain: "bryan-portal.firebaseapp.com",
  projectId: "bryan-portal",
  storageBucket: "bryan-portal.firebasestorage.app",
  messagingSenderId: "181983650223",
  appId: "1:181983650223:web:a1e0a3a1296b77f36a0f5a",
  measurementId: "G-7V3XPRP8SW"
});

const messaging = firebase.messaging();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch pass-through so browser recognizes BPortal as installable PWA
self.addEventListener("fetch", () => {});

// Handle FCM background messages when browser / tabs are closed
messaging.onBackgroundMessage((payload) => {
  const notif = payload.notification || payload.data || {};
  const title = notif.title || "BPortal • Nhắc việc tới hạn";
  const options = {
    body: notif.body || "Bạn có đầu việc hoặc lịch họp cần xử lý trong hôm nay.",
    icon: "android-chrome-192x192.png",
    badge: "android-chrome-192x192.png",
    tag: notif.tag || "bportal-fcm-push",
    renotify: true,
    data: {
      url: notif.url || "./"
    }
  };
  return self.registration.showNotification(title, options);
});

// Focus or open BPortal when user taps notification on MacBook / iPhone
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

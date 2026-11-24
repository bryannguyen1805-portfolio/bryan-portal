/* =============================================================
   BPORTAL UNIFIED PWA & WEB PUSH SERVICE WORKER
   Handles offline-ready installability + background Web Push / FCM
   ============================================================= */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch pass-through so browser recognizes BPortal as installable PWA
self.addEventListener("fetch", () => {});

// Handle incoming Web Push / FCM payload even when browser tabs are closed
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { notification: { title: "BPortal Nhắc Việc", body: event.data ? event.data.text() : "" } };
  }

  const notif = payload.notification || payload.data || {};
  const title = notif.title || "BPortal • Nhắc việc tới hạn";
  const options = {
    body: notif.body || "Bạn có đầu việc hoặc lịch họp cần xử lý trong hôm nay.",
    icon: "android-chrome-192x192.png",
    badge: "android-chrome-192x192.png",
    tag: notif.tag || "bportal-deadline-push",
    renotify: true,
    data: {
      url: notif.url || "./"
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
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

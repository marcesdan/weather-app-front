/// <reference lib="webworker" />
import { runCheck } from "./lib/watch";

declare const self: ServiceWorkerGlobalScope;
type PeriodicSyncEvent = ExtendableEvent & { tag: string };

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Chrome/Edge with the app installed only; the browser picks the interval (often ~12 h).
// shortcut: best-effort background checks; move to server push (VAPID/FCM) if alerts must arrive on time.
self.addEventListener("periodicsync", (e) => {
  const ev = e as PeriodicSyncEvent;
  if (ev.tag === "weather-alerts") ev.waitUntil(runCheck((t, o) => self.registration.showNotification(t, o)).then(() => {}));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data as { url?: string } | null)?.url ?? "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const open = wins.find((w) => new URL(w.url).origin === self.location.origin);
      return open ? open.navigate(url).then((w) => w?.focus()) : self.clients.openWindow(url);
    }),
  );
});

import { useEffect } from "react";
import { usePlaces } from "./places";
import { runCheck } from "./watch";

export const notificationsSupported = () => typeof window !== "undefined" && "Notification" in window;

// Module worker so it can share src/lib with the page. Dev serves the TS source; the build emits /sw.js.
async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    await navigator.serviceWorker.register(import.meta.env.DEV ? "/src/sw.ts" : "/sw.js", { type: "module", scope: "/" });
    return await navigator.serviceWorker.ready;
  } catch {
    return null; // browsers without module service workers fall back to page notifications
  }
}

type Opts = NotificationOptions & { image?: string };
async function show(title: string, options: Opts) {
  const reg = await registration();
  if (reg) return reg.showNotification(title, options);
  new Notification(title, options);
}

// Asks for permission once and keeps a background check registered while any place has alerts on.
export async function ensureAlertPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (permission !== "granted") return permission;
  const reg = await registration();
  const sync = (reg as (ServiceWorkerRegistration & { periodicSync?: { register(tag: string, o: { minInterval: number }): Promise<void> } }) | null)
    ?.periodicSync;
  await sync?.register("weather-alerts", { minInterval: 60 * 60_000 }).catch(() => {}); // needs the installed app
  return permission;
}

export const sendTestAlert = () =>
  show("Prueba: ráfagas de temporal", {
    body: "Así se ve un aviso. Tocá para abrir el observatorio.",
    tag: "test",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    image: "/alerts/wind.png",
    data: { url: "/observatory" },
  });

// While the app is open: check on start and every 30 minutes, for the places that have alerts on.
// The service worker covers the closed app where it can.
export function useAlertWatch() {
  const watched = usePlaces().filter((p) => p.alerts).map((p) => p.id).join(",");
  useEffect(() => {
    if (!watched || !notificationsSupported() || Notification.permission !== "granted") return;
    const tick = () => void runCheck(show).catch(() => {});
    tick();
    const id = setInterval(tick, 30 * 60_000);
    return () => clearInterval(id);
  }, [watched]);
}

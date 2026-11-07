import { useEffect } from "react";
import { getPref, setPref, usePref } from "./prefs";
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

export async function enableAlerts(): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;
  setPref("alerts", "on");
  const reg = await registration();
  const sync = (reg as (ServiceWorkerRegistration & { periodicSync?: { register(tag: string, o: { minInterval: number }): Promise<void> } }) | null)
    ?.periodicSync;
  await sync?.register("weather-alerts", { minInterval: 60 * 60_000 }).catch(() => {}); // needs the installed app
  return permission;
}

export async function disableAlerts() {
  setPref("alerts", "off");
  const reg = await registration();
  const sync = (reg as (ServiceWorkerRegistration & { periodicSync?: { unregister(tag: string): Promise<void> } }) | null)?.periodicSync;
  await sync?.unregister("weather-alerts").catch(() => {});
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

const alertsOn = () => getPref<"on" | "off">("alerts", "off") === "on" && notificationsSupported() && Notification.permission === "granted";

// While the app is open: check on start and every 30 minutes. The service worker covers the closed app where it can.
export function useAlertWatch() {
  const [pref] = usePref<"on" | "off">("alerts", "off");
  useEffect(() => {
    if (!alertsOn()) return;
    const tick = () => void runCheck(show).catch(() => {});
    tick();
    const id = setInterval(tick, 30 * 60_000);
    return () => clearInterval(id);
  }, [pref]);
}

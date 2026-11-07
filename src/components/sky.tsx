import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { startSky, type SkyHandle } from "./sky-gl";
import { skyAt, skyFrom, type Sky } from "@/lib/sky";
import { useHere, useWeather } from "@/lib/queries";

// The hour picked in the home strip (index into hourly), shared with the sky behind every page.
let picked: number | null = null;
const listeners = new Set<() => void>();
export const skyHour = {
  get: () => picked,
  set(i: number | null) {
    picked = i;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
export const useSkyHour = () => useSyncExternalStore(skyHour.subscribe, skyHour.get, () => null);

// A calm dusk while the first forecast loads, so the sky never flashes a wrong state.
const WAITING: Sky = { day: 0.35, golden: 0.4, sunX: 0.8, sunY: 0.1, cloud: 0.3, rain: 0, snow: 0, storm: 0, fog: 0, windX: 2, windY: 0 };

export function SkyLayer() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const handle = useRef<SkyHandle>(null);
  const { pathname } = useLocation();
  const here = useHere().data;
  const { data: w } = useWeather(here?.lat ?? 0, here?.lon ?? 0, !!here);
  const hour = useSkyHour();
  let target = w ? skyAt(w, pathname === "/" ? hour : null) : WAITING;
  // Dev-only QA preview of any OpenWeatherMap state: /?sky=502&night=1&wind=12 (removed from production builds).
  if (import.meta.env.DEV && w) {
    const q = new URLSearchParams(location.search);
    const id = Number(q.get("sky"));
    if (id) {
      const at = q.get("night") ? w.current.sunset + 4 * 3600 : q.get("dusk") ? w.current.sunset : w.current.sunrise + 6 * 3600;
      target = skyFrom(w, at, { weather: [{ id, main: "", description: "", icon: "" }], clouds: Number(q.get("clouds") ?? 60), wind_deg: 270, wind_speed: Number(q.get("wind") ?? 6) });
    }
  }

  useEffect(() => {
    handle.current = startSky(canvas.current!, WAITING);
    return () => handle.current?.stop();
  }, []);

  const key = JSON.stringify(target);
  useEffect(() => {
    handle.current?.set(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // The observatory draws its own map: hide the sky there (size 0 stops its loop).
  const hidden = pathname.startsWith("/observatory");
  return (
    <div aria-hidden className="sky-backdrop fixed inset-0 bg-[oklch(0.25_0.06_260)]" style={{ display: hidden ? "none" : undefined }}>
      <canvas ref={canvas} className="size-full" data-testid="sky" />
    </div>
  );
}

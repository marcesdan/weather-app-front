import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { startSky, type SkyHandle } from "./sky-gl";
import { skyAt, skyFrom, type Sky } from "@/lib/sky";
import { useHere, useWeather } from "@/lib/queries";
import { usePlaces } from "@/lib/places";

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

// While the first forecast loads: a plain day or night sky by the device clock, half cloudy, no warm tint
// (a fixed dusk read as a brown night until the data arrived).
const localHour = new Date().getHours();
const WAITING: Sky = { day: localHour >= 7 && localHour < 20 ? 1 : 0, golden: 0, sunX: 0.5, sunY: 0.75, cloud: 0.5, rain: 0, snow: 0, storm: 0, fog: 0, windX: 2, windY: 0 };

export function SkyLayer() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const handle = useRef<SkyHandle>(null);
  const { pathname } = useLocation();
  const here = useHere().data;
  const placeId = pathname.match(/^\/lugar\/([^/]+)/)?.[1];
  const place = usePlaces().find((p) => p.id === placeId);
  const spot = place ?? here; // the sky shows the place on screen
  const { data: w } = useWeather(spot?.lat ?? 0, spot?.lon ?? 0, !!spot);
  const hour = useSkyHour();
  const onHome = pathname === "/" || !!place;
  let target = w ? skyAt(w, onHome ? hour : null) : WAITING;
  // Dev-only QA preview of any OpenWeatherMap state: /?sky=502&night=1&wind=12 (removed from production builds).
  if (import.meta.env.DEV && w) {
    const q = new URLSearchParams(location.search);
    const id = Number(q.get("sky"));
    if (id) {
      const at = q.get("night") ? w.current.sunset + 4 * 3600 : q.get("dusk") ? w.current.sunset : w.current.sunrise + 6 * 3600;
      target = skyFrom(w, at, { weather: [{ id, main: "", description: "", icon: "" }], clouds: Number(q.get("clouds") ?? 60), wind_deg: 270, wind_speed: Number(q.get("wind") ?? 6) });
    }
  }

  // A picked hour belongs to the screen it was picked on.
  useEffect(() => skyHour.set(null), [pathname]);

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

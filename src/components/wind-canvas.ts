import type { Map as LeafletMap } from "leaflet";
import { sample, type Series } from "@/lib/openmeteo";

export type Field = {
  rows: number;
  cols: number;
  south: number;
  west: number;
  north: number;
  east: number;
  atmo: Series[];
  sea: Series[];
};

export type Layer = "wind" | "waves" | "storm" | "rain";

// Value per layer and the top of its color scale; colors run the Astropia amber ramp (chart-1 → chart-5) then danger red.
export const LAYERS: Record<Layer, { label: string; unit: string; max: number; get: (f: Field, i: number, hour: number) => number | null }> = {
  wind: { label: "Viento", unit: "kn", max: 40, get: (f, i, h) => kn(f.atmo[i]?.wind_speed_10m?.[h]) },
  waves: { label: "Olas", unit: "m", max: 5, get: (f, i, h) => f.sea[i]?.wave_height?.[h] ?? null },
  storm: { label: "Tormenta", unit: "J/kg", max: 2500, get: (f, i, h) => f.atmo[i]?.cape?.[h] ?? null },
  rain: { label: "Lluvia", unit: "mm/h", max: 15, get: (f, i, h) => f.atmo[i]?.precipitation?.[h] ?? null },
};
const kn = (ms: number | null | undefined) => (ms == null ? null : ms * 1.943844);

const RAMP = ["0.88 0.15 92", "0.77 0.16 70", "0.67 0.16 58", "0.56 0.15 49", "0.47 0.12 46", "0.55 0.22 27"];
export const rampColor = (t: number, alpha: number) => {
  const i = Math.max(0, Math.min(RAMP.length - 1, Math.round(t * (RAMP.length - 1))));
  return `oklch(${RAMP[i]} / ${alpha})`;
};
export const RAMP_CSS = `linear-gradient(to right, ${RAMP.map((c) => `oklch(${c})`).join(", ")})`;

// Fractional grid row/col for a lat/lon inside the field.
const frac = (f: Field, lat: number, lon: number) => [
  ((lat - f.south) / (f.north - f.south)) * (f.rows - 1),
  ((lon - f.west) / (f.east - f.west)) * (f.cols - 1),
];

// Wind as a vector (m/s, east and north) so directions interpolate across north (350° and 10° average to 0°, not 180°).
function windAt(f: Field, hour: number, lat: number, lon: number): [number, number] | null {
  const [fr, fc] = frac(f, lat, lon);
  if (fr < 0 || fc < 0 || fr > f.rows - 1 || fc > f.cols - 1) return null;
  const [u, v] = uv(f, hour);
  const su = sample(u, f.rows, f.cols, fr, fc);
  const sv = sample(v, f.rows, f.cols, fr, fc);
  return su == null || sv == null ? null : [su, sv];
}
// Per-frame hot path: build the u/v grids once per field and hour.
const uvCache = new WeakMap<Field, Map<number, [(number | null)[], (number | null)[]]>>();
function uv(f: Field, hour: number) {
  let byHour = uvCache.get(f);
  if (!byHour) uvCache.set(f, (byHour = new Map()));
  let hit = byHour.get(hour);
  if (!hit) byHour.set(hour, (hit = [f.atmo.map((s) => vec(s, hour, "u")), f.atmo.map((s) => vec(s, hour, "v"))]));
  return hit;
}
function vec(s: Series, h: number, axis: "u" | "v") {
  const speed = s.wind_speed_10m?.[h];
  const dir = s.wind_direction_10m?.[h];
  if (speed == null || dir == null) return null;
  const rad = (dir * Math.PI) / 180; // direction the wind comes FROM
  return axis === "u" ? -speed * Math.sin(rad) : -speed * Math.cos(rad);
}

// Paint one pixel per 12 css px on a small canvas, then scale it up smoothed: a soft field instead of blocks.
const low = typeof document !== "undefined" ? document.createElement("canvas") : null;
export function drawHeat(ctx: CanvasRenderingContext2D, map: LeafletMap, f: Field, layer: Layer, hour: number) {
  const { width, height } = ctx.canvas;
  const dpr = window.devicePixelRatio || 1;
  const step = 12;
  const spec = LAYERS[layer];
  const values = f.atmo.map((_, i) => spec.get(f, i, hour));
  const w = Math.ceil(width / dpr / step);
  const h = Math.ceil(height / dpr / step);
  // Ionic keeps a left page mounted but hidden (size 0); there is nothing to paint until it shows again.
  if (!w || !h) return;
  low!.width = w;
  low!.height = h;
  const lc = low!.getContext("2d")!;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const ll = map.containerPointToLatLng([(x + 0.5) * step, (y + 0.5) * step]);
      const [fr, fc] = frac(f, ll.lat, ll.lng);
      if (fr < 0 || fc < 0 || fr > f.rows - 1 || fc > f.cols - 1) continue;
      const v = sample(values, f.rows, f.cols, fr, fc);
      if (v == null || v <= 0) continue;
      const t = Math.min(1, v / spec.max);
      lc.fillStyle = rampColor(t, 0.06 + t * 0.5); // calm stays clear so the map reads; strong values stand out
      lc.fillRect(x, y, 1, 1);
    }
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(low!, 0, 0, w * step * dpr, h * step * dpr);
}

type Particle = { x: number; y: number; age: number };

// Animated wind particles; with reduced motion it draws one still arrow field instead.
export function startParticles(ctx: CanvasRenderingContext2D, map: LeafletMap, getField: () => Field | null, getHour: () => number, color: () => string) {
  const dpr = window.devicePixelRatio || 1;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = () => Math.round((ctx.canvas.width * ctx.canvas.height) / (dpr * dpr * 1400));
  let ps: Particle[] = [];
  let raf = 0;
  const spawn = (): Particle => ({ x: Math.random() * ctx.canvas.width, y: Math.random() * ctx.canvas.height, age: Math.random() * 80 });

  const wind = (x: number, y: number) => {
    const f = getField();
    if (!f) return null;
    const ll = map.containerPointToLatLng([x / dpr, y / dpr]);
    return windAt(f, getHour(), ll.lat, ll.lng);
  };

  const drawStill = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = color();
    ctx.lineWidth = 1.5 * dpr;
    const gap = 48 * dpr;
    for (let y = gap / 2; y < ctx.canvas.height; y += gap)
      for (let x = gap / 2; x < ctx.canvas.width; x += gap) {
        const w = wind(x, y);
        if (!w) continue;
        const len = Math.min(22, 4 + Math.hypot(...w) * 1.2) * dpr;
        const a = Math.atan2(-w[1], w[0]);
        const ex = x + Math.cos(a) * len;
        const ey = y + Math.sin(a) * len;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.lineTo(ex - Math.cos(a - 0.5) * 6 * dpr, ey - Math.sin(a - 0.5) * 6 * dpr);
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - Math.cos(a + 0.5) * 6 * dpr, ey - Math.sin(a + 0.5) * 6 * dpr);
        ctx.stroke();
      }
  };

  const frame = () => {
    const c = ctx.canvas;
    if (ps.length !== count()) ps = Array.from({ length: count() }, spawn);
    // Fade the previous frame to leave short trails.
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color();
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    for (const p of ps) {
      const w = wind(p.x, p.y);
      if (!w || p.age++ > 100) {
        Object.assign(p, spawn(), { age: 0 });
        continue;
      }
      const nx = p.x + w[0] * 0.35 * dpr;
      const ny = p.y - w[1] * 0.35 * dpr;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      p.x = nx;
      p.y = ny;
      if (nx < 0 || ny < 0 || nx > c.width || ny > c.height) Object.assign(p, spawn(), { age: 0 });
    }
    ctx.stroke();
    raf = requestAnimationFrame(frame);
  };

  const restart = () => {
    cancelAnimationFrame(raf);
    // Hidden page in Ionic's stack: no animation loop until it is visible again (resize brings it back).
    if (!ctx.canvas.width || !ctx.canvas.height) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ps = [];
    if (still) drawStill();
    else raf = requestAnimationFrame(frame);
  };
  restart();
  return { restart, stop: () => cancelAnimationFrame(raf) };
}

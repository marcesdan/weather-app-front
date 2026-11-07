// Open-Meteo: free, no key, CORS on. Free tier is non-commercial only (10k calls/day).
// shortcut: client calls Open-Meteo directly; move behind the backend (with a cache) if the app goes commercial or busy.
export const HOURS = 72;

const ATMO = ["wind_speed_10m", "wind_direction_10m", "wind_gusts_10m", "pressure_msl", "cape", "precipitation", "temperature_2m"] as const;
const SEA = [
  "wave_height",
  "wave_direction",
  "wave_period",
  "swell_wave_height",
  "swell_wave_direction",
  "swell_wave_period",
  "sea_surface_temperature",
  "sea_level_height_msl",
] as const;

export type AtmoVar = (typeof ATMO)[number];
export type SeaVar = (typeof SEA)[number];
export type Series = { time: number[] } & Partial<Record<AtmoVar | SeaVar, (number | null)[]>>;
export type Point = { lat: number; lon: number };

type Raw = { latitude: number; longitude: number; hourly: Record<string, (number | string | null)[]> };

async function call(host: string, path: string, vars: readonly string[], pts: Point[]): Promise<Series[]> {
  const qs = new URLSearchParams({
    latitude: pts.map((p) => p.lat.toFixed(3)).join(","),
    longitude: pts.map((p) => p.lon.toFixed(3)).join(","),
    hourly: vars.join(","),
    wind_speed_unit: "ms",
    forecast_hours: String(HOURS),
    timeformat: "unixtime",
    timezone: "GMT",
  });
  const res = await fetch(`https://${host}/v1/${path}?${qs}`);
  if (!res.ok) throw new Error(`open-meteo ${path} ${res.status}`);
  const body = (await res.json()) as Raw | Raw[];
  return (Array.isArray(body) ? body : [body]).map((r) => r.hourly as unknown as Series);
}

export const fetchAtmo = (pts: Point[]) => call("api.open-meteo.com", "forecast", ATMO, pts);
// Over land the marine model answers with nulls, which the UI shows as "sin datos de mar".
export const fetchSea = (pts: Point[]) => call("marine-api.open-meteo.com", "marine", SEA, pts);

export type PointForecast = { atmo: Series; sea: Series };
export async function fetchPoint(p: Point): Promise<PointForecast> {
  const [[atmo], [sea]] = await Promise.all([fetchAtmo([p]), fetchSea([p]).catch(() => [{ time: [] } as Series])]);
  return { atmo, sea };
}

// A rows x cols grid of points covering the map view, used to draw the wind field and the sea layers.
export function grid(south: number, west: number, north: number, east: number, rows = 7, cols = 7): Point[] {
  const pts: Point[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      pts.push({ lat: south + ((north - south) * r) / (rows - 1), lon: west + ((east - west) * c) / (cols - 1) });
  return pts;
}

// Bilinear sample of a grid value at fractional row/col; null cells (land in the sea model) are skipped.
export function sample(values: (number | null)[], rows: number, cols: number, fr: number, fc: number): number | null {
  const r0 = Math.max(0, Math.min(rows - 1, Math.floor(fr)));
  const c0 = Math.max(0, Math.min(cols - 1, Math.floor(fc)));
  const r1 = Math.min(rows - 1, r0 + 1);
  const c1 = Math.min(cols - 1, c0 + 1);
  const tr = Math.max(0, Math.min(1, fr - r0));
  const tc = Math.max(0, Math.min(1, fc - c0));
  const corners: [number | null, number][] = [
    [values[r0 * cols + c0], (1 - tr) * (1 - tc)],
    [values[r0 * cols + c1], (1 - tr) * tc],
    [values[r1 * cols + c0], tr * (1 - tc)],
    [values[r1 * cols + c1], tr * tc],
  ];
  let sum = 0;
  let weight = 0;
  for (const [v, w] of corners) if (v != null) ((sum += v * w), (weight += w));
  return weight > 0 ? sum / weight : null;
}

// Next 2 hours in 15-minute steps, global (covers Argentina, where OpenWeatherMap has no minute nowcast). mm per step.
export async function fetchMinutely15(p: Point): Promise<{ dt: number; precipitation: number }[]> {
  const qs = new URLSearchParams({
    latitude: p.lat.toFixed(3),
    longitude: p.lon.toFixed(3),
    minutely_15: "precipitation",
    forecast_minutely_15: "8",
    timeformat: "unixtime",
    timezone: "GMT",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs}`);
  if (!res.ok) throw new Error(`open-meteo minutely ${res.status}`);
  const m = ((await res.json()) as { minutely_15: { time: number[]; precipitation: (number | null)[] } }).minutely_15;
  return m.time.map((dt, i) => ({ dt, precipitation: (m.precipitation[i] ?? 0) * 4 })); // mm per 15 min -> mm/h
}

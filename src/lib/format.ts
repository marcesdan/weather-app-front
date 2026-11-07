// Times are shown in the place's own time zone (from the API), never the browser's.

// es-AR pads hours ("02"); strip it so the strip reads "2 h".
export const fmtHour = (unix: number, timeZone: string) =>
  `${Number(new Intl.DateTimeFormat("es-AR", { hour: "numeric", hourCycle: "h23", timeZone }).format(unix * 1000))} h`;

export const fmtDate = (unix: number, timeZone: string) =>
  capitalize(new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone }).format(unix * 1000));

export const fmtWeekday = (unix: number, timeZone: string) =>
  capitalize(new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone }).format(unix * 1000).replace(".", ""));

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const pct = (pop: number) => `${Math.round(pop * 100)}%`;

export type WindUnit = "kn" | "ms" | "kmh";
const FACTOR: Record<WindUnit, number> = { kn: 1.943844, ms: 1, kmh: 3.6 };
export const UNIT_LABEL: Record<WindUnit, string> = { kn: "kn", ms: "m/s", kmh: "km/h" };

export const fromMs = (ms: number, unit: WindUnit) => ms * FACTOR[unit];
export const fmtWind = (ms: number, unit: WindUnit) => `${Math.round(fromMs(ms, unit))} ${UNIT_LABEL[unit]}`;

// Beaufort upper bounds in m/s (WMO).
const BEAUFORT = [0.5, 1.5, 3.3, 5.5, 7.9, 10.7, 13.8, 17.1, 20.7, 24.4, 28.4, 32.6];
export const beaufort = (ms: number) => {
  const i = BEAUFORT.findIndex((max) => ms < max);
  return i === -1 ? 12 : i;
};
export const BEAUFORT_NAME = [
  "Calma",
  "Ventolina",
  "Flojito",
  "Flojo",
  "Bonancible",
  "Fresquito",
  "Fresco",
  "Frescachón",
  "Temporal",
  "Temporal fuerte",
  "Temporal duro",
  "Temporal muy duro",
  "Huracán",
];

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
// Meteorological direction: where the wind (or swell) comes FROM.
export const compass = (deg: number) => COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];

type HourLike = { dt: number; temp: number; pop: number; wind_gust?: number; wind_speed: number };
// One plain sentence about the next 24 h, built only from the forecast (OpenWeatherMap's own summary is English-only).
export function nextDay(hours: HourLike[], tz: string, unit: WindUnit): string {
  const next = hours.slice(1, 25);
  if (!next.length) return "";
  const peak = next.reduce((a, b) => (b.temp > a.temp ? b : a));
  const low = next.reduce((a, b) => (b.temp < a.temp ? b : a));
  const wet = next.find((h) => h.pop >= 0.4);
  const gust = Math.max(...next.map((h) => h.wind_gust ?? h.wind_speed));
  const parts = [
    peak.temp - next[0].temp >= 1
      ? `Sube a ${Math.round(peak.temp)}° a las ${fmtHour(peak.dt, tz)}`
      : `Baja a ${Math.round(low.temp)}° a las ${fmtHour(low.dt, tz)}`,
    wet ? `lluvia probable desde las ${fmtHour(wet.dt, tz)} (${pct(wet.pop)})` : "sin lluvia a la vista",
    `ráfagas de hasta ${fmtWind(gust, unit)}`,
  ];
  return capitalize(parts.join(", ")) + ".";
}

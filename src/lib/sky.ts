import type { OneCall } from "./api";

// Everything the sky shader draws, derived only from OpenWeatherMap's typed state (condition id, clouds %, wind,
// sunrise/sunset). Values are 0..1 unless noted.
export type Sky = {
  day: number; // 0 night, 1 full day; twilight in between
  golden: number; // sunrise/sunset glow
  sunX: number; // sun (or moon) across the sky, 0 left .. 1 right
  sunY: number; // height, 0 horizon .. 1 high
  cloud: number;
  rain: number;
  snow: number;
  storm: number;
  fog: number;
  windX: number; // m/s toward the east (screen right)
  windY: number; // m/s toward the north
};

const TWILIGHT = 45 * 60; // seconds of twilight on each side of sunrise/sunset

type Cond = Pick<OneCall["current"], "weather" | "clouds" | "wind_deg" | "wind_speed">;

export function skyFrom(w: Pick<OneCall, "current" | "daily">, at = w.current.dt, cond: Cond = w.current): Sky {
  // The day whose solar noon is closest to this moment (an hour picked for tomorrow morning uses tomorrow's sunrise).
  const day0 = w.daily.reduce<(typeof w.daily)[number] | undefined>(
    (best, d) => (!best || Math.abs(at - (d.sunrise + d.sunset) / 2) < Math.abs(at - (best.sunrise + best.sunset) / 2) ? d : best),
    undefined,
  );
  const { sunrise, sunset } = day0 ?? { sunrise: w.current.sunrise, sunset: w.current.sunset };
  const smooth = (x: number) => Math.min(1, Math.max(0, x));
  const day = smooth(Math.min((at - sunrise + TWILIGHT) / (2 * TWILIGHT), (sunset + TWILIGHT - at) / (2 * TWILIGHT)));
  const nearEdge = Math.min(Math.abs(at - sunrise), Math.abs(at - sunset));
  const golden = smooth(1 - nearEdge / (1.5 * 3600));
  const t = (at - sunrise) / Math.max(1, sunset - sunrise); // 0 at sunrise, 1 at sunset
  const sunX = day > 0 ? smooth(t) : 0.5;
  const sunY = day > 0 ? smooth(Math.sin(Math.PI * smooth(t))) : 0.75; // night: a high moon

  const id = cond.weather[0]?.id ?? 800;
  const g = Math.floor(id / 100);
  const clouds = (cond.clouds ?? 0) / 100;
  const rain =
    g === 3 ? 0.3 : g === 5 ? (id === 500 || id === 520 ? 0.45 : id === 501 || id === 521 ? 0.7 : 1) : g === 2 ? 0.8 : 0;
  const snow = g === 6 ? (id === 600 || id === 620 ? 0.5 : 1) : 0;
  const storm = g === 2 ? 1 : 0;
  const fog = g === 7 ? (id === 741 ? 0.9 : id === 701 ? 0.55 : 0.4) : 0;
  // Precipitation needs a sky to fall from even when the reported cover is low.
  const cloud = Math.max(clouds, rain > 0 || snow > 0 ? 0.75 : 0, storm ? 0.95 : 0);

  const rad = ((cond.wind_deg ?? 0) * Math.PI) / 180; // where the wind comes FROM
  const speed = cond.wind_speed ?? 0;
  return { day, golden: golden * (day > 0 && day < 1 ? 1 : day > 0 ? 0.5 : 0), sunX, sunY, cloud, rain, snow, storm, fog, windX: -speed * Math.sin(rad), windY: -speed * Math.cos(rad) };
}

// The hour the person picked in the strip, or now.
export function skyAt(w: OneCall, hourIndex: number | null): Sky {
  if (hourIndex == null) return skyFrom(w);
  const h = w.hourly[hourIndex];
  return skyFrom(w, h.dt, h);
}

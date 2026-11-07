import type { PointForecast } from "./openmeteo";
import { fromMs } from "./format";

export type AlertKind = "wind" | "waves" | "storm" | "rain";
export type Alert = { kind: AlertKind; at: number; title: string; body: string; value: number };

// shortcut: fixed thresholds tuned for small craft and surf; make them per-place settings if users ask.
export const THRESHOLDS = {
  gustKn: 34, // Beaufort 8, gale
  waveM: 2.5,
  capeJkg: 1500, // strong convection
  rainMmH: 10,
};

const LOOKAHEAD_H = 24;

// First hour in the next 24 h that crosses each threshold; at most one alert per kind.
export function evaluate({ atmo, sea }: PointForecast, now = Date.now() / 1000): Alert[] {
  const out: Alert[] = [];
  const first = (time: number[], values: (number | null)[] | undefined, test: (v: number) => boolean) => {
    if (!values) return null;
    for (let i = 0; i < time.length; i++) {
      if (time[i] < now - 3600 || time[i] > now + LOOKAHEAD_H * 3600) continue;
      const v = values[i];
      if (v != null && test(v)) return { at: time[i], v };
    }
    return null;
  };

  const gust = first(atmo.time, atmo.wind_gusts_10m, (v) => fromMs(v, "kn") >= THRESHOLDS.gustKn);
  if (gust) {
    const kn = Math.round(fromMs(gust.v, "kn"));
    out.push({ kind: "wind", at: gust.at, value: kn, title: "Ráfagas de temporal", body: `Ráfagas de ${kn} kn` });
  }
  const wave = first(sea.time, sea.wave_height, (v) => v >= THRESHOLDS.waveM);
  if (wave) out.push({ kind: "waves", at: wave.at, value: wave.v, title: "Mar gruesa", body: `Olas de ${wave.v.toFixed(1)} m` });
  const cape = first(atmo.time, atmo.cape, (v) => v >= THRESHOLDS.capeJkg);
  if (cape) out.push({ kind: "storm", at: cape.at, value: cape.v, title: "Riesgo de tormenta", body: `Energía convectiva ${Math.round(cape.v)} J/kg` });
  const rain = first(atmo.time, atmo.precipitation, (v) => v >= THRESHOLDS.rainMmH);
  if (rain) out.push({ kind: "rain", at: rain.at, value: rain.v, title: "Lluvia intensa", body: `${rain.v.toFixed(0)} mm en una hora` });
  return out;
}

// One notification per place, kind and day: re-checks every 30 min must not repeat it.
export const alertTag = (placeId: string, a: Alert) => `${placeId}:${a.kind}:${new Date(a.at * 1000).toISOString().slice(0, 10)}`;

import { describe, expect, it } from "vitest";
import { alertTag, evaluate } from "./alerts";
import { sample } from "./openmeteo";

const now = 1_800_000_000;
const hours = (n: number) => Array.from({ length: n }, (_, i) => now + i * 3600);

describe("alerts", () => {
  it("flags the first gale gust and big waves inside 24 h, ignores later ones", () => {
    const time = hours(30);
    const gusts = time.map((_, i) => (i === 5 ? 18 : i === 28 ? 40 : 5)); // 18 m/s = 35 kn
    const waves = time.map((_, i) => (i === 26 ? 4 : 1)); // beyond 24 h
    const alerts = evaluate({ atmo: { time, wind_gusts_10m: gusts }, sea: { time, wave_height: waves } }, now);
    expect(alerts.map((a) => a.kind)).toEqual(["wind"]);
    expect(alerts[0].at).toBe(time[5]);
    expect(alerts[0].body).toBe("Ráfagas de 35 kn");
  });

  it("land points (null sea data) raise no wave alert", () => {
    const time = hours(5);
    expect(evaluate({ atmo: { time }, sea: { time, wave_height: time.map(() => null) } }, now)).toEqual([]);
  });

  it("tag repeats within a day so a re-check does not notify twice", () => {
    const a = { kind: "wind" as const, at: now, title: "", body: "", value: 0 };
    expect(alertTag("p1", a)).toBe(alertTag("p1", { ...a, at: now + 60 }));
  });

  it("grid sampling skips null cells", () => {
    expect(sample([1, null, 3, null], 2, 2, 0.5, 0)).toBe(2);
    expect(sample([null, null, null, null], 2, 2, 0.5, 0.5)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { skyFrom } from "./sky";

const sunrise = 1_800_000_000;
const sunset = sunrise + 14 * 3600;
const base = (over: Partial<{ dt: number; id: number; clouds: number; wind_deg: number; wind_speed: number }> = {}) => {
  const current = {
    dt: over.dt ?? sunrise + 7 * 3600,
    sunrise,
    sunset,
    clouds: over.clouds ?? 0,
    wind_deg: over.wind_deg ?? 270,
    wind_speed: over.wind_speed ?? 10,
    weather: [{ id: over.id ?? 800, main: "", description: "", icon: "" }],
  };
  return { current, daily: [{ sunrise, sunset }] } as unknown as Parameters<typeof skyFrom>[0];
};

describe("sky from OpenWeatherMap state", () => {
  it("noon is full day with the sun high; midnight is night", () => {
    const noon = skyFrom(base());
    expect(noon.day).toBe(1);
    expect(noon.sunY).toBeGreaterThan(0.95);
    const night = skyFrom(base({ dt: sunset + 5 * 3600 }));
    expect(night.day).toBe(0);
  });

  it("sunset is twilight and golden", () => {
    const s = skyFrom(base({ dt: sunset }));
    expect(s.day).toBeCloseTo(0.5, 1);
    expect(s.golden).toBeGreaterThan(0.9);
  });

  it("condition groups map to rain, snow, storm and fog", () => {
    expect(skyFrom(base({ id: 502 })).rain).toBe(1);
    expect(skyFrom(base({ id: 500 })).rain).toBeLessThan(0.5);
    expect(skyFrom(base({ id: 601 })).snow).toBe(1);
    const storm = skyFrom(base({ id: 211 }));
    expect(storm.storm).toBe(1);
    expect(storm.cloud).toBeGreaterThan(0.9);
    expect(skyFrom(base({ id: 741 })).fog).toBeGreaterThan(0.8);
    expect(skyFrom(base({ id: 800, clouds: 10 })).cloud).toBeCloseTo(0.1);
  });

  it("rain falls from a cloudy sky even when cover is reported low", () => {
    expect(skyFrom(base({ id: 500, clouds: 5 })).cloud).toBeGreaterThanOrEqual(0.75);
  });

  it("a west wind pushes things east (screen right)", () => {
    const s = skyFrom(base({ wind_deg: 270, wind_speed: 10 }));
    expect(s.windX).toBeCloseTo(10);
    expect(Math.abs(s.windY)).toBeLessThan(1e-9);
  });

  it("an hour tomorrow morning uses tomorrow's sunrise", () => {
    const w = base({ dt: sunrise + 24 * 3600 + 3600 });
    (w as unknown as { daily: unknown[] }).daily.push({ sunrise: sunrise + 24 * 3600, sunset: sunset + 24 * 3600 });
    expect(skyFrom(w).day).toBeGreaterThan(0.5);
  });
});

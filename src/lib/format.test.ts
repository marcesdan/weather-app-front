import { describe, expect, it } from "vitest";
import { beaufort, compass, fmtDate, fmtHour, fmtWind, nextDay, pct, rainSoon } from "./format";
import { coordKey } from "./places";

describe("format", () => {
  it("rain chance multiplies before rounding (v1 always showed 0%)", () => {
    expect(pct(0.6)).toBe("60%");
    expect(pct(0.04)).toBe("4%");
  });

  it("dates follow the place's time zone, not the browser's", () => {
    const t = Date.UTC(2026, 10, 8, 2, 0) / 1000; // 02:00 UTC = 23:00 of the 7th in Buenos Aires
    expect(fmtDate(t, "America/Argentina/Buenos_Aires")).toMatch(/^Sábado, 7/);
    expect(fmtDate(t, "Europe/London")).toMatch(/^Domingo, 8/);
    expect(fmtHour(t, "UTC")).toBe("2 h");
  });

  it("wind units and Beaufort", () => {
    expect(fmtWind(10, "kn")).toBe("19 kn");
    expect(fmtWind(10, "kmh")).toBe("36 km/h");
    expect(beaufort(0.2)).toBe(0);
    expect(beaufort(18)).toBe(8);
    expect(beaufort(40)).toBe(12);
  });

  it("compass wraps and points where the wind comes from", () => {
    expect(compass(0)).toBe("N");
    expect(compass(359)).toBe("N");
    expect(compass(200)).toBe("SSO");
    expect(compass(-90)).toBe("O");
  });

  it("places on the same spot share one weather key", () => {
    expect(coordKey(-34.6037, -58.3816)).toBe(coordKey(-34.6041, -58.3819));
  });
});

describe("nextDay sentence", () => {
  it("names the peak, the first likely rain and the strongest gust", () => {
    const t = Date.UTC(2026, 10, 8, 12) / 1000;
    const hours = Array.from({ length: 30 }, (_, i) => ({
      dt: t + i * 3600,
      temp: 10 + (i === 4 ? 8 : 0),
      pop: i === 7 ? 0.6 : 0.1,
      wind_speed: 5,
      wind_gust: i === 9 ? 15 : 7,
    }));
    expect(nextDay(hours, "UTC", { wind: "kn", temp: "c" })).toBe("Sube a 18° a las 16 h, lluvia probable desde las 19 h (60%), ráfagas de hasta 29 kn.");
  });
});

describe("rain soon", () => {
  const now = 1_800_000_000;
  const at = (min: number, mm: number) => ({ dt: now + min * 60, precipitation: mm });
  it("says when it starts, when it stops, or nothing when dry", () => {
    expect(rainSoon([at(0, 0), at(5, 0), at(12, 0.8)], now)).toEqual({ raining: false, at: now + 12 * 60 });
    expect(rainSoon([at(0, 1.2), at(15, 0.5), at(30, 0)], now)).toEqual({ raining: true, at: now + 30 * 60 });
    expect(rainSoon([at(0, 1.2), at(15, 0.5)], now)).toEqual({ raining: true, at: null });
    expect(rainSoon([at(0, 0), at(15, 0.05)], now)).toBeNull();
  });
});

describe("wmo codes", () => {
  it("map to our icons and Spanish text, day and night", async () => {
    const { wmo } = await import("./wmo");
    expect(wmo(0, true)).toEqual({ icon: "01d", text: "Despejado" });
    expect(wmo(95, false)).toEqual({ icon: "11n", text: "Tormenta" });
    expect(wmo(63, true).icon).toBe("10d");
    expect(wmo(999, true).icon).toBe("03d"); // unknown code falls back to cloud
  });
});

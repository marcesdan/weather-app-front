import { describe, expect, it } from "vitest";
import { beaufort, compass, fmtDate, fmtHour, fmtWind, pct } from "./format";
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

import { test as base, expect, type Page } from "@playwright/test";
import onecall from "./data/onecall.json" with { type: "json" };
import geoDirect from "./data/geo-direct.json" with { type: "json" };

export const API = "http://api.test/api/v1";
// A spot off Mar del Plata: reverse geocoding returns [] at sea (v1 crashed there).
export const AT_SEA = { latitude: -38.3, longitude: -57.0 };

const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

// Hourly series for each requested point; gusts reach 20 m/s (39 kn) at +5 h so every point raises a gale alert.
function series(vars: string[], hours: number) {
  const t0 = Math.floor(Date.now() / 3_600_000) * 3600;
  const time = Array.from({ length: hours }, (_, i) => t0 + i * 3600);
  const value = (v: string, i: number) =>
    ({
      wind_speed_10m: 8 + (i % 6),
      wind_direction_10m: (180 + i * 5) % 360,
      wind_gusts_10m: i === 5 ? 20 : 11,
      pressure_msl: 1015 - i * 0.2,
      cape: 200,
      precipitation: 0,
      temperature_2m: 14,
      wave_height: 1.4,
      wave_direction: 170,
      wave_period: 7,
      swell_wave_height: 1.1,
      swell_wave_direction: 180,
      swell_wave_period: 9,
      sea_surface_temperature: 14,
      sea_level_height_msl: Math.sin(i / 2) * 0.5,
    })[v] ?? 0;
  return { time, ...Object.fromEntries(vars.map((v) => [v, time.map((_, i) => value(v, i))])) };
}

function openMeteo(url: URL) {
  const n = url.searchParams.get("latitude")!.split(",").length;
  const vars = url.searchParams.get("hourly")!.split(",");
  const hours = Number(url.searchParams.get("forecast_hours") ?? 72);
  const one = (i: number) => ({ latitude: 0, longitude: 0, hourly: series(vars, hours), location_id: i });
  return n === 1 ? one(0) : Array.from({ length: n }, (_, i) => one(i));
}

export type Mock = { gps: boolean; reverse: unknown[] };

// Every network call is mocked: tests never spend OpenWeatherMap, Open-Meteo or Overpass quota.
export async function mockNetwork(page: Page, { reverse = [] }: Partial<Mock> = {}) {
  await page.route(`${API}/**`, (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/api/v1/", "");
    if (path === "onecall") return route.fulfill({ json: onecall });
    if (path === "geo/direct") return route.fulfill({ json: url.searchParams.get("city")?.startsWith("Mar") ? geoDirect : [] });
    if (path === "geo/reverse") return route.fulfill({ json: reverse });
    if (path === "ip-api")
      return route.fulfill({
        json: { status: "success", city: "Rosario", regionName: "Santa Fe", country: "Argentina", countryCode: "AR", lat: -32.95, lon: -60.65, timezone: "America/Argentina/Cordoba" },
      });
    return route.fulfill({ status: 404, json: {} });
  });
  await page.route("http://api.test/api/v2/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.startsWith("/api/v2/tiles/")) return route.fulfill({ body: PNG_1PX, contentType: "image/png" });
    if (path === "/api/v2/air") {
      const t0 = Math.floor(Date.now() / 1000);
      return route.fulfill({
        json: {
          current: { dt: t0, main: { aqi: 2 }, components: { pm2_5: 8.4 } },
          forecast: Array.from({ length: 24 }, (_, i) => ({ dt: t0 + i * 3600, aqi: i === 6 ? 4 : 2, pm2_5: 9 })),
        },
      });
    }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.route(/open-meteo\.com/, (route) => route.fulfill({ json: openMeteo(new URL(route.request().url())) }));
  await page.route(/overpass-api\.de/, (route) =>
    route.fulfill({
      json: {
        elements: [
          { lat: -38.0, lon: -57.55, tags: { name: "Mar del Plata", place: "city", population: "664892" } },
          { lat: -38.27, lon: -57.84, tags: { name: "Miramar", place: "town", population: "29433" } },
          { lat: -37.9, lon: -57.7, tags: { name: "Batán", place: "town", population: "10152" } },
        ],
      },
    }),
  );
  await page.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({ body: PNG_1PX, contentType: "image/png" }));
}

export const test = base.extend<{ errors: string[] }>({
  // Uncaught page errors fail the test that caused them.
  errors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await use(errors);
    expect(errors).toEqual([]);
  },
});
export { expect };

import { useQuery } from "@tanstack/react-query";
import { fetchIpLocation, fetchOneCall, placeName, reverseGeocode } from "./api";
import { fetchPoint } from "./openmeteo";
import { coordKey } from "./places";

const TEN_MIN = 10 * 60_000; // OpenWeatherMap updates its model every 10 minutes

// One query per spot: every saved place refreshes on its own (v1 refreshed only the last one).
export const useWeather = (lat: number, lon: number, enabled = true) =>
  useQuery({
    queryKey: ["onecall", coordKey(lat, lon)],
    queryFn: () => fetchOneCall(lat, lon),
    staleTime: TEN_MIN,
    refetchInterval: TEN_MIN,
    enabled,
  });

export const usePointForecast = (lat: number, lon: number, enabled = true) =>
  useQuery({
    queryKey: ["point", coordKey(lat, lon)],
    queryFn: () => fetchPoint({ lat, lon }),
    staleTime: 30 * 60_000,
    enabled,
  });

export type Here = { name: string; lat: number; lon: number; detail: string; source: "gps" | "ip" };

const HERE_KEY = "weather.here";
const lastHere = (): Here | undefined => {
  try {
    return JSON.parse(localStorage.getItem(HERE_KEY) ?? "null") ?? undefined;
  } catch {
    return undefined;
  }
};

async function gps(): Promise<{ latitude: number; longitude: number } | null> {
  // Native asks through the OS permission sheet; the web build never ships the plugin (__NATIVE__ is a build-time constant).
  if (__NATIVE__) {
    const { Geolocation } = await import("@capacitor/geolocation");
    return Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10_000, maximumAge: 2 * 3600_000 })
      .then((p) => p.coords)
      .catch(() => null);
  }
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    // The API's own timeout does not run while the permission prompt is open; an ignored prompt must not hang the app.
    setTimeout(() => resolve(null), 12_000);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p.coords),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 2 * 3600_000, timeout: 10_000 },
    );
  });
}

// GPS first, named by reverse geocoding; ip-api when GPS is denied. At sea reverse geocoding returns [] and the
// spot keeps a coordinate name (v1 crashed there).
export async function locate(): Promise<Here> {
  const coords = await gps();
  if (coords) {
    const { latitude: lat, longitude: lon } = coords;
    const [g] = await reverseGeocode(lat, lon).catch(() => []);
    const here: Here = g
      ? { name: placeName(g), detail: [g.state, g.country].filter(Boolean).join(", "), lat, lon, source: "gps" }
      : { name: "Tu ubicación", detail: "", lat, lon, source: "gps" };
    localStorage.setItem(HERE_KEY, JSON.stringify(here));
    return here;
  }
  const ip = await fetchIpLocation();
  const here: Here = { name: ip.city, detail: [ip.regionName, ip.countryCode].filter(Boolean).join(", "), lat: ip.lat, lon: ip.lon, source: "ip" };
  localStorage.setItem(HERE_KEY, JSON.stringify(here));
  return here;
}

export const useHere = () =>
  useQuery({ queryKey: ["here"], queryFn: locate, initialData: lastHere, initialDataUpdatedAt: 0, staleTime: 30 * 60_000, retry: 1 });

export type Nearby = { name: string; lat: number; lon: number; kind: string; population: number };

// Towns and cities within 60 km from OpenStreetMap (Overpass, no key), biggest first: shortcuts in the add-city list.
export async function fetchNearby(lat: number, lon: number): Promise<Nearby[]> {
  const q = `[out:json][timeout:15];node(around:60000,${lat.toFixed(3)},${lon.toFixed(3)})[place~"^(city|town)$"][name];out 40;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: new URLSearchParams({ data: q }) });
  if (!res.ok) throw new Error(`overpass ${res.status}`);
  const { elements } = (await res.json()) as { elements: { lat: number; lon: number; tags: Record<string, string> }[] };
  return elements
    .map((e) => ({ name: e.tags["name:es"] ?? e.tags.name, lat: e.lat, lon: e.lon, kind: e.tags.place, population: Number(e.tags.population) || 0 }))
    .sort((a, b) => b.population - a.population);
}

export const useNearby = (lat?: number, lon?: number) =>
  useQuery({
    queryKey: ["nearby", lat != null && lon != null ? coordKey(lat, lon) : null],
    queryFn: () => fetchNearby(lat!, lon!),
    enabled: lat != null && lon != null,
    staleTime: 24 * 3600_000,
    retry: false,
  });

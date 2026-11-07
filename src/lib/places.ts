import { useSyncExternalStore } from "react";

// A saved place: a city found by name, or a zone the user dropped on the map and named.
export type Place = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  detail?: string; // "Buenos Aires, AR" for cities, coordinates for zones
  kind: "city" | "zone";
  alerts?: boolean; // notify for this place only (chosen per place in Ciudades)
};

const KEY = "weather.places";
const listeners = new Set<() => void>();
let cache: Place[] | null = null;

// shortcut: localStorage can be evicted by iOS WKWebView under storage pressure; use @capacitor/preferences once the native app ships.
function read(): Place[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter(isPlace) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function isPlace(p: unknown): p is Place {
  const x = p as Place;
  return !!x && typeof x.id === "string" && typeof x.name === "string" && Number.isFinite(x.lat) && Number.isFinite(x.lon);
}

function write(next: Place[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // quota or private mode: the list still lives for this session
  }
  mirrorForWorker(next);
  listeners.forEach((l) => l());
}

// The service worker cannot read localStorage, so the background alert check reads this copy.
export function mirrorForWorker(places: Place[] = read()) {
  if (typeof caches === "undefined") return;
  caches
    .open("weather-state")
    .then((c) => c.put("/state/places.json", new Response(JSON.stringify(places), { headers: { "content-type": "application/json" } })))
    .catch(() => {});
}

export const places = {
  list: read,
  add(p: Omit<Place, "id">) {
    const place = { ...p, id: crypto.randomUUID() };
    write([...read(), place]);
    return place;
  },
  remove(id: string) {
    write(read().filter((p) => p.id !== id));
  },
  setAlerts(id: string, on: boolean) {
    write(read().map((p) => (p.id === id ? { ...p, alerts: on } : p)));
  },
  rename(id: string, name: string) {
    write(read().map((p) => (p.id === id ? { ...p, name } : p)));
  },
  subscribe(l: () => void) {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      cache = null;
      l();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  },
};

export const usePlaces = () => useSyncExternalStore(places.subscribe, places.list, () => []);

// Same rounding as the weather query keys: two places on the same spot share one request.
export const coordKey = (lat: number, lon: number) => `${lat.toFixed(2)},${lon.toFixed(2)}`;

export const formatCoords = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(3)}° ${lon >= 0 ? "E" : "O"}`;

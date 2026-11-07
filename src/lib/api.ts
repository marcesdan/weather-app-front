// Backend v1 contract (weather-app-api on Render): onecall, geo/direct, geo/reverse, ip-api.
const base = import.meta.env.VITE_WEATHER_API_URL ?? "https://weather-app-api-pzz2.onrender.com/api/v1";

export type Condition = { id: number; main: string; description: string; icon: string };

type Common = {
  dt: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  wind_speed: number; // m/s (units=metric)
  wind_deg: number;
  wind_gust?: number;
  weather: Condition[];
};

export type Hour = Common & { temp: number; feels_like: number; visibility?: number; pop: number };
export type Day = Common & {
  sunrise: number;
  sunset: number;
  summary?: string;
  temp: { min: number; max: number; day: number; night: number; eve: number; morn: number };
  pop: number;
};

export type OneCall = {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: Common & { temp: number; feels_like: number; sunrise: number; sunset: number; visibility?: number };
  hourly: Hour[];
  daily: Day[];
  alerts?: { sender_name: string; event: string; start: number; end: number; description: string }[];
};

export type Geocoding = {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

export type IpApi = { status: string; city: string; regionName: string; country: string; countryCode: string; lat: number; lon: number; timezone: string };

async function get<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const res = await fetch(`${base}/${path}${qs.size ? `?${qs}` : ""}`);
  // Render answers 502 HTML while it cold-starts: never parse an error body as JSON.
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json() as Promise<T>;
}

export const fetchOneCall = (lat: number, lon: number) => get<OneCall>("onecall", { lat, lon });
export const searchCities = (city: string) => get<Geocoding[]>("geo/direct", { city });
export const reverseGeocode = (lat: number, lon: number) => get<Geocoding[]>("geo/reverse", { lat, lon });
export const fetchIpLocation = () => get<IpApi>("ip-api", {});

export const placeName = (g: Pick<Geocoding, "name" | "local_names">) => g.local_names?.es ?? g.name;

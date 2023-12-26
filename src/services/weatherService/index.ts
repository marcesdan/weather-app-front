import { Weather } from "@/store/WeatherSlice";
import { safeFetch, FetchResult } from "@/utils";

const baseUrl = import.meta.env.VITE_WEATHER_API_URL;

export async function fetchWeatherInOneCall(
  lat: number,
  lon: number
): Promise<FetchResult<Weather>> {
  return await safeFetch<Weather>(`${baseUrl}/onecall?lat=${lat}&lon=${lon}`);
}

export type Geocoding = {
  name: string;
  local_names: {
    [key: string]: string;
  };
  lat: number;
  lon: number;
  country: string;
  state?: string;
};
export async function fetchDirectGeocoding(
  city: string
): Promise<FetchResult<Geocoding[]>> {
  return await safeFetch<Geocoding[]>(`${baseUrl}/geo/direct?city=${city}`);
}

export async function fetchReverseGeocoding(
  lat: number,
  lon: number
): Promise<FetchResult<Geocoding>> {
  return await safeFetch<Geocoding>(
    `${baseUrl}/geo/reverse?lat=${lat}&lon=${lon}`
  );
}

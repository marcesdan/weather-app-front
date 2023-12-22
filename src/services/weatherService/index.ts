import { Geocoding } from "@/store/CitiesSlice";
import { WeatherData } from "@/store/WeatherSlice";
import { safeFetch, FetchResult } from "@/utils";

const baseUrl = import.meta.env.VITE_WEATHER_API_URL;

export async function fetchWeatherInOneCall(
  lat: number,
  lon: number
): Promise<FetchResult<WeatherData>> {
  return await safeFetch<WeatherData>(
    `${baseUrl}/onecall?lat=${lat}&lon=${lon}`
  );
}

export async function fetchDirectGeocoding(
  city: string
): Promise<FetchResult<Geocoding[]>> {
  return await safeFetch<Geocoding[]>(`${baseUrl}/geo/direct?city=${city}`);
}

export type ReverseGeocoding = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
};
export async function fetchReverseGeocoding(
  lat: number,
  lon: number
): Promise<FetchResult<ReverseGeocoding>> {
  return await safeFetch<ReverseGeocoding>(
    `${baseUrl}/reverse?lat=${lat}&lon=${lon}`
  );
}

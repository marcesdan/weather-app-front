import { safeFetch, FetchResult } from "@/utils";

export type GeolocationFromIpApi = {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};

export async function fetchGeolocationFromIpApi(): Promise<
  FetchResult<GeolocationFromIpApi>
> {
  return await safeFetch<GeolocationFromIpApi>(
    `${import.meta.env.VITE_IP_API_URL}?lang=es`
  );
}

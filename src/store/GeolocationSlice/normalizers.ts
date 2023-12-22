import { GeolocationFromIpApi } from "@/services/ipApiService";
import { ReverseGeocoding } from "@/services/weatherService";
import { GeolocationFromNavigator } from "@/utils";

export type NormalizedGeolocation = {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  state: string;
  timezone: string;
};

/**
 * Dado que la geolocaclización inicial puede venir de distintas fuentes,
 * se realiza una normalizacón para que el nombre de los campos sean consistentes
 * @param ipApiData
 * @param geoFromNavigator
 * @param reverseGeocodingData
 * @returns estructura normalizada
 */
export const normalizeGeolocationData = (
  ipApiData: GeolocationFromIpApi,
  geoFromNavigator: GeolocationFromNavigator,
  reverseGeocodingData: ReverseGeocoding[]
): NormalizedGeolocation => {
  const { country, countryCode, regionName, timezone } = ipApiData;
  const [{ name, state, ...restOfReverseGeocodingData }] = reverseGeocodingData;
  return {
    city: name, // para unificar el nombre del campo
    state: state ?? regionName, // state, puede no estar
    timezone,
    ...restOfReverseGeocodingData,
    country, // country en el country code en reverseGeocodingData, entonces se usa el de ip-api
    countryCode, // se usa el de ip-api para mantener consistencia
    ...geoFromNavigator,
  };
};

/**
 * Este normalizador ocurre cuando no está disponible la geo del usuario.
 * Con lo cual solo selecciona y renombra campos provenientes de ip-api
 * @param ipApiData
 * @returns estructura normalizada
 */
export const normalizeGeolocationDataFromIpaApi = (
  ipApiData: GeolocationFromIpApi
): NormalizedGeolocation => {
  const { country, countryCode, regionName, timezone, city, lat, lon } =
    ipApiData;
  return {
    city,
    lat,
    lon,
    country,
    countryCode,
    state: regionName,
    timezone,
  };
};

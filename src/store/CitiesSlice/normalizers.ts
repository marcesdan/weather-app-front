import { Geocoding } from "@/services/weatherService";

export type NormalizedGeocoding = {
  city: string;
  lat: number;
  lon: number;
  state?: string;
  country: string;
};

export type NormalizedGeocodingMap = {
  [city: string]: NormalizedGeocoding;
};

/**
 * Normaliza los datos de geocodificación convirtiéndolos en un mapa de ciudades con sus
 * correspondientes latitud y longitud. La clave es el nombre de la ciudad.
 * @param geocodingData - El array de datos de geocodificación que se va a normalizar.
 * @returns Los datos de geocodificación normalizados como un mapa de ciudades con su latitud y longitud.
 */
export const normalizeGeocodingData = (
  geocodingData: Geocoding[]
): NormalizedGeocodingMap =>
  geocodingData.reduce(
    (acc, { name, country, local_names, ...rest }) => {
      const city = local_names?.es ?? name;
      acc[city + country] = { city, country, ...rest };
      return acc;
    },
    {} as { [key: string]: NormalizedGeocoding }
  );

import { Geocoding } from "@/services/weatherService";
import { NormalizedGeocodingMap, normalizeGeocodingData } from "./normalizers";

describe("normalizeGeocoding", () => {
  it("normalizes Geocoding data correctly", () => {
    const geocodingData: Geocoding = {
      name: "City Name",
      local_names: {
        es: "City Name",
      },
      lat: 0,
      lon: 0,
      country: "Country",
      state: "State",
    };

    const expectedNormalizedData: NormalizedGeocodingMap = {
      "City NameCountry": {
        city: "City Name",
        lat: 0,
        lon: 0,
        country: "Country",
        state: "State",
      },
    };

    const normalizedData = normalizeGeocodingData([geocodingData]);

    expect(normalizedData).toEqual(expectedNormalizedData);
  });
});

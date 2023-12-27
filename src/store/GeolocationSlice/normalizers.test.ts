import { normalizeGeolocationData } from "./normalizers";
import { normalizeGeolocationDataFromIpaApi } from "./normalizers";

describe("normalizeGeolocationData", () => {
  it("should normalize geolocation data correctly", () => {
    const ipApiData = {
      query: "8.8.8.8",
      status: "success",
      country: "United States",
      countryCode: "US",
      region: "CA",
      regionName: "California",
      city: "San Francisco",
      zip: "94103",
      lat: 37.7749,
      lon: -122.4194,
      timezone: "America/Los_Angeles",
      isp: "ISP name",
      org: "Organization name",
      as: "AS name",
    };

    const geoFromNavigator = {
      lat: 37.77499999, // más preciso, queremos matchear con este numero
      lon: -122.4194,
    };

    const reverseGeocodingData = [
      {
        lat: 37.7749,
        lon: -122.4194,
        name: "San Francisco", // queremos matchear con este nombre
        state: "California",
        country: "United States",
        local_names: {
          es: "San Francisco ES",
        },
      },
    ];

    const expectedNormalizedGeolocation = {
      city: "San Francisco ES",
      state: "California",
      timezone: "America/Los_Angeles",
      country: "United States",
      countryCode: "US",
      lat: 37.77499999,
      lon: -122.4194,
    };

    const normalizedGeolocation = normalizeGeolocationData(
      ipApiData,
      geoFromNavigator,
      reverseGeocodingData
    );

    expect(normalizedGeolocation).toEqual(expectedNormalizedGeolocation);
  });
});

describe("normalizeGeolocationDataFromIpaApi", () => {
  it("normalizes geolocation data correctly", () => {
    const testData = {
      status: "success",
      country: "United States",
      countryCode: "US",
      region: "CA",
      regionName: "California",
      city: "San Francisco",
      zip: "94103",
      lat: 37.7749,
      lon: -122.4194,
      timezone: "America/Los_Angeles",
      isp: "ISP name",
      org: "Organization name",
      as: "AS name",
      query: "8.8.8.8",
    };

    const result = normalizeGeolocationDataFromIpaApi(testData);

    expect(result).toEqual({
      status: "success",
      country: "United States",
      countryCode: "US",
      region: "CA",
      state: "California",
      city: "San Francisco",
      zip: "94103",
      lat: 37.7749,
      lon: -122.4194,
      timezone: "America/Los_Angeles",
      isp: "ISP name",
      org: "Organization name",
      as: "AS name",
      query: "8.8.8.8",
    });
  });
});

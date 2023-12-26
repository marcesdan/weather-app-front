import getGeolocation from "./index";

describe("getGeolocation", () => {
  it("should return a geolocation object", async () => {
    // Mock the Geolocation API
    const getCurrentPositionMock = (success: any) =>
      Promise.resolve(
        success({
          coords: {
            latitude: 51.1,
            longitude: 45.3,
          },
        })
      );

    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
    });

    const geolocation = await getGeolocation();
    expect(geolocation).toHaveProperty("lat", 51.1);
    expect(geolocation).toHaveProperty("lon", 45.3);
  });
});

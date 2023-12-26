import { configureStore } from "@reduxjs/toolkit";
import geolocationReducer, { setGeolocation } from "./reducers";
import { NormalizedGeolocation } from ".";

describe("geolocation reducer", () => {
  const newGeolocation: NormalizedGeolocation = {
    country: "United States",
    countryCode: "US",
    state: "California",
    city: "San Francisco",
    lat: 37.7749,
    lon: -122.4194,
    timezone: "America/Los_Angeles",
  };
  it("handles setGeolocation action", () => {
    const store = configureStore({
      reducer: { geolocation: geolocationReducer },
    });
    store.dispatch(setGeolocation(newGeolocation));
    expect(store.getState().geolocation.geolocation).toEqual(newGeolocation);
  });
});

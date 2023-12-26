import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  prefetchCityRequest,
  prefetchCitySuccess,
  prefetchCityNotFound,
  prefetchCityFailed,
} from "./reducers";
import { NormalizedGeocodingMap } from "./normalizers";
import { FetchErrorResponse } from "@/utils";

describe("prefetch city reducer", () => {
  const newCity = "New City";
  const geocodingMap: NormalizedGeocodingMap = {
    // ... your geocoding map data ...
  };
  const errorResponse: FetchErrorResponse = {
    status: 500,
    problem: "error",
    errorData: { message: "error" },
  };

  it("handles prefetchCityRequest action", () => {
    const store = configureStore({ reducer: { city: reducer } });

    store.dispatch(prefetchCityRequest(newCity));

    expect(store.getState().city.status).toBe("loading");
  });

  it("handles prefetchCitySuccess action", () => {
    const store = configureStore({ reducer: { city: reducer } });

    store.dispatch(prefetchCitySuccess(geocodingMap));

    expect(store.getState().city.status).toBe("success");
    expect(store.getState().city.prefetched).toEqual(geocodingMap);
  });

  it("handles prefetchCityNotFound action", () => {
    const store = configureStore({ reducer: { city: reducer } });

    store.dispatch(prefetchCityNotFound());

    expect(store.getState().city.status).toBe("not found");
    expect(store.getState().city.prefetched).toEqual({});
  });

  it("handles prefetchCityFailed action", () => {
    const store = configureStore({ reducer: { city: reducer } });

    store.dispatch(prefetchCityFailed(errorResponse));

    expect(store.getState().city.status).toBe("failed");
    expect(store.getState().city.error).toEqual(errorResponse);
  });
});

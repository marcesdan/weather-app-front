import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  addCity,
  weatherRequest,
  weatherSuccess,
  setCurrentCity,
  removeCity,
  weatherUpdate,
  weatherFailed,
} from "./reducer";
import { Weather } from ".";
import { FetchErrorResponse } from "@/utils/safeFetch";

describe("weather reducer", () => {
  const newCity = { city: "New City", lat: 0, lon: 0 };
  it("handles addCity action", () => {
    const store = configureStore({ reducer: { weather: reducer } });

    store.dispatch(addCity(newCity));

    expect(store.getState().weather.weather["New City"].city).toContain(
      "New City"
    );
  });

  it("handles weatherRequest action", () => {
    const store = configureStore({ reducer: { weather: reducer } });

    store.dispatch(weatherRequest(newCity));

    expect(store.getState().weather.status).toBe("loading");
    expect(store.getState().weather.weather["New City"].city).toContain(
      "New City"
    );
  });

  it("handles weatherSuccess action", () => {
    const store = configureStore({ reducer: { weather: reducer } });
    store.dispatch(
      weatherRequest({ city: "New City", lat: 0, lon: 0 } as Weather)
    );
    store.dispatch(
      weatherSuccess({ city: "New City", lat: 0, lon: 0 } as Weather)
    );
    expect(store.getState().weather.status).toBe("success");
    expect(store.getState().weather.weather["New City"]).toBeDefined();
  });

  it("handles weatherFailure action", () => {
    const store = configureStore({ reducer: { weather: reducer } });

    store.dispatch(weatherFailed({ status: 500 } as FetchErrorResponse));

    expect(store.getState().weather.status).toBe("failed");
    expect(store.getState().weather.errorData?.status).toBe(500);
  });

  it("handles setCurrentCity action", () => {
    const store = configureStore({ reducer: { weather: reducer } });

    store.dispatch(setCurrentCity("New City"));

    expect(store.getState().weather.currentCity).toBe("New City");
  });

  it("handles removeCity action", () => {
    const store = configureStore({ reducer: { weather: reducer } });
    store.dispatch(weatherSuccess({ city: "Old City" } as Weather));

    store.dispatch(removeCity("Old City"));

    expect(store.getState().weather.weather["Old City"]).toBeUndefined();
  });

  it("handles weatherUpdate action", () => {
    const store = configureStore({ reducer: { weather: reducer } });

    store.dispatch(weatherUpdate({ lat: 10, lon: 20, city: "New City" }));

    expect(store.getState().weather.status).toBe("loading");
  });
});

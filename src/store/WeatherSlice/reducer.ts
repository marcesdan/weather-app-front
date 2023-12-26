import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Weather } from "./types";
import { FetchErrorResponse } from "@/utils";
import { AddCityPayload } from "@/components/organisms/AddCities";

type WeatherState = {
  currentCity: string;
  weather: Record<string, Weather>;
  status: "idle" | "loading" | "failed" | "success";
  errorData: FetchErrorResponse | null;
};

const initialState: WeatherState = {
  currentCity: "",
  weather: {},
  status: "idle",
  errorData: null,
};

export const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    addCity: (
      state,
      { payload: { lat, lon, city } }: PayloadAction<AddCityPayload>
    ) => {
      state.weather[city] = { city, lat, lon } as Weather;
    },
    weatherRequest: (
      state,
      { payload: { lat, lon, city } }: PayloadAction<AddCityPayload>
    ) => {
      state.status = "loading";
      // #1. para una UI optimista, se muestra la ciudad agregada aunque esté cargando
      if (!state.weather[city])
        state.weather[city] = { city, lat, lon } as Weather;
    },
    weatherSuccess: (state, { payload }: PayloadAction<Weather>) => {
      state.status = "success";
      // por si el usuario eliminó la ciudad antes de que llege el success (consecuencia de #1)
      if (!!state.weather[payload.city]) {
        state.weather[payload.city] = payload;
      }
    },
    weatherFailed: (state, { payload }: PayloadAction<FetchErrorResponse>) => {
      state.errorData = payload;
      state.status = "failed";
    },
    setCurrentCity: (state, { payload }: PayloadAction<string>) => {
      state.currentCity = payload;
    },
    removeCity: (state, { payload: city }: PayloadAction<string>) => {
      delete state.weather[city];
    },
    weatherUpdate: (
      state,
      { payload: { lat, lon, city } }: PayloadAction<AddCityPayload>
    ) => {
      state.status = "loading";
    },
  },
});

export const {
  addCity,
  weatherRequest,
  weatherSuccess,
  weatherFailed,
  setCurrentCity,
  removeCity,
  weatherUpdate,
} = weatherSlice.actions;

export default weatherSlice.reducer;

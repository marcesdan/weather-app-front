import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WeatherData } from "./types";
import { NormalizedGeolocation } from "@/store/GeolocationSlice";
import { FetchErrorResponse } from "@/utils";

type WeatherState = {
  currentCity: string;
  weather: Record<string, WeatherData | {}>;
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
    weatherRequest: (state, action: PayloadAction<NormalizedGeolocation>) => {
      state.status = "loading";
    },
    weatherSuccess: (state, { payload }: PayloadAction<WeatherData>) => {
      state.status = "success";
      state.weather[payload.city] = payload;
    },
    weatherFailed: (state, { payload }: PayloadAction<FetchErrorResponse>) => {
      state.errorData = payload;
      state.status = "failed";
    },
    setCurrentCity: (state, { payload }: PayloadAction<string>) => {
      state.currentCity = payload;
    },
  },
});

export const { weatherRequest, weatherSuccess, weatherFailed } =
  weatherSlice.actions;

export default weatherSlice.reducer;

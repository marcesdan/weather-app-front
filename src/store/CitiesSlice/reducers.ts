import { FetchErrorResponse } from "@/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NormalizedGeocodingMap } from "./normalizers";

export type CitiesState = {
  prefetched: NormalizedGeocodingMap;
  status: "idle" | "loading" | "failed" | "success" | "not found";
  error: FetchErrorResponse | null;
};

const initialState: CitiesState = {
  prefetched: {},
  error: null,
  status: "idle",
};

export const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    prefetchCityRequest: (state, { payload }: PayloadAction<string>) => {
      state.status = "loading";
    },
    prefetchCitySuccess: (
      state,
      { payload }: PayloadAction<NormalizedGeocodingMap>
    ) => {
      state.status = "success";
      state.prefetched = payload;
    },
    prefetchCityNotFound: (state) => {
      state.status = "not found";
      state.prefetched = {};
    },
    prefetchCityFailed: (
      state,
      { payload }: PayloadAction<FetchErrorResponse>
    ) => {
      state.status = "failed";
      state.error = payload;
    },
  },
});

export const {
  prefetchCityRequest,
  prefetchCitySuccess,
  prefetchCityNotFound,
  prefetchCityFailed,
} = citiesSlice.actions;

export default citiesSlice.reducer;

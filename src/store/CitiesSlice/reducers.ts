import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CitiesState = {
  prefetched?: Geocoding[];
  status: "idle" | "loading" | "failed" | "success";
};

const initialState: CitiesState = {
  prefetched: [],
  status: "idle",
};

export type Geocoding = {
  name: string;
  local_names: {
    [key: string]: string; // Key is the language code, value is the name in that language
  };
  lat: number;
  lon: number;
  country: string;
  state?: string; // Optional, as not all responses might have it
};

export const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    prefetchCityRequest: (state) => {
      state.status = "loading";
    },
    prefetchCitySuccess: (state, { payload }: PayloadAction<Geocoding[]>) => {
      state.status = "success";
      state.prefetched = payload;
    },
    prefetchCityNotFound: (state) => {
      state.status = "success";
      state.prefetched = [];
    },
  },
});

export const {
  prefetchCityRequest,
  prefetchCitySuccess,
  prefetchCityNotFound,
} = citiesSlice.actions;

export default citiesSlice.reducer;

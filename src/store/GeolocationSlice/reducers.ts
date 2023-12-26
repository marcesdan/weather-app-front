import { NormalizedGeolocation } from "./normalizers";
import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";

type GeolocationState = {
  geolocation: NormalizedGeolocation | null;
  status: "idle" | "loading" | "failed" | "success";
};

const initialState: GeolocationState = {
  geolocation: null,
  status: "idle",
};

export const GeolocationSlice = createSlice({
  name: "geolocation",
  initialState,
  reducers: {
    setGeolocation: (state, action: PayloadAction<NormalizedGeolocation>) => {
      state.status = "success";
      state.geolocation = action.payload;
    },
  },
});

export const { setGeolocation } = GeolocationSlice.actions;

export const geolocationRequest = createAction("geolocation/request");

export default GeolocationSlice.reducer;

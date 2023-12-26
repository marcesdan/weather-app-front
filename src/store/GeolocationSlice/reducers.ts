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

export const geolocationSlice = createSlice({
  name: "geolocation",
  initialState,
  reducers: {
    setGeolocation: (state, action: PayloadAction<NormalizedGeolocation>) => {
      state.status = "success";
      state.geolocation = action.payload;
    },
  },
});

export const { setGeolocation } = geolocationSlice.actions;

export const geolocationRequest = createAction("geolocation/request");

export default geolocationSlice.reducer;

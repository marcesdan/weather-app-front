import { RootState } from "@/store";

export const selectGeolocation = (state: RootState) =>
  state.geolocation.geolocation;
export const selectGeolocationStatus = (state: RootState) =>
  state.geolocation.status;

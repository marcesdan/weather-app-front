import { RootState } from "@/store";

export const selectPrefetchedCities = (state: RootState) =>
  state.cities.prefetched;
export const selectCitiesStatus = (state: RootState) => state.cities.status;

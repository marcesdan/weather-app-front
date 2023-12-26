import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";
import { CitiesState } from "./reducers";

const selectState = createSelector(
  (state: RootState) => state,
  ({ cities }) => cities
);

export const selectPrefetchedCities = createSelector(
  [selectState],
  ({ prefetched }: CitiesState) => prefetched
);

export const selectPrefetchedStatus = createSelector(
  [selectState],
  ({ status }) => status
);

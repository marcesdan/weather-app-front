import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";

export const selectSlice = createSelector(
  (state: RootState) => state,
  ({ weather }) => weather
);

export const selectWeather = createSelector(
  [selectSlice],
  ({ weather }) => weather
);

export const selectIsLoading = createSelector(
  [selectSlice],
  ({ weather }) => weather.current
);

export const selectCurrentCity = createSelector(
  [selectSlice],
  ({ currentCity }) => currentCity
);

export const selectCurrentWeather = createSelector(
  [selectSlice],
  ({ weather, currentCity }) => weather[currentCity] ?? {}
);

export const selectCurrentHourlyWeather = createSelector(
  [selectCurrentWeather],
  (currentWeather) => currentWeather?.hourly?.slice(1) // no interesa la hora actual
);

export const selectOtherCitiesWeather = createSelector(
  [selectCurrentCity, selectSlice],
  (currentCity, { weather: { [currentCity]: _, ...restWithoutCurrentCity } }) =>
    Object.values(restWithoutCurrentCity)
);

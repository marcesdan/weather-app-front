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

export const selectCurrentCity = createSelector(
  [selectSlice],
  ({ currentCity }) => currentCity
);

export const selectCurrentWeather = createSelector(
  [selectSlice],
  ({ weather, currentCity }) => weather[currentCity] ?? {}
);

// El clima en la ciudad actual, por hora
export const selectCurrentHourlyWeather = createSelector(
  [selectCurrentWeather],
  (currentWeather) => currentWeather?.hourly?.slice(1) // no interesa la hora actual
);

// El resto de las ciudades sin la ciudad actual
export const selectOtherCitiesWeather = createSelector(
  [selectCurrentCity, selectSlice],
  (
    currentCity,
    { weather: { [currentCity]: _, ...restWithoutCurrentCity } }
  ) => {
    return Object.values(restWithoutCurrentCity);
  }
);

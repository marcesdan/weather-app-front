import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchWeatherInOneCall } from "@/services/weatherService";
import { WeatherData } from "./types";
import { weatherFailed, weatherRequest, weatherSuccess } from "./reducer";
import { FetchResult } from "../../utils/safeFetch/index";

export type AddCityPayload = {
  lat: number;
  lon: number;
  city: string;
};

export function* fetchWeather(
  action: PayloadAction<AddCityPayload>
): Generator {
  const { lat, lon, city } = action.payload;
  const {
    data: weather,
    ok,
    status,
    problem,
    errorData,
  } = (yield call(fetchWeatherInOneCall, lat, lon)) as FetchResult<WeatherData>;
  yield put(
    ok
      ? weatherSuccess({ ...weather, city })
      : weatherFailed({ status, problem, errorData })
  );
}

const sagas = [takeLatest(weatherRequest.type, fetchWeather)];

export default sagas;

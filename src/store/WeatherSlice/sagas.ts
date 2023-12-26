import { PayloadAction } from "@reduxjs/toolkit";
import { all, call, delay, put, select, takeLatest } from "redux-saga/effects";
import { fetchWeatherInOneCall } from "@/services/weatherService";
import { Weather } from "./types";
import {
  weatherFailed,
  weatherRequest,
  weatherSuccess,
  weatherUpdate,
} from "./reducer";
import { FetchResult } from "@/utils/safeFetch";
import { AddCityPayload } from "@/components/molecules/PrefetchedCitiesList";
import { selectWeather } from "./selectors";

export function* fetchWeather({
  payload: { lat, lon, city },
}: PayloadAction<AddCityPayload>): Generator {
  const {
    data: weather,
    ok,
    status,
    problem,
    errorData,
  } = (yield call(fetchWeatherInOneCall, lat, lon)) as FetchResult<Weather>;
  yield put(
    ok
      ? weatherSuccess({ ...weather, city })
      : weatherFailed({ status, problem, errorData })
  );
}

export function* updateWeatherDeamon() {
  while (true) {
    const weather: Record<string, Weather> = yield select(selectWeather);
    yield all(
      Object.values(weather).map(({ lat, lon, city }) =>
        put(weatherUpdate({ lat, lon, city }))
      )
    );
    yield delay(600000); // 10 minutes
  }
}

const sagas = [
  takeLatest(weatherRequest.type, fetchWeather),
  takeLatest(weatherUpdate.type, fetchWeather),
];

export default sagas;

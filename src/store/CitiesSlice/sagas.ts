import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  prefetchCityRequest,
  prefetchCitySuccess,
  prefetchCityNotFound,
  Geocoding,
} from "./reducers";
import { fetchDirectGeocoding } from "@/services/weatherService";

function* prefetchCity(action: PayloadAction<string>): Generator {
  const cityInfo = (yield call(
    fetchDirectGeocoding,
    action.payload
  )) as Geocoding[];
  yield put(
    cityInfo?.length ? prefetchCitySuccess(cityInfo) : prefetchCityNotFound()
  );
}

const sagas = [takeLatest(prefetchCityRequest.type, prefetchCity)];

export default sagas;

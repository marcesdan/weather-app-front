import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  prefetchCityRequest,
  prefetchCitySuccess,
  prefetchCityNotFound,
  prefetchCityFailed,
} from "./reducers";
import { Geocoding, fetchDirectGeocoding } from "@/services/weatherService";
import { FetchResult } from "../../utils/safeFetch/index";
import { normalizeGeocodingData } from "./normalizers";

function* prefetchCity(action: PayloadAction<string>): Generator {
  const {
    data: geoCodingData,
    ok,
    status,
    problem,
    errorData,
  } = (yield call(fetchDirectGeocoding, action.payload)) as FetchResult<
    Geocoding[]
  >;
  const getActionToDispatch = () => {
    if (!ok) return prefetchCityFailed({ status, problem, errorData });
    if (!geoCodingData?.length) return prefetchCityNotFound();
    return prefetchCitySuccess(normalizeGeocodingData(geoCodingData));
  };
  yield put(getActionToDispatch());
}

const sagas = [takeLatest(prefetchCityRequest.type, prefetchCity)];

export default sagas;

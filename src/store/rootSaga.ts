import { all, spawn } from "redux-saga/effects";
import geolocationSagas, { fetchGeolocation } from "./GeolocationSlice/sagas";

import citiesSagas from "./CitiesSlice/sagas";
import weatherSagas from "./WeatherSlice/sagas";

export default function* rootSaga() {
  yield all([
    // al incio
    spawn(fetchGeolocation),
    // con interaccion del usuario (actions)
    ...geolocationSagas,
    ...citiesSagas,
    ...weatherSagas,
  ]);
}

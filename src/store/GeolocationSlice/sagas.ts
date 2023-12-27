import { all, call, put, select, take, takeLatest } from "redux-saga/effects";
import { geolocationRequest, setGeolocation } from "./reducers";
import { Weather } from "@/store/WeatherSlice";
import { Geocoding, fetchReverseGeocoding } from "@/services/weatherService";
import {
  fetchGeolocationFromIpApi,
  GeolocationFromIpApi,
} from "@/services/ipApiService";
import {
  getGeolocation,
  GeolocationFromNavigator,
  navigationService,
  FetchResult,
} from "@/utils";
import {
  NormalizedGeolocation,
  normalizeGeolocationData,
  normalizeGeolocationDataFromIpaApi,
} from "./normalizers";
import { addCity, setCurrentCity } from "../WeatherSlice/reducer";
import { updateWeatherDeamon } from "../WeatherSlice/sagas";
import { selectGeolocation } from ".";
import { selectWeather } from "../WeatherSlice/selectors";

export function* fetchGeolocation(): Generator {
  yield take("persist/REHYDRATE");
  // Se necesitan ambos llamados, también ip-api para conocer la ciudad actual
  // en paralelo también se se selecciona la geo desde el store
  const geolocationSources = (yield all([
    call(getGeolocation),
    call(fetchGeolocationFromIpApiGenerator),
    select(selectGeolocation),
  ])) as [GeolocationFromNavigator, GeolocationFromIpApi, Geolocation];

  if (!geolocationSources.some(Boolean)) {
    // Primer ingreso y sin conexión
    navigationService.navigateTo("/error");
    return;
  }
  const [geoFromNavigator, geoFromIpApi] = geolocationSources;
  const geolocation = (yield call(
    fetchGeolocationFromReverseGeocodingOrIpApi,
    geoFromNavigator,
    geoFromIpApi
  )) as NormalizedGeolocation;

  yield all([
    // Se guarda la geolocalización en el store
    put(setGeolocation(geolocation)),
    put(setCurrentCity(geolocation.city)),
  ]);

  const weather = (yield select(selectWeather)) as Record<string, Weather>;
  if (!weather[geolocation.city]?.current) {
    // Si la ciudad que viene de la geo no aún está cargada, hay que agregarla mediante reducer.
    // Pero sín la petición a la api, dado que de eso se encarga el demonio updater
    yield put(
      addCity({
        city: geolocation.city,
        lat: geolocation.lat,
        lon: geolocation.lon,
      })
    );
  }
  // Exista o no en el store la ciudad que viene de la geo, se invoca al demonio updated
  yield call(updateWeatherDeamon);
}

function* fetchGeolocationFromIpApiGenerator() {
  const { data, ok }: FetchResult<GeolocationFromIpApi> = yield call(
    fetchGeolocationFromIpApi
  );
  if (ok) return data;
  navigationService.navigateTo("/error");
}

function* fetchGeolocationFromReverseGeocodingOrIpApi(
  geoFromNavigator: GeolocationFromNavigator,
  geoFromIpApi: GeolocationFromIpApi
): Generator<any, NormalizedGeolocation, any> {
  // si no se puede obtener desde el gps nos quedamos con lo que viene de ip-api
  if (!geoFromNavigator)
    return normalizeGeolocationDataFromIpaApi(geoFromIpApi);
  // si se obtiene la ubicación, nos quedamos con la ciudad haciendo geocoding inverso
  // dado que ip-api puede no ser preciso
  const { data: reverseGeocodingResullt, ok }: FetchResult<Geocoding[]> =
    yield call(
      fetchReverseGeocoding,
      geoFromNavigator.lat,
      geoFromNavigator.lon
    );
  // si se puede obtener la geo reversa la usamos, sino nos quedamos con ip-api
  return ok
    ? normalizeGeolocationData(
        geoFromIpApi,
        geoFromNavigator,
        reverseGeocodingResullt
      )
    : normalizeGeolocationDataFromIpaApi(geoFromIpApi);
}

const sagas = [takeLatest(geolocationRequest.type, fetchGeolocation)];

export default sagas;

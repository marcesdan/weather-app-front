import { all, call, put, takeLatest } from "redux-saga/effects";
import { geolocationRequest, setGeolocation } from "./reducers";
import { weatherRequest } from "@/store/WeatherSlice";
import {
  fetchReverseGeocoding,
  ReverseGeocoding,
} from "@/services/weatherService";
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
import { setCurrentCity } from "../WeatherSlice/reducer";
import { updateWeatherDeamon } from "../WeatherSlice/sagas";

export function* fetchGeolocation(): Generator {
  // se necesitan ambos llamados, también ip-api para conocer la ciudad actual
  const [geoFromNavigator, geoFromIpApi]: any = yield all([
    call(getGeolocation),
    call(fetchGeolocationFromIpApiGenerator),
  ]);

  if (!geoFromIpApi) {
    navigationService.navigateTo("/error");
    return;
  }

  const geolocation = (yield call(
    fetchGeolocationWithReverseGeocoding,
    geoFromNavigator,
    geoFromIpApi
  )) as NormalizedGeolocation;

  if (!geolocation) {
    navigationService.navigateTo("/error");
    return;
  }

  yield all([
    // se guarda la geolocalización en el store
    put(setGeolocation(geolocation)),
    // se busca el clima de la ciudad actual al cargar la app
    put(setCurrentCity(geolocation.city)),
    put(
      weatherRequest({
        city: geolocation.city,
        lat: geolocation.lat,
        lon: geolocation.lon,
      })
    ),
  ]);
  yield call(updateWeatherDeamon);
}

function* fetchGeolocationFromIpApiGenerator() {
  const { data, ok }: FetchResult<GeolocationFromIpApi> = yield call(
    fetchGeolocationFromIpApi
  );
  if (ok) return data;
  navigationService.navigateTo("/error");
}

function* fetchGeolocationWithReverseGeocoding(
  geoFromNavigator: GeolocationFromNavigator,
  geoFromIpApi: GeolocationFromIpApi
): Generator<any, NormalizedGeolocation | undefined, any> {
  // si no se puede obtener desde el gps nos quedamos con lo que viene de ip-api
  if (!geoFromNavigator)
    return normalizeGeolocationDataFromIpaApi(geoFromIpApi);
  // si se obtiene la ubicación, nos quedamos con la ciudad haciendo geocoding inverso
  // dado que ip-api puede no ser preciso
  const { data: reverseGeocodingResullt, ok }: FetchResult<ReverseGeocoding[]> =
    yield call(
      fetchReverseGeocoding,
      geoFromNavigator.lat,
      geoFromNavigator.lon
    );
  if (ok)
    return normalizeGeolocationData(
      geoFromIpApi,
      geoFromNavigator,
      reverseGeocodingResullt
    );
}

const sagas = [takeLatest(geolocationRequest.type, fetchGeolocation)];

export default sagas;

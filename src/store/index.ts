import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { geolocation } from "./GeolocationSlice";
import { cities } from "./CitiesSlice";
import { weather } from "./WeatherSlice";

import rootSaga from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
  reducer: {
    geolocation,
    cities,
    weather,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

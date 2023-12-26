import { combineReducers, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { geolocation } from "./GeolocationSlice";
import { cities } from "./CitiesSlice";
import { weather } from "./WeatherSlice";
import rootSaga from "./rootSaga";

const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    blacklist: ["cities"],
  },
  combineReducers({
    geolocation,
    cities,
    weather,
  })
);
const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);
export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

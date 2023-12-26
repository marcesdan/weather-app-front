# Weather App

App full client-side que permita visualizar el pronóstico climático. Los datos son consumidos por una API desarrollada en Node / Express.

- [**Demo de la App**](https://weather-app-front-indol.vercel.app) |
  [**Repo de la App**](https://github.com/marcesdan/weather-app-front)

- [**Demo de la API**](https://weather-app-api-pzz2.onrender.com) |
  [**Repo de la API**](https://github.com/marcesdan/weather-app-api)

## Funcionalidades

- Clima actual en la ubicación actual.
- Pronóstico de la ubicación actual, en las próximas horas.
- Pronóstico de la ubicación actual, en los próximos días.
- Clima actual de otras 5 ciudades seleccionables.
- Actualización cada 10 minutos, cómo recomienda Open Weather Map

## Se usaron las tecnologías

- Vite / Vitest
- Typescript, con uso de path aliases (@/components, @/store, etc)
- Redux, con @redux/toolkit y soporte de tipos
- Redux-Saga, con soporte de tipos
- Redux-Persist (localStorage)
- React-Router v6
- Styled-Components 💅
- Husky (precommit) + lint-staged + eslint + prettier

## Se usa una estructura clásica de carpetas

- 📂 src
- ┣ 📂 components
- ┃ ┣ 📂 atoms (presentacional)
- ┃ ┣ 📂 molecules (presentacional)
- ┃ ┣ 📂 organisms (seleccionan estado del store de redux)
- ┃ ┣ 📂 layouts (estructura)
- ┃ ┗ 📂 styles (styled-components 💅)
- ┣ 📂 hooks
- ┣ 📂 pages
- ┣ 📂 services (para peticiones a APIs)
- ┣ 📂 store
- ┃ ┣ 📂 DucksSlice
- ┃ ┃ ┣ 📜 reducers
- ┃ ┃ ┣ 📜 sagas
- ┃ ┃ ┣ 📜 selector
- ┃ ┃ ┗ 📜 normalizers
- ┗ 📂utils

En donde se hace uso de módulos exportadores, conocidos como "Barrels". Es decir, archivos `index` que se utilizan únicamente para exportar módulos y tipos desde su subcarpeta.

Por ejemplo, en lugar de tener importaciones como estas:

```typescript
import { ComponentA } from "./components/ComponentA";
import { ComponentB } from "./components/ComponentB";
```

Se tendría en cambio:

```typescript
import { ComponentA, ComponentB } from "@/components";
```

Sumado a los path aliases **@/\***, esto provee una mejora en la experiencia de desarrollo y en la mantenibilidad de proyectos extensos.

Pueden verse estos módulos Barrels, por ejemplo en

- [atoms](./src/components/atoms/index.ts)
- [molecules](./src/components/molecules/index.ts)
- [organisms](./src/components/organisms/index.ts)
- [styles](./src/components/styles/index.ts)
- [utils](./src/utils/index.ts)
- [pages](./src/pages/index.ts)

## Estilo

Dada la naturaleza de las soluciones que proponen react, redux y redux-saga (hooks, reducers, efectos secundarios, memorización, normalización, etc), hay una inclinación a la programación declarativa y funcional a lo largo de todo el proyecto.

### Esto puede verse por ejemplo en

#### Normalizadores, p. ej. en [normalizeGeocodingData](./src/store/CitiesSlice/normalizers.ts)

Donde se normaliza un array de objetos a un objeto con clave única.

```typescript
export const normalizeGeocodingData = (
  geocodingData: Geocoding[]
): NormalizedGeocodingMap =>
  geocodingData.reduce(
    (acc, { name, country, local_names, ...rest }) => {
      const city = local_names?.es ?? name;
      acc[city + country] = { city, country, ...rest };
      return acc;
    },
    {} as { [key: string]: NormalizedGeocoding }
  );
```

#### Sagas, p. ej. en [updateWeatherDeamon](./src/store/WeatherSlice/sagas.ts)

Donde se expresan los efectos secundarios de forma declarativa. Mapeando del estado normalizado a un array de efectos secundarios, ejecutándolos todos a la vez - ad eternum

```typescript
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
```

#### Selectores, p. ej. [selectOtherCitiesWeather](./src/store/WeatherSlice/selectors.ts)

Donde se usa la memorización de funciones para evitar cálculos innecesarios. Y se quita la ciudad actual del estado del store declarativamente.

```typescript
// El resto de las ciudades sin la ciudad actual
export const selectOtherCitiesWeather = createSelector(
  [selectCurrentCity, selectSlice],
  (currentCity, { weather: { [currentCity]: _, ...restWithoutCurrentCity } }) =>
    Object.values(restWithoutCurrentCity)
);
```

## Gimnasia de tipos

Dada la gran cantidad de registros provenientes de la api de Open Weather Map, ip-api y geocoding; se puso esfuerzo en la declaración de tipos.

Por ejemplo en:

- [Weather](./src/store/WeatherSlice/types.ts)
- [Geocoding](./src/services/weatherService/index.ts)
- [GeolocationFromIpApi](./src/services/ipApiService/index.ts)
- [FetchResult](./src/utils/safeFetch/index.ts)

Para así tener asistencia en editores de código / IDEs, a lo largo de toda la aplicación (incluso en store y sagas), mejorando la experiencia de desarrollo. Cómo así también para evitar errores.

Si bien fue costoso al comienzo, creo que fue de gran ayuda en el último tramo. Creo que sería muy dificil mantener un proyecto así, sin asistencia de tipos (ya sea con typescript, JSDoc, etc)

## Scripts

- `dev`/`start` - start dev server and open browser
- `build` - build for production
- `preview` - locally preview production build
- `test` - launch test runner

## Como correr la app en local

Para correr en local, se debe tener ejecutada tambien la API en local, siguiendo los pasos del [**Readme**](https://github.com/marcesdan/weather-app-api/blob/master/README.md). Y luego, recién:

1. Copia el `.env.example` con las variables de entorno a un nuevo archivo `.env`:

```bash
  cp .env.example .env
```

2. Instala las dependencias del proyecto:

```bash
  npm i
```

3. Inicia el servidor de desarrollo:

```bash
  npm run dev
```

4. Abre [http://localhost:4000](http://localhost:4000) en tu navegador.

<br/>

> Otra forma de ejecutar la app pero sin levantar la API también en local, puede ser editando en el .env la variable de entorno `VITE_WEATHER_API_URL` y apuntando a la API en producción:

```bash
VITE_WEATHER_API_URL=https://weather-app-api-pzz2.onrender.com/api/v1
```

<br/>

### Uses [Vite](https://vitejs.dev/), [Vitest](https://vitest.dev/), and [React Testing Library](https://github.com/testing-library/react-testing-library) to create a modern [React](https://react.dev/) app compatible with [Create React App](https://create-react-app.dev/)

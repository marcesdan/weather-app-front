# Weather App v2

Clima actual, próximas horas y 7 días para tu ubicación y tus lugares guardados (ciudades o zonas del mapa con nombre propio), un **observatorio** de viento, olas, tormenta y lluvia para navegar o surfear, y **avisos** de alertas en tus lugares.

- [Demo](https://weather-app-front-indol.vercel.app) · [API](https://github.com/marcesdan/weather-app-api)

## Stack

Vite · React 19 · TypeScript · Tailwind 4 · shadcn/ui (Radix, tokens `marces-theme` compartidos con Astropia y Marcesia) · TanStack Query · Leaflet · Capacitor (listo para app nativa).

## Datos

| Qué | De dónde | Key |
|---|---|---|
| Clima, pronóstico, geocoding, ubicación por IP | API propia (v1) → OpenWeatherMap One Call 3.0 / ip-api | En el backend |
| Viento, olas, swell, marea, CAPE, lluvia por hora (observatorio y avisos) | Open-Meteo (forecast + marine) | No (uso no comercial) |
| Ciudades cercanas | OpenStreetMap / Overpass | No |
| Mapa | Tiles de OpenStreetMap | No (uso liviano) |

## Avisos

Se revisan tus lugares guardados (próximas 24 h): ráfagas ≥ 34 kn, olas ≥ 2.5 m, CAPE ≥ 1500 J/kg, lluvia ≥ 10 mm/h. Sin servidor: la app revisa al abrirse y cada 30 min; con la app cerrada, Chrome/Edge con la app instalada usan Periodic Background Sync (el navegador decide la frecuencia). La imagen de la notificación se ve en Chrome y Android; Firefox y Safari la ignoran. Para la app nativa: `@capacitor/background-runner` + `@capacitor/local-notifications`.

## Scripts

```bash
cp .env.example .env
pnpm i
pnpm dev               # http://localhost:4000
pnpm test.unit         # vitest: formato, unidades, alertas
pnpm test.e2e          # playwright chromium + webkit, red 100% mockeada
pnpm test.e2e.smoke    # @smoke en chromium
pnpm ui-review /observatory   # agent-browser: claro/oscuro x 5 anchos en .qa-shots/
pnpm build             # typecheck + dist/ (incluye /sw.js)
```

WebKit en Linux necesita una vez `sudo pnpm exec playwright install-deps`.

## Tema

`src/styles/theme.css` es el ítem `marces-theme` del registry (`marcesia/registry.json`). No se edita por app: cada app pisa los knobs en su `globals.css` (`--font-body`, `--font-heading`, `--font-numeric`, `--radius`). Weather usa Figtree.

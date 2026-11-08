# Weather App v2

Clima actual, próximas 24 h y la semana para tu ubicación y tus lugares guardados (ciudades o zonas del mapa con nombre propio), sobre un **cielo vivo** en WebGL que dibuja el estado real (sol, nubes, lluvia, nieve, tormenta, niebla, viento). Un **observatorio** de viento, olas, tormenta y lluvia para navegar o surfear, y **avisos por lugar**.

- [Demo](https://weather-app-front-indol.vercel.app) · [API](https://github.com/marcesdan/weather-app-api)
- Decisiones: `DESIGN.md` (diseño), `PRODUCT.md` (producto), ADR 0001 en `~/code/docs/adr` (stack compartido con Astropia y Marcesia).

## Stack

Vite 8 · React 19 · TypeScript · Ionic React 9 (shell) · Tailwind 4 · shadcn/ui sobre Base UI (tokens `marces-theme` compartidos con Astropia y Marcesia) · TanStack Query · Leaflet · WebGL propio · Capacitor 8 (app nativa en camino) · Node 26 · pnpm 11.

## Datos

| Qué | De dónde | Key |
|---|---|---|
| Clima, 48 h, 8 días, geocoding, ubicación por IP | API propia v1 → OpenWeatherMap One Call 3.0 / ip-api | En el backend |
| Lluvia minuto a minuto (60 min) | API propia v2 → One Call 4.0 (sin datos en Argentina) | En el backend |
| Lluvia cada 15 min (respaldo), hora a hora de la semana, viento/olas/tormenta del observatorio | Open-Meteo | No (uso no comercial) |
| Radar y nubes en vivo, ciudades cercanas | API propia v2 (Weather Maps de OpenWeatherMap, Overpass) | En el backend |
| Mapa | Tiles de OpenStreetMap | No (uso liviano) |

## Avisos

Cada lugar guardado tiene su campana en Ciudades; se revisan solo esos (próximas 24 h): ráfagas ≥ 34 kn, olas ≥ 2.5 m, CAPE ≥ 1500 J/kg, lluvia ≥ 10 mm/h. Sin servidor: la app revisa al abrirse y cada 30 min; con la app cerrada, Chrome/Edge con la app instalada usan Periodic Background Sync (el navegador decide la frecuencia). La imagen de la notificación se ve en Chrome y Android; Firefox y Safari la ignoran. Para la app nativa: `@capacitor/background-runner` + `@capacitor/local-notifications`.

## Scripts

```bash
cp .env.example .env
pnpm i
pnpm dev               # http://localhost:4000
pnpm test.unit         # vitest: formato, unidades, alertas, cielo, grilla del mapa
pnpm test.e2e          # playwright chromium + webkit, red 100% mockeada
pnpm test.e2e.smoke    # @smoke en chromium
pnpm ui-review /observatory   # agent-browser: claro/oscuro x 5 anchos en .qa-shots/
pnpm build             # typecheck + dist/ (incluye /sw.js)
```

WebKit en Linux necesita una vez `sudo pnpm exec playwright install-deps`.

## Tema

`src/styles/theme.css` es el ítem `marces-theme` del registry (`marcesia/registry.json`). No se edita por app: cada app pisa los knobs en su `globals.css` (`--font-body`, `--font-heading`, `--font-numeric`, `--radius`). Weather usa Figtree.

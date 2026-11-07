# Design: Clima

The sky behind the app is the forecast. Shared tokens come from the `marces-theme` registry (Astropia's amber, ADR 0001); Weather's own world is the live sky and the glass laid over it.

## The sky (`src/components/sky-gl.ts`, `src/lib/sky.ts`)

- One WebGL fragment shader, full screen, behind every page except the observatory. No library.
- Driven only by OpenWeatherMap's typed state (`skyFrom`): sun height from sunrise/sunset with twilight and a golden-hour glow; cloud cover from `clouds`; rain (drizzle 3xx, rain 5xx by intensity), snow 6xx, storm 2xx with lightning lighting the clouds, fog/mist 7xx; clouds, rain angle and snow drift follow the real wind vector.
- Rain is calm and physical: 7 rows per screen, fall speed 0.45 (drizzle) to 1.0 (heavy) screen-heights per second (+0.15 in storms), streaks 2.5–6% of the screen with a bright head and fading tail, 18/26/34 sparse columns, at least one canvas pixel wide, per-streak alpha 0.08–0.24, total mix capped at 0.3, thinned 55% across the hero band. Every term scales with intensity. Never use `smoothstep` with reversed edges in GLSL (undefined); write `1.0 - smoothstep(lo, hi, x)`.
- Picking an hour in the home strip turns the sky into that hour; "Ahora" returns. Changes ease over 1.2 s.
- Sun rises at the sides and passes above the top edge at noon so its glow frames the reading; the moon keeps to the upper right.
- Legibility is part of the sky: day exposure is held at 0.8 and overcast/fog/snow decks are darkened so white small text keeps ≥ 4.5:1 on open sky (measured: overcast 5.5, clear 4.8). Re-measure after any palette change.
- Performance: drawn at 0.6× CSS size, low-power context; the loop stops at 0×0 (Ionic's hidden pages, the observatory), with the tab hidden, and after one frame under reduced motion.
- QA preview (dev only): `/?sky=<owm id>&night=1|dusk=1&clouds=<0-100>&wind=<m/s>`.

## Pages over the sky (`.sky-page`)

- The page redefines tokens (white ink, translucent card/background, white-alpha borders, amber `--primary-ink` for links) so every shadcn component turns to glass without per-component overrides. `ion-content` gets `--color` too, or Ionic paints its own text colour.
- `glass` utility: `--card` fill + 22 px backdrop blur. Used where text must stay legible over moving sky: the facts row, the hours panel, place cards, lists. Not as decoration.
- Text carries a soft shadow on sky pages. Secondary text is white at 92%, never under 12 px. Wind defaults to km/h (everyday users); sailors switch to knots in the observatory and the choice sticks.

## Type

Figtree (registry knob `--font-body`). The current temperature is the display: 6.5 rem, extra-light, -0.04em, tabular. Everything else is the shared scale.

## Icons (`src/components/condition-icon.tsx`)

Authored SVG keyed by OpenWeatherMap icon codes (`01`–`50`, `d`/`n`): amber sun, pale moon, gradient clouds (dark deck for showers and storms), blue drops, white flakes, amber bolt, fog bars. Animated only in the hero (`animated`): slow sun rotation, falling drops/flakes, bolt flicker, fog drift. Strips and cards stay still.

## Motion

One entrance (`.rise`: the reading rises with a blur-in once), the sky's own motion, and hero icon motion. Everything stops under `prefers-reduced-motion`.

## Observatory

Keeps its own opaque surface and map; the sky is hidden there. Data colours never come from the UI theme (amber is for controls and selection): each quantity uses its field's conventional scale, interpolated continuously, defined in `wind-canvas.ts` `LAYERS`:
- Wind (kn, top 45): calm blue → teal → green → yellow → orange → red → magenta (Windy's convention). Legend speaks the chosen unit.
- Waves (m, top 6): deep blue → cyan → teal → yellow → orange → crimson.
- Storm / CAPE (J/kg, top 3000) and rain (mm/h, top 15, radar scale light blue → blue → green → yellow → red): zero is transparent.
- The heat fades out over the last half cell of the forecast grid: no hard rectangles.
- Live OpenWeatherMap layers (radar, clouds) come from the backend tile proxy and say they are live, not tied to the slider.

## Navigation and motion between pages

- Pages are transparent over the shared sky, so page changes are a sequential fade (old out in 110 ms, new in 200 ms after a 110 ms delay), never Ionic's slide, which shows both pages at once.
- Back is `BackLink` (`components/shell.tsx`): it pops Ionic's stack (`goBack`); a plain link to `/` pushes a duplicate page.
- Strips (hours, places) bleed to the screen edge with snap; the cut item at the edge is the swipe affordance.

## Home content

- Facts row: rain chance, humidity, wind (speed, compass under it), sun (sunrise, sunset under it) in the place's time zone. Air quality was tried there and dropped: it read as noise.
- Phone: one column, hours as an edge-to-edge swipe band. From sm the band is a rounded panel; from md the hours are an 8-column grid (no sideways scroll with a mouse). Desktop (lg): two columns, the reading sticky on the left, hours, the 7-day list and other places on the right.
- Próximos días: each day is an accordion row that opens hour by hour in place (Open-Meteo hourly, WMO codes mapped to our icons in `wmo.ts`; One Call only covers 48 h).
- Toggle groups keep a small gap between items (`spacing={0.5}`): spacing 0 is shadcn's segmented style and squares the inner items.
- "Llueve en X min" card only when rain is coming or falling: OpenWeatherMap 1-minute nowcast where it exists, Open-Meteo 15-minute steps elsewhere (Argentina). Rain-radar blue bars.
- Saved places open their own weather at `/lugar/:id` (same layout, sky of that place). Units (°C/°F; km/h, m/s, kn, mph) live in Ajustes. Alerts are per place: the bell in Ciudades.

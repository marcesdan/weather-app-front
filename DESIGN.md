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

Keeps its own opaque surface and map; the sky is hidden there. Heat ramp: the shared amber chart ramp ending in danger red.

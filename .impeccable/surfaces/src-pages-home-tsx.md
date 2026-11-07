---
version: 1
slug: "src-pages-home-tsx"
primary_target: "src/pages/home.tsx"
related_targets: ["src/pages/next-days.tsx","src/pages/cities.tsx"]
---

# Home (and the sky shared by Próximos días and Ciudades)

Mode: operate. Audience: anyone checking the weather here and now; sailors and surfers who read wind.

## Direction contract
seed: 545512b59918518c2fb9dd5c9e107cc9 (assigned 6)
THESIS: The sky behind the app is the forecast. A WebGL sky drawn from the real OpenWeatherMap state: sun height from sunrise/sunset, cloud cover, rain, drizzle, snow, storm flashes, fog, and every moving thing drifting with the real wind direction and speed.
FIRST VIEWPORT: Place and date, a large light temperature directly on the sky (no card), the condition and the day's own summary sentence, then glass panels for the next hours and other places. Layout of v1 kept.
SIGNATURE: Tap an hour and the sky becomes that hour (night falls, rain starts) with the hero showing that hour; "Ahora" returns.
SYSTEM: Glass is functional (legibility over a moving sky), white text with a soft shadow, amber primary only for the selected hour and actions. Authored, colored condition icons with small purposeful motion.
MOTION: One entrance (sky settles, numerals rise once). Sky changes ease over ~1.2 s. Reduced motion: one still frame, no icon motion.
RAISES: from the declined time-scrub candidate: the hour strip drives the sky. Loops pause when hidden (Ionic stack), at 0×0, on the observatory, or with the tab hidden.

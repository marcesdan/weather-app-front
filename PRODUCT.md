# Product

Clima: a weather app for the place you are and the places you care about, with a professional observatory for people whose plans depend on wind and sea.

## Users and jobs

- **Everyone, daily:** open the app and know, in one glance, what the weather is doing here now and in the next hours, and what the next 7 days look like. Spanish (Argentina) first.
- **Sailors, surfers, kite and small-craft users (the observatory):** read wind, gusts, waves, swell, tide, pressure and storm risk for a precise spot, hour by hour for 72 h, in knots, m/s or km/h with Beaufort.
- **People watching a few places:** keep a short list of cities or named sea zones ("Camino del delfín") and get an alert when one of them crosses a threshold (gale gusts, rough sea, storm, heavy rain) in the next 24 h.

## What it does

- Current weather, next 24 hours and next 7 days for the current location (GPS, then IP), shown in that place's own time zone.
- Saved places: cities found by name, nearby towns offered first as shortcuts, and named map zones; rename and remove.
- Observatory: interactive map with animated wind and layers for waves, storm (CAPE) and rain, a time slider over 72 h, and a per-point table.
- Alerts for saved places: on open, every 30 minutes while open, and in the background where the platform allows.

## Platform

`web` today (mobile-first PWA), Capacitor native app for iOS and Android planned. Ionic React provides the shell; components are shadcn on Base UI.

## Constraints and truths

- Data: OpenWeatherMap One Call 3.0 through our backend (`weather-app-api`, contract v1), Open-Meteo forecast and marine, OpenStreetMap. Free tiers: non-commercial use and fair-use limits.
- Conditions come typed from OpenWeatherMap: id groups 2xx thunderstorm, 3xx drizzle, 5xx rain, 6xx snow, 7xx atmosphere (mist, fog, smoke, dust), 800 clear, 801–804 clouds; day or night from sunrise/sunset. Any visual must be driven by these, never by guesswork.
- Accessibility: readable outdoors on a phone, contrast held over any sky, `prefers-reduced-motion` honored, keyboard reachable.
- Shared design tokens with Astropia and Marcesia (registry `marces-theme`); Weather's own knobs: Figtree.
- Performance: runs on mid-range phones and in an Android WebView 111+; animation pauses when not visible (Ionic keeps pages mounted).

## Voice

Plain Spanish (Argentina, voseo), short, factual. Controls name their action; errors say what failed and what to do.

#!/usr/bin/env bash
# UI review through agent-browser (Astropia's pipeline): light/dark x 5 widths of one route, against the live API.
# Usage: pnpm ui-review [route]   e.g. pnpm ui-review /observatory?lat=-38.05&lon=-57.4
# Shots land in .qa-shots/<route>/ (gitignored); read every PNG before calling a UI change done.
set -euo pipefail
cd "$(dirname "$0")/.."

ROUTE="${1:-/}"
APP=http://localhost:4000
NAME="$(echo "$ROUTE" | tr -c 'a-zA-Z0-9\n' '_' | sed 's/^_*//;s/_*$//')"
OUT="$PWD/.qa-shots/${NAME:-home}" # absolute: the agent-browser daemon has its own working directory
mkdir -p "$OUT"

if ! curl -sf -o /dev/null "$APP/"; then
  VITE_WEATHER_API_URL=https://weather-app-api-pzz2.onrender.com/api/v1 nohup pnpm exec vite --port 4000 --strictPort >/tmp/weather-vite-qa.log 2>&1 &
  until curl -sf -o /dev/null "$APP/"; do sleep 1; done
fi

agent-browser close --all >/dev/null 2>&1 || true
for scheme in light dark; do
  for width in 360 390 768 1024 1440; do
    agent-browser --color-scheme "$scheme" open "$APP$ROUTE" >/dev/null
    agent-browser set viewport "$width" 900 >/dev/null
    agent-browser set geo -38.0 -57.55 >/dev/null
    sleep 15 # geolocation prompt guard (12 s), cold Render API, map tiles
    agent-browser screenshot --full "$OUT/$scheme-$width.png" >/dev/null
  done
  agent-browser close --all >/dev/null
done
echo "$OUT"
ls "$OUT"

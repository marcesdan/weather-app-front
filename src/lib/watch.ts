// Runs in the page and in the service worker (no DOM, no React): checks every saved place and notifies new alerts.
import { alertTag, evaluate } from "./alerts";
import { fmtHour } from "./format";
import { fetchPoint } from "./openmeteo";
import type { Place } from "./places";

type Show = (title: string, options: NotificationOptions & { image?: string }) => Promise<void>;

const STATE = "weather-state";

async function readJson<T>(cache: Cache, path: string, fallback: T): Promise<T> {
  try {
    return ((await (await cache.match(path))?.json()) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function runCheck(show: Show): Promise<number> {
  const cache = await caches.open(STATE);
  const list = await readJson<Place[]>(cache, "/state/places.json", []);
  const sent = new Set(await readJson<string[]>(cache, "/state/sent.json", []));
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let shown = 0;
  for (const p of list.filter((x) => x.alerts)) {
    const fc = await fetchPoint(p).catch(() => null);
    if (!fc) continue;
    for (const a of evaluate(fc)) {
      const tag = alertTag(p.id, a);
      if (sent.has(tag)) continue;
      await show(`${a.title} en ${p.name}`, {
        body: `${a.body} desde las ${fmtHour(a.at, tz)}. Tocá para ver el mapa.`,
        tag,
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        image: `/alerts/${a.kind}.png`, // Chrome and Android show it; Firefox and Safari ignore it
        data: { url: `/observatory?lat=${p.lat.toFixed(3)}&lon=${p.lon.toFixed(3)}` },
      });
      sent.add(tag);
      shown++;
    }
  }
  await cache.put("/state/sent.json", new Response(JSON.stringify([...sent].slice(-200))));
  return shown;
}

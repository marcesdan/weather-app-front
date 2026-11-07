import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BookmarkPlus, ChevronLeft, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WindArrow } from "@/components/weather";
import { drawHeat, LAYERS, RAMP_CSS, startParticles, type Field, type Layer } from "@/components/wind-canvas";
import { fetchAtmo, fetchSea, grid, HOURS, type PointForecast } from "@/lib/openmeteo";
import { beaufort, BEAUFORT_NAME, compass, fmtHour, fmtWeekday, fromMs, UNIT_LABEL, type WindUnit } from "@/lib/format";
import { evaluate } from "@/lib/alerts";
import { formatCoords, places } from "@/lib/places";
import { placeName, reverseGeocode } from "@/lib/api";
import { useHere, usePointForecast } from "@/lib/queries";
import { usePref } from "@/lib/prefs";
import { cn } from "@/lib/utils";

const ROWS = 8;
const COLS = 8;
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function Observatory() {
  const [params] = useSearchParams();
  const here = useHere().data;
  const start = useMemo(() => {
    const lat = Number(params.get("lat"));
    const lon = Number(params.get("lon"));
    if (params.has("lat") && Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    return here ? { lat: here.lat, lon: here.lon } : { lat: -38.0, lon: -57.55 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [unit, setUnit] = usePref<WindUnit>("unit", "kn");
  const [layer, setLayer] = useState<Layer>("wind");
  const [hour, setHour] = useState(0);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lon: number } | null>(params.has("lat") ? start : null);

  const field = useQuery({
    queryKey: ["field", bounds?.map((b) => b.toFixed(1)).join(",")],
    enabled: !!bounds,
    staleTime: 30 * 60_000,
    placeholderData: (prev) => prev,
    queryFn: async (): Promise<Field> => {
      const [s, w, n, e] = bounds!;
      const pts = grid(s, w, n, e, ROWS, COLS);
      const [atmo, sea] = await Promise.all([fetchAtmo(pts), fetchSea(pts).catch(() => pts.map(() => ({ time: [] })))]);
      return { rows: ROWS, cols: COLS, south: s, west: w, north: n, east: e, atmo, sea };
    },
  });
  const times = field.data?.atmo[0]?.time ?? [];

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center gap-2 border-b px-2 py-2 pt-[max(env(safe-area-inset-top),0.5rem)]">
        <Link to="/" aria-label="Volver" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ChevronLeft className="size-5" />
          </Link>
        <h1 className="flex-1 font-display font-semibold tracking-tight text-2xl leading-none">Observatorio</h1>
        <div role="radiogroup" aria-label="Unidad de viento" className="flex rounded-md border p-0.5 text-sm">
          {(["kn", "ms", "kmh"] as WindUnit[]).map((u) => (
            <button
              key={u}
              role="radio"
              aria-checked={unit === u}
              onClick={() => setUnit(u)}
              className={cn("rounded px-2 py-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {UNIT_LABEL[u]}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative h-[45dvh] shrink-0 lg:h-auto lg:flex-1">
          <MapView start={start} field={field.data ?? null} layer={layer} hour={hour} picked={picked} onBounds={setBounds} onPick={setPicked} />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-wrap gap-1.5 p-2">
            <div role="radiogroup" aria-label="Capa" className="pointer-events-auto flex gap-1 rounded-lg border bg-background/90 p-1 shadow-sm">
              {(Object.keys(LAYERS) as Layer[]).map((l) => (
                <button
                  key={l}
                  role="radio"
                  aria-checked={layer === l}
                  data-testid={`layer-${l}`}
                  onClick={() => setLayer(l)}
                  className={cn("rounded-md px-2.5 py-1 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", layer === l ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
                >
                  {LAYERS[l].label}
                </button>
              ))}
            </div>
          </div>
          <Legend layer={layer} />
          {field.isError && (
            <p className="absolute inset-x-2 bottom-14 z-[500] rounded-md bg-background/95 p-2 text-center text-sm">
              No pudimos cargar el pronóstico del mapa. Mové el mapa para reintentar.
            </p>
          )}
        </div>

        <aside className="flex min-h-0 flex-1 flex-col border-t lg:w-[26rem] lg:flex-none lg:border-t-0 lg:border-l">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="hour">Pronóstico</Label>
              <output htmlFor="hour" className="text-sm tabular-nums" data-testid="hour-label">
                {times[hour] ? `${fmtWeekday(times[hour], TZ)} ${fmtHour(times[hour], TZ)}` : "…"}
                {hour === 0 ? " (ahora)" : ` (+${hour} h)`}
              </output>
            </div>
            <input
              id="hour"
              type="range"
              min={0}
              max={HOURS - 1}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--primary)]"
            />
          </div>
          {picked ? (
            <PointPanel key={`${picked.lat},${picked.lon}`} at={picked} unit={unit} hour={hour} onClose={() => setPicked(null)} />
          ) : (
            <p className="px-4 pb-4 text-sm text-muted-foreground">Tocá el mapa para ver viento, olas y marea de ese punto hora por hora, y guardarlo como zona.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function MapView({
  start,
  field,
  layer,
  hour,
  picked,
  onBounds,
  onPick,
}: {
  start: { lat: number; lon: number };
  field: Field | null;
  layer: Layer;
  hour: number;
  picked: { lat: number; lon: number } | null;
  onBounds: (b: [number, number, number, number]) => void;
  onPick: (p: { lat: number; lon: number }) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const heat = useRef<HTMLCanvasElement>(null);
  const flow = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const marker = useRef<L.CircleMarker | null>(null);
  const live = useRef({ field, hour, layer });
  live.current = { field, hour, layer };
  const particles = useRef<ReturnType<typeof startParticles> | null>(null);

  useEffect(() => {
    const map = L.map(box.current!, { zoomControl: false, attributionControl: true }).setView([start.lat, start.lon], 8);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    // OSM standard tiles (no key; fair-use policy, light traffic only). Themed with a CSS filter in globals.css.
    // shortcut: public OSM tiles forbid heavy use; switch to a keyed provider (MapTiler, Stadia) before real traffic.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Open-Meteo',
      maxZoom: 14,
      minZoom: 3,
    }).addTo(map);
    mapRef.current = map;

    const size = () => {
      const { clientWidth: w, clientHeight: h } = box.current!;
      const dpr = window.devicePixelRatio || 1;
      for (const c of [heat.current!, flow.current!]) ((c.width = w * dpr), (c.height = h * dpr), (c.style.width = `${w}px`), (c.style.height = `${h}px`));
    };
    const report = () => {
      // Pad the view so particles entering from the edges have data.
      const b = map.getBounds().pad(0.15);
      onBounds([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
    };
    const redraw = () => {
      const { field: f, layer: l, hour: h } = live.current;
      if (f) drawHeat(heat.current!.getContext("2d")!, map, f, l, h);
      particles.current?.restart();
    };
    size();
    report();
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim();
    particles.current = startParticles(
      flow.current!.getContext("2d")!,
      map,
      () => live.current.field,
      () => live.current.hour,
      () => `color-mix(in oklch, ${ink} 70%, transparent)`,
    );
    const hide = () => {
      heat.current!.style.opacity = "0";
      flow.current!.style.opacity = "0";
    };
    const show = () => {
      size();
      redraw();
      heat.current!.style.opacity = "1";
      flow.current!.style.opacity = "1";
    };
    map.on("movestart zoomstart", hide);
    map.on("moveend zoomend", () => (show(), report()));
    map.on("click", (e: L.LeafletMouseEvent) => onPick({ lat: e.latlng.lat, lon: e.latlng.lng }));
    const ro = new ResizeObserver(() => (map.invalidateSize(), show()));
    ro.observe(box.current!);
    return () => {
      ro.disconnect();
      particles.current?.stop();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !field) return;
    drawHeat(heat.current!.getContext("2d")!, map, field, layer, hour);
    particles.current?.restart();
  }, [field, layer, hour]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    marker.current?.remove();
    if (picked)
      marker.current = L.circleMarker([picked.lat, picked.lon], { radius: 7, color: "#fff", weight: 2, fillColor: "oklch(0.47 0.12 46)", fillOpacity: 1 }).addTo(map);
  }, [picked]);

  return (
    <div className="absolute inset-0">
      <div ref={box} className="absolute inset-0" data-testid="map" aria-label="Mapa de viento y mar. Tocá un punto para ver su pronóstico." role="application" />
      <canvas ref={heat} className="pointer-events-none absolute inset-0 z-[400] transition-opacity duration-150" aria-hidden />
      <canvas ref={flow} className="pointer-events-none absolute inset-0 z-[401] transition-opacity duration-150" aria-hidden />
    </div>
  );
}

function Legend({ layer }: { layer: Layer }) {
  const spec = LAYERS[layer];
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-[500] rounded-md border bg-background/90 px-2 py-1.5 text-xs">
      <div className="h-1.5 w-32 rounded-full" style={{ background: RAMP_CSS }} aria-hidden />
      <div className="mt-1 flex justify-between tabular-nums text-muted-foreground">
        <span>0</span>
        <span>
          {spec.max}+ {spec.unit}
        </span>
      </div>
    </div>
  );
}

function PointPanel({ at, unit, hour, onClose }: { at: { lat: number; lon: number }; unit: WindUnit; hour: number; onClose: () => void }) {
  const fc = usePointForecast(at.lat, at.lon);
  const name = useQuery({
    queryKey: ["reverse", at.lat.toFixed(3), at.lon.toFixed(3)],
    queryFn: async () => {
      const [g] = await reverseGeocode(at.lat, at.lon);
      return g ? placeName(g) : null;
    },
    staleTime: Infinity,
    retry: false,
  });
  const [saving, setSaving] = useState(false);
  const alerts = fc.data ? evaluate(fc.data) : [];

  return (
    <section className="flex min-h-0 flex-1 flex-col border-t" aria-label="Pronóstico del punto" data-testid="point-panel">
      <div className="flex items-start justify-between gap-2 px-4 pt-3">
        <div className="min-w-0">
          <h2 className="truncate font-display font-semibold tracking-tight text-xl leading-tight">{name.data ?? (name.isFetching ? "…" : "Punto sin nombre")}</h2>
          <p className="text-xs text-muted-foreground tabular-nums">{formatCoords(at.lat, at.lon)}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="sm" variant="outline" onClick={() => setSaving(true)}>
            <BookmarkPlus /> Guardar zona
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Cerrar punto" onClick={onClose}>
            <X />
          </Button>
        </div>
      </div>
      {alerts.length > 0 && (
        <ul className="mx-4 mt-3 space-y-1" data-testid="point-alerts">
          {alerts.map((a) => (
            <li key={a.kind} className="rounded-md bg-warning/25 px-2.5 py-1.5 text-sm">
              <strong className="font-medium">{a.title}</strong>: {a.body.toLowerCase()} desde las {fmtHour(a.at, TZ)}
            </li>
          ))}
        </ul>
      )}
      {fc.data ? <PointTable fc={fc.data} unit={unit} hour={hour} /> : fc.isError ? <p className="p-4 text-sm">No pudimos traer el pronóstico de este punto.</p> : <div className="m-4 h-40 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />}
      <SaveZone open={saving} onOpenChange={setSaving} at={at} suggested={name.data ?? ""} />
    </section>
  );
}

function PointTable({ fc, unit, hour }: { fc: PointForecast; unit: WindUnit; hour: number }) {
  const { atmo, sea } = fc;
  const hasSea = sea.wave_height?.some((v) => v != null);
  // Every 3 hours from the slider's hour, 24 rows (3 days).
  const rows = atmo.time.map((t, i) => ({ t, i })).filter(({ i }) => i >= hour && (i - hour) % 3 === 0).slice(0, 24);
  const w = (ms: number | null | undefined) => (ms == null ? "–" : Math.round(fromMs(ms, unit)));
  const cur = atmo.wind_speed_10m?.[hour];
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 pt-3 pb-4">
      {cur != null && (
        <p className="mb-2 text-sm" data-testid="beaufort">
          Fuerza {beaufort(cur)} Beaufort, {BEAUFORT_NAME[beaufort(cur)].toLowerCase()}
          {!hasSea && <span className="text-muted-foreground">. Sin datos de mar en este punto.</span>}
        </p>
      )}
      <table className="w-full text-sm tabular-nums" data-testid="point-table">
        <caption className="sr-only">Pronóstico cada 3 horas</caption>
        <thead className="sticky top-0 bg-background text-xs text-muted-foreground">
          <tr className="text-left">
            <th className="py-1 pr-2 font-normal">Hora</th>
            <th className="py-1 pr-2 font-normal">Viento {UNIT_LABEL[unit]}</th>
            <th className="py-1 pr-2 font-normal">Ráfaga</th>
            {hasSea && <th className="py-1 pr-2 font-normal">Olas</th>}
            {hasSea && <th className="py-1 pr-2 font-normal">Swell</th>}
            {hasSea && <th className="py-1 pr-2 font-normal">Marea</th>}
            <th className="py-1 font-normal">hPa</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(({ t, i }) => {
            const dir = atmo.wind_direction_10m?.[i];
            return (
              <tr key={t}>
                <td className="py-1.5 pr-2 whitespace-nowrap">
                  {fmtWeekday(t, TZ)} {fmtHour(t, TZ)}
                </td>
                <td className="py-1.5 pr-2 whitespace-nowrap">
                  {dir != null && <WindArrow deg={dir} className="mr-1 inline" />}
                  {w(atmo.wind_speed_10m?.[i])} {dir != null && <span className="text-xs text-muted-foreground">{compass(dir)}</span>}
                </td>
                <td className="py-1.5 pr-2">{w(atmo.wind_gusts_10m?.[i])}</td>
                {hasSea && (
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {fmt(sea.wave_height?.[i], 1)} m <span className="text-xs text-muted-foreground">{fmt(sea.wave_period?.[i], 0)} s</span>
                  </td>
                )}
                {hasSea && (
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {fmt(sea.swell_wave_height?.[i], 1)} m{" "}
                    <span className="text-xs text-muted-foreground">{sea.swell_wave_direction?.[i] != null ? compass(sea.swell_wave_direction[i]!) : ""}</span>
                  </td>
                )}
                {hasSea && <td className="py-1.5 pr-2 whitespace-nowrap">{fmt(sea.sea_level_height_msl?.[i], 2)} m</td>}
                <td className="py-1.5">{fmt(atmo.pressure_msl?.[i], 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
const fmt = (v: number | null | undefined, digits: number) => (v == null ? "–" : v.toFixed(digits));

function SaveZone({ open, onOpenChange, at, suggested }: { open: boolean; onOpenChange: (o: boolean) => void; at: { lat: number; lon: number }; suggested: string }) {
  const [name, setName] = useState("");
  useEffect(() => {
    if (open) setName(suggested);
  }, [open, suggested]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            places.add({ name: name.trim(), lat: at.lat, lon: at.lon, kind: "zone", detail: formatCoords(at.lat, at.lon) });
            onOpenChange(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Guardar zona</DialogTitle>
            <DialogDescription>Aparece en Otras ciudades y recibe avisos. {formatCoords(at.lat, at.lon)}</DialogDescription>
          </DialogHeader>
          <Label htmlFor="zone-name" className="mt-4 block">
            Nombre
          </Label>
          <Input
            id="zone-name"
            className="mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej.: Pesquero, Punta Mogotes, Boya 3"
            maxLength={60}
            autoFocus
            required
          />
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={!name.trim()}>
              Guardar zona
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


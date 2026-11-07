import { Link, Navigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MapPin, Plus, Radar, Settings2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { BackLink, HeaderRow, SectionTitle, Shell, Strip } from "@/components/shell";
import { Hero, HourCell, PlaceCard } from "@/components/weather";
import { skyHour, useSkyHour } from "@/components/sky";
import { useHere, usePointForecast, useRainSoon, useWeather } from "@/lib/queries";
import { RainSoon } from "@/components/rain-soon";
import { DayList } from "@/components/days";
import { usePlaces, type Place } from "@/lib/places";
import { fmtDate, type Units } from "@/lib/format";
import { useUnits } from "@/lib/units";
import { evaluate } from "@/lib/alerts";

export default function Home() {
  const here = useHere();
  const qc = useQueryClient();
  const unit = useUnits();
  const saved = usePlaces();
  // /lugar/:id shows a saved place with the same layout; / shows where you are.
  const { id } = useParams();
  const place = id ? saved.find((p) => p.id === id) : undefined;
  // Location blocked and server down: fall back to the first saved place instead of a dead end.
  const fallback = here.isError && saved[0] ? { ...saved[0], detail: saved[0].detail ?? "", source: "ip" as const } : undefined;
  const spot = place ? { ...place, detail: place.detail ?? "", source: "ip" as const } : (here.data ?? fallback);
  const weather = useWeather(spot?.lat ?? 0, spot?.lon ?? 0, !!spot);
  const w = weather.data;
  const hour = useSkyHour();
  const soon = useRainSoon(spot?.lat, spot?.lon).data;

  // No GPS, no ip-api and nothing remembered: there is nothing to show.
  if (id && !place) return <Navigate to="/" replace />;
  if (here.isError && !spot) return <Navigate to="/error" replace />;

  return (
    <Shell size="wide" onRefresh={() => qc.invalidateQueries()}>
      {/* Phone: one column. Desktop: the reading stays on the left, the forecast fills the right. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="lg:sticky lg:top-6">
      <HeaderRow
        lead={
          place ? (
            <BackLink to="/" label="Volver a tu ubicación" />
          ) : (
            <Link to="/ajustes" aria-label="Ajustes" className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <Settings2 className="size-5" />
            </Link>
          )
        }
        action={
          <Link to={spot ? `/observatory?lat=${spot.lat.toFixed(3)}&lon=${spot.lon.toFixed(3)}` : "/observatory"} aria-label="Observatorio" className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <Radar className="size-5" />
            </Link>
        }
      >
        {spot ? (
          <>
            <h1 className="flex items-center justify-center gap-1.5 text-3xl leading-tight font-semibold tracking-tight" data-testid="here-name">
              {!place && <MapPin aria-hidden className="size-5 shrink-0" />}
              <span className="truncate">{spot.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground">{w ? fmtDate(w.current.dt, w.timezone) : spot.detail || " "}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Buscando tu ubicación…</p>
        )}
      </HeaderRow>

      {w ? (
        <Hero w={w} unit={unit} hour={hour} onNow={() => skyHour.set(null)} />
      ) : weather.isError ? (
        <Retry onRetry={() => weather.refetch()} />
      ) : (
        <div className="mx-auto mt-6 h-56 max-w-sm animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" aria-label="Cargando el clima" />
      )}
      </div>

      <div className="lg:pt-4">

      {soon && hour == null && <RainSoon step={soon.step} points={soon.points} />}

      <SectionTitle
        action={
          <Link to="/dias" className="flex items-center gap-0.5 text-sm text-primary-ink underline-offset-4 hover:underline lg:hidden">
            Próximos 7 días <ChevronRight aria-hidden className="size-4" />
          </Link>
        }
      >
        Próximas horas
      </SectionTitle>
      {w ? (
        // Phone: an edge-to-edge band that swipes. From sm: a rounded panel; from md: a grid, no sideways scroll.
        <div className="glass -mx-4 rounded-none border-x-0 py-1 sm:mx-0 sm:rounded-2xl sm:border-x">
          <Strip label="Próximas horas" className="mx-0 sm:px-2 md:grid md:grid-cols-8 md:overflow-visible md:after:hidden">
            {w.hourly.slice(1, 25).map((h, i) => (
              <HourCell key={h.dt} h={h} tz={w.timezone} unit={unit} selected={hour === i + 1} onPick={() => skyHour.set(hour === i + 1 ? null : i + 1)} />
            ))}
          </Strip>
        </div>
      ) : (
        <div className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
      )}

      {w && spot && (
        <section aria-label="Próximos días" className="hidden lg:block">
          <SectionTitle>Próximos 7 días</SectionTitle>
          <DayList w={w} lat={spot.lat} lon={spot.lon} unit={unit} />
        </section>
      )}

      <OtherPlaces unit={unit} currentId={place?.id} />
      </div>
      </div>
    </Shell>
  );
}

function OtherPlaces({ unit, currentId }: { unit: Units; currentId?: string }) {
  const list = usePlaces();
  return (
    <>
      <SectionTitle
        action={
          <Link to="/ciudades" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus /> Agregar
            </Link>
        }
      >
        Otras ciudades
      </SectionTitle>
      {list.length ? (
        <Strip label="Otras ciudades" className="md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:after:hidden">
          {list.filter((p) => p.id !== currentId).map((p) => (
            <SavedPlace key={p.id} p={p} unit={unit} />
          ))}
        </Strip>
      ) : (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm">
          Agregá ciudades o zonas del mapa para ver su clima acá y recibir avisos.
        </p>
      )}
    </>
  );
}

function SavedPlace({ p, unit }: { p: Place; unit: Units }) {
  const w = useWeather(p.lat, p.lon);
  const point = usePointForecast(p.lat, p.lon);
  return (
    <PlaceCard
      name={p.name}
      w={w.data}
      failed={w.isError}
      unit={unit}
      alerts={point.data ? evaluate(point.data) : undefined}
      to={`/lugar/${p.id}`}
    />
  );
}

function Retry({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="glass mt-6 rounded-2xl px-5 py-8 text-center">
      <p>No pudimos traer el clima. El servidor puede tardar un minuto en despertar.</p>
      <Button className="mt-4" variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

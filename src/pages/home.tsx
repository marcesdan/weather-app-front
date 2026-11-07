import { Link, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, MapPin, Plus, Radar } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { HeaderRow, SectionTitle, Shell, Strip } from "@/components/shell";
import { Hero, HourCell, PlaceCard } from "@/components/weather";
import { skyHour, useSkyHour } from "@/components/sky";
import { useAir, useHere, usePointForecast, useWeather } from "@/lib/queries";
import { AirCard } from "@/components/air";
import { usePlaces, type Place } from "@/lib/places";
import { fmtDate, type WindUnit } from "@/lib/format";
import { usePref } from "@/lib/prefs";
import { evaluate } from "@/lib/alerts";

export default function Home() {
  const here = useHere();
  const qc = useQueryClient();
  const [unit] = usePref<WindUnit>("unit", "kn");
  const saved = usePlaces();
  // Location blocked and server down: fall back to the first saved place instead of a dead end.
  const spot = here.data ?? (here.isError && saved[0] ? { ...saved[0], detail: saved[0].detail ?? "", source: "ip" as const } : undefined);
  const weather = useWeather(spot?.lat ?? 0, spot?.lon ?? 0, !!spot);
  const w = weather.data;
  const hour = useSkyHour();
  const air = useAir(spot?.lat, spot?.lon).data;

  // No GPS, no ip-api and nothing remembered: there is nothing to show.
  if (here.isError && !spot) return <Navigate to="/error" replace />;

  return (
    <Shell onRefresh={() => qc.invalidateQueries()}>
      <HeaderRow
        action={
          <Link to={spot ? `/observatory?lat=${spot.lat.toFixed(3)}&lon=${spot.lon.toFixed(3)}` : "/observatory"} aria-label="Observatorio" className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <Radar className="size-5" />
            </Link>
        }
      >
        {spot ? (
          <>
            <h1 className="flex items-center justify-center gap-1.5 text-3xl leading-tight font-semibold tracking-tight" data-testid="here-name">
              <MapPin aria-hidden className="size-5 shrink-0" />
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

      <SectionTitle
        action={
          <Link to="/dias" className="flex items-center gap-0.5 text-sm text-primary-ink underline-offset-4 hover:underline">
            Próximos 7 días <ChevronRight aria-hidden className="size-4" />
          </Link>
        }
      >
        Próximas horas
      </SectionTitle>
      {w ? (
        <div className="glass rounded-2xl px-2 py-1">
          <Strip label="Próximas horas">
            {w.hourly.slice(1, 25).map((h, i) => (
              <HourCell key={h.dt} h={h} tz={w.timezone} selected={hour === i + 1} onPick={() => skyHour.set(hour === i + 1 ? null : i + 1)} />
            ))}
          </Strip>
        </div>
      ) : (
        <div className="h-28 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
      )}

      {w && air && <AirCard air={air} tz={w.timezone} />}

      <OtherPlaces unit={unit} />
    </Shell>
  );
}

function OtherPlaces({ unit }: { unit: WindUnit }) {
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
        <Strip label="Otras ciudades">
          {list.map((p) => (
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

function SavedPlace({ p, unit }: { p: Place; unit: WindUnit }) {
  const w = useWeather(p.lat, p.lon);
  const point = usePointForecast(p.lat, p.lon);
  return (
    <PlaceCard
      name={p.name}
      w={w.data}
      failed={w.isError}
      unit={unit}
      alerts={point.data ? evaluate(point.data) : undefined}
      to={`/observatory?lat=${p.lat.toFixed(3)}&lon=${p.lon.toFixed(3)}`}
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

import { Link } from "react-router-dom";
import { Droplets, Navigation2, Umbrella, Undo2 } from "lucide-react";
import type { Air, OneCall } from "@/lib/api";
import { AirFact } from "./air";
import { capitalize, compass, deg, fmtHour, fmtWind, nextDay, pct, type Units } from "@/lib/format";
import type { Alert } from "@/lib/alerts";
import { ConditionIcon } from "./condition-icon";
import { cn } from "@/lib/utils";

// Arrow points where the wind blows TO, so it is rotated 180° from the "from" direction.
export function WindArrow({ deg, className }: { deg: number; className?: string }) {
  return <Navigation2 aria-hidden className={cn("size-3.5 fill-current", className)} style={{ rotate: `${deg + 180}deg` }} />;
}

// The reading sits on the sky itself, no card: the sky behind it is the picture of this same state.
export function Hero({ w, unit, hour, onNow, air }: { w: OneCall; unit: Units; hour: number | null; onNow: () => void; air?: Air }) {
  const h = hour == null ? null : w.hourly[hour];
  const s = h ?? w.current;
  const cond = s.weather[0];
  const today = w.daily[0];
  return (
    <section aria-label={h ? `Pronóstico a las ${fmtHour(h.dt, w.timezone)}` : "Ahora"} className="rise pt-4 pb-2 text-center">
      <p className="sr-only" aria-live="polite">
        {h ? `Mostrando las ${fmtHour(h.dt, w.timezone)}` : ""}
      </p>
      <div className="flex h-7 items-center justify-center gap-2">
        <ConditionIcon code={cond?.icon} animated={!h} className="-my-5 size-16" />
        {h && (
          <button
            onClick={onNow}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
          >
            A las {fmtHour(h.dt, w.timezone)} <Undo2 aria-hidden className="size-3.5" /> <span className="sr-only">Volver a</span> ahora
          </button>
        )}
      </div>
      <p className="mt-3 text-[6.5rem] leading-[0.9] font-extralight tracking-[-0.04em] tabular-nums" data-testid="current-temp">
        {deg(s.temp, unit)}
      </p>
      <p className="mt-2 text-xl font-medium">{capitalize(cond?.description ?? "")}</p>
      <p className="text-base text-muted-foreground tabular-nums">
        Máx {deg(today.temp.max, unit)} · Mín {deg(today.temp.min, unit)} · Sensación {deg(s.feels_like, unit)}
      </p>
      <dl className={cn("glass mx-auto mt-5 grid max-w-md divide-x divide-border rounded-2xl py-2.5 text-sm", air?.current ? "grid-cols-4" : "grid-cols-3")}>
        <Fact icon={<Umbrella className="size-4" />} label="Lluvia" value={pct(h ? h.pop : (w.hourly[0]?.pop ?? 0))} />
        <Fact icon={<Droplets className="size-4" />} label="Humedad" value={`${s.humidity}%`} />
        <Fact icon={<WindArrow deg={s.wind_deg} className="size-4" />} label={`Viento ${compass(s.wind_deg)}`} value={fmtWind(s.wind_speed, unit.wind)} />
        {air?.current && (
          <div>
            <dt className="sr-only">Calidad del aire</dt>
            <dd>
              <AirFact air={air} tz={w.timezone} />
            </dd>
          </div>
        )}
      </dl>
      {/* Stays in the layout while an hour is picked, so the strip below never jumps. */}
      <p className={cn("mx-auto mt-4 max-w-sm text-sm text-pretty transition-opacity", h && "opacity-0")} aria-hidden={!!h}>
        {nextDay(w.hourly, w.timezone, unit)}
      </p>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-2">
      <dt className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

// An hour is a button: picking it turns the sky (and the reading above) into that hour.
export function HourCell({ h, tz, selected, onPick, unit }: { h: OneCall["hourly"][number]; tz: string; selected: boolean; onPick: () => void; unit: Units }) {
  const cond = h.weather[0];
  return (
    <div role="listitem" className="shrink-0 snap-start">
    <button
      aria-pressed={selected}
      aria-label={`${fmtHour(h.dt, tz)}: ${deg(h.temp, unit)}, ${cond?.description}, lluvia ${pct(h.pop)}`}
      onClick={onPick}
      className={cn(
        "flex w-14 flex-col items-center gap-1.5 rounded-xl py-2.5 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/60",
        selected ? "bg-primary/90 text-primary-foreground [text-shadow:none]" : "hover:bg-accent",
      )}
    >
      <span className={cn("text-sm tabular-nums", selected ? "" : "text-muted-foreground")}>{fmtHour(h.dt, tz)}</span>
      <ConditionIcon code={cond?.icon} className="size-7" />
      <span className="font-semibold tabular-nums">{deg(h.temp, unit)}</span>
      <span className={cn("text-xs tabular-nums", h.pop >= 0.3 ? (selected ? "" : "text-[oklch(0.86_0.09_235)]") : "opacity-0")}>{pct(h.pop)}</span>
    </button>
    </div>
  );
}

export function PlaceCard({
  name,
  w,
  unit,
  alerts,
  to,
  failed,
}: {
  name: string;
  w?: OneCall;
  failed?: boolean;
  unit: Units;
  alerts?: Alert[];
  to: string;
}) {
  const cond = w?.current.weather[0];
  return (
    <div role="listitem" className="shrink-0 snap-start">
    <Link
      to={to}
      data-testid="place-card"
      className="glass flex h-full w-40 flex-col gap-2 rounded-2xl p-3 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/60"
    >
      <span className="truncate text-base font-semibold" title={name}>
        {name}
      </span>
      {w ? (
        <>
          <span className="flex items-center justify-between">
            <span className="text-4xl font-light tabular-nums">{deg(w.current.temp, unit)}</span>
            <ConditionIcon code={cond?.icon} label={cond?.description} className="size-10" />
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <WindArrow deg={w.current.wind_deg} />
            {fmtWind(w.current.wind_speed, unit.wind)} · {pct(w.hourly[0]?.pop ?? 0)} lluvia
          </span>
          {alerts?.[0] && (
            <span className="rounded-md bg-[oklch(0.8_0.15_75/0.3)] px-2 py-1 text-xs" data-testid="place-alert">
              {alerts[0].title}
            </span>
          )}
        </>
      ) : failed ? (
        <span className="text-xs text-muted-foreground">Sin datos ahora. Se reintenta solo.</span>
      ) : (
        <span className="h-16 animate-pulse rounded-md bg-muted motion-reduce:animate-none" aria-label="Cargando clima" />
      )}
    </Link>
    </div>
  );
}

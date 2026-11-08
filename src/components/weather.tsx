import { Link } from "react-router-dom";
import { CircleArrowUp, Undo2 } from "lucide-react";
import type { OneCall } from "@/lib/api";
import { capitalize, compass, deg, fmtHour, fmtTime, fmtWind, nextDay, pct, type Units } from "@/lib/format";
import type { Alert } from "@/lib/alerts";
import { ConditionIcon } from "./condition-icon";
import { cn } from "@/lib/utils";

// Points where the wind blows TO (rotated 180° from the meteorological "from" degree). A stroked arrow in a ring
// keeps a readable tip at 12-16 px and a square box whatever the angle, so it never knocks the line out of true.
// Text next to it says where it comes FROM ("del OSO"): arrow = to, words = from.
export function WindArrow({ deg, className }: { deg: number; className?: string }) {
  return <CircleArrowUp aria-hidden strokeWidth={2} className={cn("size-3.5 shrink-0", className)} style={{ transform: `rotate(${deg + 180}deg)` }} />;
}

// The reading sits on the sky itself, no card: the sky behind it is the picture of this same state.
export function Hero({ w, unit, hour, onNow }: { w: OneCall; unit: Units; hour: number | null; onNow: () => void }) {
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
      {/* Every cell is label / value / note on shared rows (subgrid), so all four lines sit on one baseline. */}
      <dl className="glass mx-auto mt-5 grid max-w-md grid-cols-4 grid-rows-[auto_auto_auto] divide-x divide-border rounded-2xl py-2.5 text-sm">
        <Fact label="Lluvia" value={pct(h ? h.pop : (w.hourly[0]?.pop ?? 0))} sub={h ? "esa hora" : "próxima hora"} />
        <Fact label="Humedad" value={`${s.humidity}%`} sub={`rocío ${deg(s.dew_point, unit)}`} />
        <Fact
          label="Viento"
          value={fmtWind(s.wind_speed, unit.wind)}
          sub={
            <span className="inline-flex items-center gap-1">
              <WindArrow deg={s.wind_deg} />
              del {compass(s.wind_deg)}
            </span>
          }
        />
        <Fact label="Sol" value={fmtTime(today.sunrise, w.timezone)} sub={`hasta ${fmtTime(today.sunset, w.timezone)}`} />
      </dl>
      {/* Stays in the layout while an hour is picked, so the strip below never jumps. */}
      <p className={cn("mx-auto mt-4 max-w-sm text-sm text-balance transition-opacity", h && "opacity-0")} aria-hidden={!!h}>
        {nextDay(w.hourly, w.timezone, unit)}
      </p>
    </section>
  );
}

function Fact({ label, value, sub }: { label: string; value: string; sub: React.ReactNode }) {
  return (
    <div className="row-span-3 grid grid-rows-subgrid gap-0.5 px-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold whitespace-nowrap tabular-nums">{value}</dd>
      <dd className="text-sm whitespace-nowrap text-muted-foreground">{sub}</dd>
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

import { Link } from "react-router-dom";
import { Droplets, Navigation2, Umbrella } from "lucide-react";
import type { OneCall } from "@/lib/api";
import { capitalize, compass, fmtHour, fmtWind, pct, type WindUnit } from "@/lib/format";
import type { Alert } from "@/lib/alerts";
import { ConditionIcon } from "./condition-icon";
import { cn } from "@/lib/utils";

// Arrow points where the wind blows TO, so it is rotated 180° from the "from" direction.
export function WindArrow({ deg, className }: { deg: number; className?: string }) {
  return <Navigation2 aria-hidden className={cn("size-3.5 fill-current", className)} style={{ rotate: `${deg + 180}deg` }} />;
}

export function Hero({ w, unit }: { w: OneCall; unit: WindUnit }) {
  const c = w.current;
  const cond = c.weather[0];
  const today = w.daily[0];
  return (
    <section aria-label="Ahora" className="mt-2 rounded-xl border bg-card px-5 pt-4 pb-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[5.5rem] leading-none font-extralight tracking-tighter tabular-nums" data-testid="current-temp">
            {Math.round(c.temp)}°
          </p>
          <p className="mt-2 text-lg">{capitalize(cond?.description ?? "")}</p>
          <p className="text-sm text-muted-foreground">
            Sensación {Math.round(c.feels_like)}° · Mín {Math.round(today.temp.min)}° · Máx {Math.round(today.temp.max)}°
          </p>
        </div>
        <ConditionIcon code={cond?.icon} label={cond?.description} className="mt-3 size-16 text-primary-ink" />
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <Fact icon={<Umbrella className="size-4" />} label="Lluvia" value={pct(w.hourly[0]?.pop ?? 0)} />
        <Fact icon={<Droplets className="size-4" />} label="Humedad" value={`${c.humidity}%`} />
        <Fact
          icon={<WindArrow deg={c.wind_deg} className="size-4" />}
          label={`Viento ${compass(c.wind_deg)}`}
          value={fmtWind(c.wind_speed, unit)}
        />
      </dl>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-base font-medium tabular-nums">{value}</dd>
    </div>
  );
}

export function HourCell({ h, tz }: { h: OneCall["hourly"][number]; tz: string }) {
  const cond = h.weather[0];
  return (
    <div role="listitem" className="flex w-16 shrink-0 snap-start flex-col items-center gap-1 rounded-lg py-2 text-sm">
      <span className="text-xs text-muted-foreground tabular-nums">{fmtHour(h.dt, tz)}</span>
      <ConditionIcon code={cond?.icon} label={cond?.description} className="size-6" />
      <span className="font-medium tabular-nums">{Math.round(h.temp)}°</span>
      <span className={cn("text-xs tabular-nums", h.pop >= 0.3 ? "text-primary-ink" : "text-muted-foreground")}>{pct(h.pop)}</span>
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
  unit: WindUnit;
  alerts?: Alert[];
  to: string;
}) {
  const cond = w?.current.weather[0];
  return (
    <Link
      role="listitem"
      to={to}
      data-testid="place-card"
      className="flex w-40 shrink-0 snap-start flex-col gap-2 rounded-xl border bg-card p-3 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="truncate font-display font-semibold tracking-tight text-xl leading-tight" title={name}>
        {name}
      </span>
      {w ? (
        <>
          <span className="flex items-center justify-between">
            <span className="font-display font-semibold tracking-tight text-4xl tabular-nums">{Math.round(w.current.temp)}°</span>
            <ConditionIcon code={cond?.icon} label={cond?.description} className="size-8 text-primary-ink" />
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <WindArrow deg={w.current.wind_deg} />
            {fmtWind(w.current.wind_speed, unit)} · {pct(w.hourly[0]?.pop ?? 0)} lluvia
          </span>
          {alerts?.[0] && (
            <span className="rounded-md bg-warning/25 px-2 py-1 text-xs text-foreground" data-testid="place-alert">
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
  );
}

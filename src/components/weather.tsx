import { Link } from "react-router-dom";
import { CircleArrowUp } from "lucide-react";
import type { OneCall } from "@/lib/api";
import { capitalize, compass, deg, fmtHour, fmtTime, fmtWind, nextDay, pct, rainSoon, windFrom, type RainPoint, type Units } from "@/lib/format";
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
export function Hero({ w, unit, hour, soon }: { w: OneCall; unit: Units; hour: number | null; soon?: RainPoint[] }) {
  const h = hour == null ? null : w.hourly[hour];
  const s = h ?? w.current;
  const cond = s.weather[0];
  const today = w.daily[0];
  return (
    <section aria-label={h ? `Pronóstico a las ${fmtHour(h.dt, w.timezone)}` : "Ahora"} className="rise pt-1 text-center">
      <p className="sr-only" aria-live="polite">
        {h ? `Mostrando las ${fmtHour(h.dt, w.timezone)}` : ""}
      </p>
      <p className="text-[3.5rem] leading-none font-extralight tracking-[-0.03em] tabular-nums" data-testid="current-temp">
        {deg(s.temp, unit)}
      </p>
      <p className="mt-2 text-xl font-medium">{capitalize(cond?.description ?? "")}</p>
      <p className="text-base text-muted-foreground tabular-nums">
        Máx {deg(today.temp.max, unit)} · Mín {deg(today.temp.min, unit)} · Sensación {deg(s.feels_like, unit)}
      </p>
      {/* Every cell is label / value / note on shared rows (subgrid), so all four lines sit on one baseline. */}
      <dl className="glass mx-auto mt-4 grid max-w-md grid-cols-4 grid-rows-[auto_auto_auto] divide-x divide-border rounded-2xl py-2.5 text-sm">
        <Fact label="Lluvia" value={pct(h ? h.pop : (w.hourly[0]?.pop ?? 0))} sub={h ? `a las ${fmtHour(h.dt, w.timezone)}` : rainNote(soon, w.timezone)} />
        <Fact label="Humedad" value={`${s.humidity}%`} sub={`rocío ${deg(s.dew_point, unit)}`} />
        <Fact
          label="Viento"
          value={fmtWind(s.wind_speed, unit.wind)}
          sub={windFrom(s.wind_deg)}
        />
        <Fact label="Sol" value={fmtTime(today.sunrise, w.timezone)} sub={`hasta ${fmtTime(today.sunset, w.timezone)}`} />
      </dl>
      {/* The sentence describes what is on screen: the next 24 h, or the picked hour (same line, no jump). */}
      <p className="mx-auto mt-3 max-w-sm text-sm text-balance">
        {h
          ? `A las ${fmtHour(h.dt, w.timezone)}: ${cond?.description ?? ""}, ${pct(h.pop)} de lluvia, viento ${fmtWind(h.wind_speed, unit.wind)} del ${windFrom(h.wind_deg).toLowerCase()}.`
          : nextDay(w.hourly, w.timezone, unit)}
      </p>
    </section>
  );
}

// The nowcast lands in the rain cell as an exact time: "llueve 23:12", or "para 23:40" while it rains.
function rainNote(points: RainPoint[] | undefined, tz: string) {
  const s = points && rainSoon(points);
  if (!s) return "próxima hora";
  if (s.raining) return s.at ? `para ${fmtTime(s.at, tz)}` : "lloviendo";
  return `llueve ${fmtTime(s.at!, tz)}`;
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
      aria-label={`${fmtHour(h.dt, tz)}: ${deg(h.temp, unit)}, ${cond?.description}, lluvia ${pct(h.pop)}, viento ${fmtWind(h.wind_speed, unit.wind)} ${windFrom(h.wind_deg)}`}
      onClick={onPick}
      className={cn(
        "flex w-16 flex-col items-center gap-1 rounded-xl py-2 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/60",
        selected ? "bg-primary/90 text-primary-foreground [text-shadow:none]" : "hover:bg-accent",
      )}
    >
      <span className={cn("text-sm tabular-nums", selected ? "" : "text-muted-foreground")}>{fmtHour(h.dt, tz)}</span>
      <ConditionIcon code={cond?.icon} className="size-7" />
      <span className="font-semibold tabular-nums">{deg(h.temp, unit)}</span>
      {/* Rain chance in rain blue when it matters, muted otherwise; wind speed without a direction glyph. */}
      <span className={cn("text-sm tabular-nums", selected ? "" : h.pop >= 0.3 ? "text-[oklch(0.86_0.09_235)]" : "text-muted-foreground")}>{pct(h.pop)}</span>
      <span className={cn("text-sm whitespace-nowrap tabular-nums", selected ? "" : "text-muted-foreground")}>{fmtWind(h.wind_speed, unit.wind)}</span>
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

import { HeaderRow, Shell } from "@/components/shell";
import { ConditionIcon } from "@/components/condition-icon";
import { WindArrow } from "@/components/weather";
import { useHere, useWeather } from "@/lib/queries";
import { capitalize, fmtWeekday, fmtWind, pct, type WindUnit } from "@/lib/format";
import { usePref } from "@/lib/prefs";

export default function NextDays() {
  const here = useHere();
  const spot = here.data;
  const { data: w } = useWeather(spot?.lat ?? 0, spot?.lon ?? 0, !!spot);
  const [unit] = usePref<WindUnit>("unit", "kmh");
  const days = w?.daily.slice(1) ?? [];
  // One shared scale so each day's bar shows where it sits in the week.
  const lo = Math.min(...days.map((d) => d.temp.min));
  const hi = Math.max(...days.map((d) => d.temp.max));

  return (
    <Shell>
      <HeaderRow back="/">
        <h1 className="font-display font-semibold tracking-tight text-2xl leading-tight">Próximos días</h1>
        {spot && <p className="truncate text-sm text-muted-foreground">{spot.name}</p>}
      </HeaderRow>
      {!w ? (
        <div className="mt-4 h-96 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      ) : (
        <ol className="mt-4 divide-y glass rounded-2xl" data-testid="days">
          {days.map((d) => {
            const cond = d.weather[0];
            return (
              <li key={d.dt} className="grid grid-cols-[3rem_2rem_1fr_auto] items-center gap-3 px-4 py-3">
                <span className="font-medium">{fmtWeekday(d.dt, w.timezone)}</span>
                <ConditionIcon code={cond?.icon} label={cond?.description} className="size-6 text-primary-ink" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{capitalize(cond?.description ?? "")}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                    <WindArrow deg={d.wind_deg} /> {fmtWind(d.wind_speed, unit)}
                    {d.wind_gust ? `, ráfagas ${fmtWind(d.wind_gust, unit)}` : ""} · {pct(d.pop)} lluvia
                  </span>
                </span>
                <span className="flex items-center gap-2 text-sm tabular-nums">
                  <span className="text-muted-foreground">{Math.round(d.temp.min)}°</span>
                  <span className="relative hidden h-1.5 w-16 rounded-full bg-muted sm:block" aria-hidden>
                    <span
                      className="absolute inset-y-0 rounded-full bg-primary"
                      style={{ left: `${((d.temp.min - lo) / (hi - lo || 1)) * 100}%`, right: `${((hi - d.temp.max) / (hi - lo || 1)) * 100}%` }}
                    />
                  </span>
                  <span className="font-medium">{Math.round(d.temp.max)}°</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Shell>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ConditionIcon } from "./condition-icon";
import { WindArrow } from "./weather";
import type { OneCall } from "@/lib/api";
import { capitalize, deg, fmtHour, fmtWeekday, fmtWind, fromMs, pct, type Units } from "@/lib/format";
import { fetchWeekHours, type HourRow } from "@/lib/openmeteo";
import { coordKey } from "@/lib/places";
import { wmo } from "@/lib/wmo";

// Calendar day of a moment in the place's time zone, to put Open-Meteo's hours under OpenWeatherMap's days.
const dayKey = (unix: number, timeZone: string) => new Intl.DateTimeFormat("en-CA", { timeZone }).format(unix * 1000);

// Seven days; each opens in place to show that day hour by hour (Open-Meteo: One Call only has 48 hours).
export function DayList({ w, lat, lon, unit }: { w: OneCall; lat: number; lon: number; unit: Units }) {
  const days = w.daily.slice(1);
  const hours = useQuery({
    queryKey: ["week-hours", coordKey(lat, lon)],
    queryFn: () => fetchWeekHours({ lat, lon }),
    staleTime: 60 * 60_000,
  });
  // One shared scale so each day's bar shows where it sits in the week.
  const lo = Math.min(...days.map((d) => d.temp.min));
  const hi = Math.max(...days.map((d) => d.temp.max));
  const byDay = new Map<string, HourRow[]>();
  for (const h of hours.data ?? []) {
    const k = dayKey(h.dt, w.timezone);
    byDay.set(k, [...(byDay.get(k) ?? []), h]);
  }

  return (
    <Accordion className="glass rounded-2xl" data-testid="days">
      {days.map((d) => {
        const cond = d.weather[0];
        const list = byDay.get(dayKey(d.dt, w.timezone)) ?? [];
        return (
          <AccordionItem key={d.dt} value={d.dt} className="border-border">
            <AccordionTrigger className="items-center gap-3 px-4 py-3 text-base font-normal hover:no-underline">
              <span className="w-10 shrink-0 font-semibold">{fmtWeekday(d.dt, w.timezone)}</span>
              <ConditionIcon code={cond?.icon} label={cond?.description} className="size-8 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{capitalize(cond?.description ?? "")}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
                  <WindArrow deg={d.wind_deg} /> {fmtWind(d.wind_speed, unit.wind)}
                  {d.wind_gust ? <span className="hidden sm:inline">, ráfagas {fmtWind(d.wind_gust, unit.wind)}</span> : null} · {pct(d.pop)} lluvia
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2 tabular-nums">
                <span className="text-muted-foreground">{deg(d.temp.min, unit)}</span>
                <span className="relative hidden h-1.5 w-20 rounded-full bg-muted sm:block" aria-hidden>
                  <span
                    className="absolute inset-y-0 rounded-full bg-[linear-gradient(to_right,oklch(0.75_0.12_230),oklch(0.83_0.15_80))]"
                    style={{ left: `${((d.temp.min - lo) / (hi - lo || 1)) * 100}%`, right: `${((hi - d.temp.max) / (hi - lo || 1)) * 100}%` }}
                  />
                </span>
                <span className="font-semibold">{deg(d.temp.max, unit)}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              {list.length ? (
                <div role="list" aria-label={`Hora a hora, ${fmtWeekday(d.dt, w.timezone)}`} className="no-scrollbar flex gap-1 overflow-x-auto md:grid md:grid-cols-8 md:overflow-visible">
                  {list.map((h) => {
                    const c = wmo(h.code, h.day);
                    return (
                      <div role="listitem" key={h.dt} className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-xl py-2 md:w-auto" title={c.text}>
                        <span className="text-sm text-muted-foreground tabular-nums">{fmtHour(h.dt, w.timezone)}</span>
                        <ConditionIcon code={c.icon} label={c.text} className="size-7" />
                        <span className="font-semibold tabular-nums">{deg(h.temp, unit)}</span>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
                          <WindArrow deg={h.windDeg} className="size-3" />
                          {Math.round(fromMs(h.wind, unit.wind))}
                        </span>
                        <span className={h.pop >= 0.3 ? "text-sm text-[oklch(0.86_0.09_235)] tabular-nums" : "text-sm opacity-0"}>{pct(h.pop)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="px-2 text-muted-foreground">{hours.isError ? "No pudimos traer el hora a hora. Probá en un rato." : "Cargando el hora a hora…"}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

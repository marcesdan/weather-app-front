import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ConditionIcon } from "./condition-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { OneCall } from "@/lib/api";
import { deg, fmtHour, fmtWeekday, fmtWind, pct, windFrom, type Units } from "@/lib/format";
import { cn } from "@/lib/utils";
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
            {/* One line at every width: day, icon with rain chance, min, the week-scaled bar, max. Wind lives in
                the hour-by-hour view (an arrow per hour), never as a second speed here. */}
            <AccordionTrigger
              className="grid grid-cols-[2.75rem_2.75rem_2.25rem_minmax(0,1fr)_2.25rem_1rem] items-center gap-2 px-4 py-2.5 text-base font-normal hover:no-underline"
              aria-label={`${fmtWeekday(d.dt, w.timezone)}: ${cond?.description}, mínima ${deg(d.temp.min, unit)}, máxima ${deg(d.temp.max, unit)}, lluvia ${pct(d.pop)}`}
            >
              <span className="font-semibold">{fmtWeekday(d.dt, w.timezone)}</span>
              <span className="flex flex-col items-center">
                <ConditionIcon code={cond?.icon} className="size-7" />
                <span className={cn("text-xs leading-none tabular-nums text-[oklch(0.86_0.09_235)]", d.pop < 0.2 && "invisible")}>{pct(d.pop)}</span>
              </span>
              <span className="text-right text-muted-foreground tabular-nums">{deg(d.temp.min, unit)}</span>
              <span className="relative h-1.5 rounded-full bg-muted" aria-hidden>
                <span
                  className="absolute inset-y-0 rounded-full bg-[linear-gradient(to_right,oklch(0.75_0.12_230),oklch(0.83_0.15_80))]"
                  style={{ left: `${((d.temp.min - lo) / (hi - lo || 1)) * 100}%`, right: `${((hi - d.temp.max) / (hi - lo || 1)) * 100}%` }}
                />
              </span>
              <span className="font-semibold tabular-nums">{deg(d.temp.max, unit)}</span>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              {list.length ? (
                <div role="list" aria-label={`Hora a hora, ${fmtWeekday(d.dt, w.timezone)}`} className="strip flex gap-1 overflow-x-auto select-none">
                  {list.map((h) => {
                    const c = wmo(h.code, h.day);
                    return (
                      <Popover key={h.dt}>
                        {/* Tap or click an hour for its details (wind and where it comes from) in a real popover. */}
                        <PopoverTrigger
                          role="listitem"
                          className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl py-2 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/60"
                          aria-label={`${fmtHour(h.dt, w.timezone)}: ${deg(h.temp, unit)}, ${c.text}, lluvia ${pct(h.pop)}. Ver detalle`}
                        >
                          <span className="text-sm text-muted-foreground tabular-nums">{fmtHour(h.dt, w.timezone)}</span>
                          <ConditionIcon code={c.icon} className="size-7" />
                          <span className="font-semibold tabular-nums">{deg(h.temp, unit)}</span>
                          <span className={cn("text-sm tabular-nums", h.pop >= 0.3 ? "text-[oklch(0.86_0.09_235)]" : "text-muted-foreground")}>{pct(h.pop)}</span>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 gap-1 border-white/15 bg-[oklch(0.22_0.03_260/0.94)] text-white ring-white/10 backdrop-blur-xl" data-testid="hour-detail">
                          <p className="font-semibold">
                            {fmtWeekday(h.dt, w.timezone)} {fmtHour(h.dt, w.timezone)}: {c.text}
                          </p>
                          <p className="tabular-nums">
                            {deg(h.temp, unit)}, lluvia {pct(h.pop)}
                          </p>
                          <p className="tabular-nums">
                            Viento {fmtWind(h.wind, unit.wind)} {windFrom(h.windDeg)}
                          </p>
                        </PopoverContent>
                      </Popover>
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

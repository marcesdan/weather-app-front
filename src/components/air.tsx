import type { Air } from "@/lib/api";
import { AQI, fmtHour } from "@/lib/format";
import { cn } from "@/lib/utils";

// Colour marks the level (a real state), from calm to alarming.
const LEVEL = ["", "bg-[oklch(0.78_0.15_150)]", "bg-[oklch(0.85_0.15_110)]", "bg-[oklch(0.83_0.16_80)]", "bg-[oklch(0.68_0.2_35)]", "bg-[oklch(0.55_0.2_15)]"];

export function AirCard({ air, tz }: { air: Air; tz: string }) {
  const now = air.current;
  if (!now) return null;
  const aqi = now.main.aqi;
  const next = air.forecast.slice(0, 24);
  const worse = next.find((p) => p.aqi > aqi && p.aqi >= 3);
  return (
    <section aria-label="Calidad del aire" className="glass mt-3 flex items-center gap-4 rounded-2xl px-4 py-3" data-testid="air">
      <span className="flex items-center gap-2">
        <span aria-hidden className={cn("size-3 rounded-full", LEVEL[aqi])} />
        <span>
          <span className="block text-xs text-muted-foreground">Calidad del aire</span>
          <span className="block font-semibold">{AQI[aqi]}</span>
        </span>
      </span>
      <span className="ml-auto text-right text-sm">
        <span className="block tabular-nums">PM2.5 {Math.round(now.components.pm2_5)} µg/m³</span>
        <span className="block text-xs text-muted-foreground">
          {worse ? `${AQI[worse.aqi]} desde las ${fmtHour(worse.dt, tz)}` : "Estable las próximas 24 h"}
        </span>
      </span>
    </section>
  );
}

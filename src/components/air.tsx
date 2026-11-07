import type { Air } from "@/lib/api";
import { AQI, fmtHour } from "@/lib/format";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Colour marks the level (a real state), from good to very poor (OpenWeatherMap AQI 1–5).
const LEVEL = ["", "bg-[oklch(0.78_0.15_150)]", "bg-[oklch(0.85_0.15_110)]", "bg-[oklch(0.83_0.16_80)]", "bg-[oklch(0.68_0.2_35)]", "bg-[oklch(0.55_0.2_15)]"];

// One more fact in the row: the level and its colour. Details (PM2.5, the next 24 h) on tap or click.
export function AirFact({ air, tz }: { air: Air; tz: string }) {
  const now = air.current;
  if (!now) return null;
  const aqi = now.main.aqi;
  const worse = air.forecast.slice(0, 24).find((p) => p.aqi > aqi && p.aqi >= 3);
  return (
    <Popover>
      <PopoverTrigger
        data-testid="air"
        className="rounded-lg px-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
        aria-label={`Calidad del aire ${AQI[aqi]}. Ver detalle`}
      >
        <span className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <span aria-hidden className={cn("size-2.5 rounded-full", LEVEL[aqi])} />
          Aire
        </span>
        <span className="mt-0.5 block text-base font-semibold">{AQI[aqi]}</span>
      </PopoverTrigger>
      <PopoverContent className="w-60" data-testid="air-detail">
        <p className="font-medium">Calidad del aire: {AQI[aqi]}</p>
        <p className="tabular-nums">PM2.5 {Math.round(now.components.pm2_5)} µg/m³</p>
        <p className="text-muted-foreground">{worse ? `${AQI[worse.aqi]} desde las ${fmtHour(worse.dt, tz)}` : "Sin cambios en las próximas 24 h"}</p>
      </PopoverContent>
    </Popover>
  );
}

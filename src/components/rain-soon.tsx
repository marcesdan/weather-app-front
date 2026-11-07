import { Umbrella } from "lucide-react";
import { rainSoon, type RainPoint } from "@/lib/format";

// Only when rain is coming or falling in the window: one sentence and the intensity over time, in rain-radar blue.
export function RainSoon({ step, points }: { step: number; points: RainPoint[] }) {
  const text = rainSoon(points);
  if (!text) return null;
  const max = Math.max(2, ...points.map((p) => p.precipitation)); // 2 mm/h fills the bar: moderate rain
  return (
    <section aria-label="Lluvia próxima" className="glass mt-3 rounded-2xl px-4 py-3" data-testid="rain-soon">
      <p className="flex items-center gap-2 font-semibold">
        <Umbrella aria-hidden className="size-4" /> {text}
      </p>
      <div aria-hidden className="mt-2 flex h-10 items-end gap-px">
        {points.map((p) => (
          <span
            key={p.dt}
            className="flex-1 rounded-t-sm bg-[oklch(0.78_0.11_235)]"
            style={{ height: `${Math.max(4, (Math.min(p.precipitation, max) / max) * 100)}%`, opacity: p.precipitation >= 0.1 ? 1 : 0.25 }}
          />
        ))}
      </div>
      <p aria-hidden className="mt-1 flex justify-between text-sm text-muted-foreground">
        <span>Ahora</span>
        <span>{step === 1 ? "+60 min" : `+${(points.length * step) / 60} h`}</span>
      </p>
    </section>
  );
}

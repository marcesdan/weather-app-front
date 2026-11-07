import { useId } from "react";
import { cn } from "@/lib/utils";

// Authored weather icons keyed by OpenWeatherMap's icon code ("10n"): coloured, layered, and animated only where the
// caller asks (the hero), so a strip of 24 hours stays calm. Motion stops under prefers-reduced-motion (globals.css).
type Props = { code?: string; label?: string; className?: string; animated?: boolean };

const SUN = "oklch(0.83 0.16 78)";
const SUN_CORE = "oklch(0.9 0.14 90)";
const MOON = "oklch(0.93 0.03 250)";
const DROP = "oklch(0.82 0.09 235)";
const BOLT = "oklch(0.88 0.17 92)";

function Sun({ x = 32, y = 32, r = 11, anim }: { x?: number; y?: number; r?: number; anim?: boolean }) {
  return (
    <g>
      <g className={cn(anim && "wi-spin")} style={{ transformOrigin: `${x}px ${y}px` }} stroke={SUN} strokeWidth={3} strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <line key={i} x1={x + Math.cos(a) * (r + 5)} y1={y + Math.sin(a) * (r + 5)} x2={x + Math.cos(a) * (r + 10)} y2={y + Math.sin(a) * (r + 10)} />;
        })}
      </g>
      <circle cx={x} cy={y} r={r} fill={SUN_CORE} stroke={SUN} strokeWidth={2.5} />
    </g>
  );
}

function Moon({ x = 32, y = 30, r = 13 }: { x?: number; y?: number; r?: number }) {
  return <path d={`M${x + r * 0.3} ${y - r} a${r} ${r} 0 1 0 ${r * 0.75} ${r * 1.55} a${r * 0.95} ${r * 0.95} 0 0 1 ${-r * 0.75} ${-r * 1.55}z`} fill={MOON} />;
}

function Cloud({ dx = 0, dy = 0, s = 1, dark, gid, anim }: { dx?: number; dy?: number; s?: number; dark?: boolean; gid: string; anim?: boolean }) {
  return (
    <g transform={`translate(${dx} ${dy}) scale(${s})`}>
      <g className={cn(anim && "wi-float")}>
        <path
          d="M18 46h30a10 10 0 0 0 1.5-19.9A14 14 0 0 0 22.6 24 11 11 0 0 0 18 46z"
          fill={`url(#${gid}${dark ? "d" : "l"})`}
          stroke={dark ? "oklch(0.5 0.03 260)" : "oklch(0.86 0.02 250)"}
          strokeWidth={1.2}
        />
      </g>
    </g>
  );
}

export function ConditionIcon({ code = "03d", label, className, animated }: Props) {
  const gid = useId().replace(/:/g, "");
  const kind = code.slice(0, 2);
  const night = code.endsWith("n");
  const anim = animated;
  const body = (() => {
    switch (kind) {
      case "01":
        return night ? <Moon /> : <Sun anim={anim} r={12} />;
      case "02":
        return (
          <>
            {night ? <Moon x={24} y={20} r={10} /> : <Sun x={24} y={22} r={9} anim={anim} />}
            <Cloud dx={6} dy={6} s={0.9} gid={gid} anim={anim} />
          </>
        );
      case "03":
        return <Cloud dy={-4} gid={gid} anim={anim} />;
      case "04":
        return (
          <>
            <Cloud dx={10} dy={-12} s={0.75} gid={gid} dark />
            <Cloud dx={-2} dy={-2} gid={gid} anim={anim} />
          </>
        );
      case "09":
      case "10":
        return (
          <>
            {kind === "10" && (night ? <Moon x={22} y={16} r={8} /> : <Sun x={22} y={18} r={7} anim={anim} />)}
            <Cloud dy={-8} gid={gid} dark={kind === "09"} anim={anim} />
            <Drops anim={anim} heavy={kind === "10"} />
          </>
        );
      case "11":
        return (
          <>
            <Cloud dy={-10} gid={gid} dark anim={anim} />
            <path className={cn(anim && "wi-bolt")} d="M34 38l-7 11h6l-3 9 9-13h-6l3-7z" fill={BOLT} />
            <Drops anim={anim} only={[0, 2]} />
          </>
        );
      case "13":
        return (
          <>
            <Cloud dy={-8} gid={gid} anim={anim} />
            {[22, 32, 42].map((x, i) => (
              <circle key={x} className={cn(anim && "wi-flake")} style={{ animationDelay: `${i * 0.5}s` }} cx={x} cy={48 + (i % 2) * 5} r={2.4} fill="white" />
            ))}
          </>
        );
      case "50":
        return (
          <g stroke="oklch(0.9 0.01 250)" strokeWidth={3.2} strokeLinecap="round">
            {[24, 32, 40, 48].map((y, i) => (
              <line key={y} className={cn(anim && "wi-drift")} style={{ animationDelay: `${i * 0.6}s` }} x1={14 + (i % 2) * 6} y1={y} x2={50 - (i % 2) * 4} y2={y} />
            ))}
          </g>
        );
      default:
        return <Cloud gid={gid} />;
    }
  })();
  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0 overflow-visible", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`${gid}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.99 0.005 250)" />
          <stop offset="1" stopColor="oklch(0.87 0.02 250)" />
        </linearGradient>
        <linearGradient id={`${gid}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.72 0.025 260)" />
          <stop offset="1" stopColor="oklch(0.55 0.03 260)" />
        </linearGradient>
      </defs>
      {body}
    </svg>
  );
}

function Drops({ anim, heavy, only }: { anim?: boolean; heavy?: boolean; only?: number[] }) {
  const xs = [24, 32, 40].filter((_, i) => !only || only.includes(i));
  return (
    <g stroke={DROP} strokeWidth={2.6} strokeLinecap="round">
      {xs.map((x, i) => (
        <line key={x} className={cn(anim && "wi-drop")} style={{ animationDelay: `${i * 0.35}s` }} x1={x} y1={44} x2={x - 2} y2={heavy ? 52 : 49} />
      ))}
    </g>
  );
}

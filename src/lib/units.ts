import { usePref } from "./prefs";
import type { TempUnit, Units, WindUnit } from "./format";

// Display units chosen in Ajustes (km/h and °C by default; sailors pick knots).
export function useUnits(): Units {
  const [wind] = usePref<WindUnit>("unit", "kmh");
  const [temp] = usePref<TempUnit>("temp", "c");
  return { wind, temp };
}

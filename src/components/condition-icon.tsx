import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Cloudy, Moon, Sun, type LucideProps } from "lucide-react";

// OpenWeatherMap icon codes ("04d") to line icons that take the app's color instead of OWM's bitmaps.
const ICONS: Record<string, [day: typeof Sun, night: typeof Sun]> = {
  "01": [Sun, Moon],
  "02": [CloudSun, CloudMoon],
  "03": [Cloud, Cloud],
  "04": [Cloudy, Cloudy],
  "09": [CloudDrizzle, CloudDrizzle],
  "10": [CloudRain, CloudRain],
  "11": [CloudLightning, CloudLightning],
  "13": [CloudSnow, CloudSnow],
  "50": [CloudFog, CloudFog],
};

export function ConditionIcon({ code = "03d", label, ...props }: { code?: string; label?: string } & LucideProps) {
  const [day, night] = ICONS[code.slice(0, 2)] ?? ICONS["03"];
  const Icon = code.endsWith("n") ? night : day;
  return <Icon role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} strokeWidth={1.5} {...props} />;
}

import type { CapacitorConfig } from "@capacitor/cli";

// shortcut: android/ and ios/ are not generated yet; run `pnpm exec cap add android|ios` when the native app starts.
const config: CapacitorConfig = {
  appId: "com.marces.weather",
  appName: "Weather",
  webDir: "dist",
  android: { minWebViewVersion: 111 }, // Tailwind 4 / oklch floor, same as Astropia
};

export default config;

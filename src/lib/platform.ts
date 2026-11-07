import { Capacitor } from "@capacitor/core";

/** Fixed at build time (`vite build --mode native` vs `vite build`): `if (IS_NATIVE)` branches of the other platform are
 * dropped from the bundle. Never replace it with a runtime check where the point is keeping code out of a build. */
export const IS_NATIVE = __NATIVE__;

export type Platform = "web" | "android" | "ios";
export const PLATFORM: Platform = IS_NATIVE ? (Capacitor.getPlatform() as Platform) : "web";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

export function getPref<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(`weather.${key}`) as T | null) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setPref(key: string, value: string) {
  try {
    localStorage.setItem(`weather.${key}`, value);
  } catch {
    // private mode: the choice lasts this session only
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function usePref<T extends string>(key: string, fallback: T) {
  const value = useSyncExternalStore(subscribe, () => getPref(key, fallback), () => fallback);
  return [value, (v: T) => setPref(key, v)] as const;
}

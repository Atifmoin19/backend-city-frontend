"use client";

import { useSyncExternalStore } from "react";

export type ResolvedTheme = "dark" | "light";

export function resolveTheme(pref: "system" | ResolvedTheme): ResolvedTheme {
  if (pref !== "system") return pref;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/** The theme actually on screen (reads <html data-theme>). Canvas scenes key off this. */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => "dark",
  );
}

/** Read a CSS custom property as a color string (for canvas / WebGL code). */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Read a hex CSS custom property as a number (for PixiJS). */
export function cssHex(name: string): number {
  const v = cssVar(name).replace("#", "");
  return Number.parseInt(v.length === 3 ? v.replace(/(.)/g, "$1$1") : v, 16);
}

"use client";

import { useSyncExternalStore } from "react";

import { usePreferences } from "@/stores/preferences";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True when motion should be minimized: OS setting, user override, or performance mode. */
export function useReducedMotion(): boolean {
  const system = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const { motion, performanceMode } = usePreferences();
  if (motion === "reduced" || performanceMode) return true;
  if (motion === "full") return false;
  return system;
}

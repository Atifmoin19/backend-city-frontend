"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { resolveTheme } from "@/lib/theme";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePreferences } from "@/stores/preferences";

function PreferenceAttributes(): null {
  const { performanceMode, motion, theme } = usePreferences();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.perf = performanceMode ? "on" : "off";
    root.dataset.motion = motion;
  }, [performanceMode, motion]);
  useEffect(() => {
    const apply = () => (document.documentElement.dataset.theme = resolveTheme(theme));
    apply();
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  );
  const reduced = useReducedMotion();
  return (
    <QueryClientProvider client={client}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        <PreferenceAttributes />
        {children}
      </MotionConfig>
    </QueryClientProvider>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePreferences } from "@/stores/preferences";

function PreferenceAttributes(): null {
  const { performanceMode, motion } = usePreferences();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.perf = performanceMode ? "on" : "off";
    root.dataset.motion = motion;
  }, [performanceMode, motion]);
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

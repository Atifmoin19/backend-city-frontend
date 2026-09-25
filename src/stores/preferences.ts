"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MotionPreference = "system" | "reduced" | "full";
export type ThemePreference = "system" | "dark" | "light";

interface PreferencesState {
  performanceMode: boolean;
  soundMuted: boolean;
  motion: MotionPreference;
  theme: ThemePreference;
  setPerformanceMode: (on: boolean) => void;
  toggleSound: () => void;
  setMotion: (m: MotionPreference) => void;
  setTheme: (t: ThemePreference) => void;
}

/** Per-viewer settings, persisted locally (ideology 9.4 / 19). */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      performanceMode: false,
      soundMuted: true, // sound is opt-in
      motion: "system",
      theme: "dark", // the night city is the signature look; light is opt-in
      setPerformanceMode: (performanceMode) => set({ performanceMode }),
      toggleSound: () => set((s) => ({ soundMuted: !s.soundMuted })),
      setMotion: (motion) => set({ motion }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "bc-preferences" },
  ),
);

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MotionPreference = "system" | "reduced" | "full";

interface PreferencesState {
  performanceMode: boolean;
  soundMuted: boolean;
  motion: MotionPreference;
  setPerformanceMode: (on: boolean) => void;
  toggleSound: () => void;
  setMotion: (m: MotionPreference) => void;
}

/** Per-viewer settings, persisted locally (ideology 9.4 / 19). */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      performanceMode: false,
      soundMuted: true, // sound is opt-in
      motion: "system",
      setPerformanceMode: (performanceMode) => set({ performanceMode }),
      toggleSound: () => set((s) => ({ soundMuted: !s.soundMuted })),
      setMotion: (motion) => set({ motion }),
    }),
    { name: "bc-preferences" },
  ),
);

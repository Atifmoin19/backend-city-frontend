"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useSession } from "@/features/auth/useSession";

export interface TopicRecord {
  lessonDone?: boolean;
  practicePassed?: boolean;
  checkpoint?: { score: number; stars: number };
}

interface LearningState {
  byUser: Record<string, Record<string, TopicRecord>>;
  onboarded: Record<string, boolean>;
  update: (userKey: string, topic: string, patch: Partial<TopicRecord>) => void;
  setOnboarded: (userKey: string) => void;
}

/**
 * Learner progress, kept in this browser until the backend progress API (topic_progress)
 * is wired. Keyed by user id so accounts sharing a browser don't mix.
 */
export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      byUser: {},
      onboarded: {},
      setOnboarded: (userKey) => set((s) => ({ onboarded: { ...s.onboarded, [userKey]: true } })),
      update: (userKey, topic, patch) =>
        set((s) => ({
          byUser: {
            ...s.byUser,
            [userKey]: {
              ...s.byUser[userKey],
              [topic]: { ...s.byUser[userKey]?.[topic], ...patch },
            },
          },
        })),
    }),
    { name: "bc-learning" },
  ),
);

const EMPTY: Record<string, TopicRecord> = {};

export function useLearning() {
  const { data: user } = useSession();
  const key = user?.id ?? "guest";
  const records = useLearningStore((s) => s.byUser[key] ?? EMPTY);
  const update = useLearningStore((s) => s.update);
  const onboarded = useLearningStore((s) => !!s.onboarded[key]);
  const setOnboarded = useLearningStore((s) => s.setOnboarded);
  return {
    records,
    onboarded,
    markOnboarded: () => setOnboarded(key),
    record: (topic: string): TopicRecord => records[topic] ?? {},
    update: (topic: string, patch: Partial<TopicRecord>) => update(key, topic, patch),
  };
}

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
  update: (userKey: string, topic: string, patch: Partial<TopicRecord>) => void;
}

/**
 * Learner progress, kept in this browser until the backend progress API (topic_progress)
 * is wired. Keyed by user id so accounts sharing a browser don't mix.
 */
export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      byUser: {},
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
  return {
    records,
    record: (topic: string): TopicRecord => records[topic] ?? {},
    update: (topic: string, patch: Partial<TopicRecord>) => update(key, topic, patch),
  };
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { TOPICS } from "@/content/topics";
import { SESSION_KEY, useSession } from "@/features/auth/useSession";
import { gamesApi } from "@/lib/api/games";
import { progressApi } from "@/lib/api/progress";
import type { Progress, TopicProgress, UserPublic } from "@/lib/api/types";

import { clearLegacy, legacyFor } from "./legacy";
import { EMPTY_RECORD, recordsFrom, withTopic, type TopicRecord } from "./records";

export const progressKey = (userId: string | undefined) => ["progress", userId ?? "guest"] as const;

/** Server progress; the first load for a user also moves any browser-kept progress over. */
async function fetchProgress(userId: string): Promise<Progress> {
  const legacy = legacyFor(userId);
  if (!legacy) return progressApi.get();
  const imported = await progressApi.importLocal(legacy);
  clearLegacy(userId);
  return imported;
}

/** Learner progress from the backend (`/me/progress`). Guests have none. */
export function useLearning() {
  const qc = useQueryClient();
  const { data: user } = useSession();
  const key = progressKey(user?.id);
  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchProgress(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  });
  const records = useMemo(() => recordsFrom(TOPICS, query.data), [query.data]);

  const store = (next: TopicProgress) =>
    qc.setQueryData<Progress>(key, (old) => withTopic(old, next));

  const completeLesson = useMutation({
    mutationFn: (topic: string) => progressApi.completeLesson(topic),
    onSuccess: store,
  });
  const recordPractice = useMutation({
    mutationFn: (a: { slug: string; token: string; passed: boolean; score: number }) =>
      gamesApi.practice(a.slug, a.token, a.passed, a.score),
    onSuccess: store,
  });
  const markOnboarded = useMutation({
    mutationFn: () => progressApi.markOnboarded(),
    onSuccess: () =>
      qc.setQueryData<UserPublic | null>(SESSION_KEY, (u) => (u ? { ...u, onboarded: true } : u)),
  });

  return {
    records,
    /** True until the first progress response for a signed-in user. */
    loading: !!user && query.isPending,
    onboarded: !!user?.onboarded,
    record: (topic: string): TopicRecord => records[topic] ?? EMPTY_RECORD,
    completeLesson,
    recordPractice,
    markOnboarded,
    refresh: () => qc.invalidateQueries({ queryKey: key }),
  };
}

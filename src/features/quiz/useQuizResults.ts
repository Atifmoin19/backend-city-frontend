"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SESSION_KEY, useSession } from "@/features/auth/useSession";
import { quizApi, type QuizRoundResult } from "@/lib/api/quiz";
import type { UserPublic } from "@/lib/api/types";

const KEY = (userId: string | undefined) => ["quiz-results", userId ?? "guest"] as const;

/** Best round per quiz for the signed-in learner, and saving a finished round. */
export function useQuizResults() {
  const qc = useQueryClient();
  const { data: user } = useSession();
  const results = useQuery({
    queryKey: KEY(user?.id),
    queryFn: quizApi.results,
    enabled: !!user,
  });
  const record = useMutation({
    mutationFn: (body: QuizRoundResult) => quizApi.record(body),
    onSuccess: (data) => qc.setQueryData(KEY(user?.id), data),
  });
  const placement = useMutation({
    mutationFn: (district: string) => quizApi.placement(district),
    onSuccess: (u) => qc.setQueryData<UserPublic | null>(SESSION_KEY, u),
  });
  const best = (slug: string) => results.data?.results.find((r) => r.quiz === slug);
  return { signedIn: !!user, best, record, placement };
}

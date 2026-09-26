import { api } from "./client";
import type { UserPublic } from "./types";

export interface QuizBest {
  quiz: string;
  best_score: number;
  total: number;
  best_combo: number;
  plays: number;
}

export interface QuizRoundResult {
  quiz: string;
  score: number;
  total: number;
  best_combo: number;
  seconds?: number;
}

export const quizApi = {
  results: () => api<{ results: QuizBest[] }>("/me/quiz-results"),
  record: (body: QuizRoundResult) =>
    api<{ results: QuizBest[] }>("/me/quiz-results", { method: "POST", body }),
  placement: (start_district: string) =>
    api<UserPublic>("/me/placement", { method: "PUT", body: { start_district } }),
};

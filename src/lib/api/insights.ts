import { api } from "./client";

/** Admin analytics + feedback shapes (backend app/schemas/analytics.py, feedback.py). */

export interface AdminAnalytics {
  learners: {
    total: number;
    active_7d: number;
    active_30d: number;
    signups_14d: { day: string; count: number }[];
  };
  funnel: {
    topic: string;
    title: string;
    district: string;
    briefed: number;
    practiced: number;
    attempted: number | null;
    passed: number | null;
  }[];
  games: {
    slug: string;
    title: string;
    topic: string;
    is_checkpoint: boolean;
    players: number;
    attempts: number;
    pass_rate: number;
    avg_score: number | null;
    avg_hints: number | null;
  }[];
  quizzes: { quiz: string; rounds: number; players: number; avg_pct: number }[];
}

export type FeedbackKind = "bug" | "idea" | "content" | "other";
export type FeedbackStatus = "new" | "seen" | "done";

export interface AdminFeedback {
  id: string;
  kind: FeedbackKind;
  message: string;
  page: string | null;
  game_slug: string | null;
  status: FeedbackStatus;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
}

export const insightsApi = {
  analytics: () => api<AdminAnalytics>("/admin/analytics"),
  feedback: (status?: FeedbackStatus) =>
    api<{ items: AdminFeedback[]; counts: Record<FeedbackStatus, number> }>(
      `/admin/feedback${status ? `?status=${status}` : ""}`,
    ),
  setFeedbackStatus: (id: string, status: FeedbackStatus) =>
    api<AdminFeedback>(`/admin/feedback/${id}`, { method: "PATCH", body: { status } }),
  sendFeedback: (body: {
    kind: FeedbackKind;
    message: string;
    page?: string;
    game_slug?: string;
  }) => api<void>("/me/feedback", { method: "POST", body }),
};

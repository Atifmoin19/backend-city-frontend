import { api } from "./client";
import type { Progress, TopicProgress } from "./types";

export const TRACK = "python-backend";

export const progressApi = {
  get: () => api<Progress>(`/me/progress?track=${TRACK}`),
  completeLesson: (topic: string) =>
    api<TopicProgress>(`/me/progress/lessons/${encodeURIComponent(topic)}`, { method: "POST" }),
  importLocal: (body: { onboarded: boolean; lessons_done: string[] }) =>
    api<Progress>("/me/progress/import", { method: "POST", body }),
  markOnboarded: () => api<void>("/me/onboarded", { method: "POST" }),
};

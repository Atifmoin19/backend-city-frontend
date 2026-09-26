import { api } from "./client";

export interface Badge {
  key: string;
  title: string;
  description: string;
  earned_at: string | null;
}

export interface Stats {
  xp: number;
  level: { level: number; xp_into: number; xp_needed: number };
  streak: { current: number; best: number; active_today: boolean };
  badges: Badge[];
}

export const statsApi = {
  get: (tz: string) => api<Stats>(`/me/stats?tz=${encodeURIComponent(tz)}`),
};

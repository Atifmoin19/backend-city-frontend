import { api } from "./client";
import type { GameMode, GameVariant, GradeResponse, Hint, TopicProgress } from "./types";

const game = (slug: string) => `/games/${encodeURIComponent(slug)}`;

export const gamesApi = {
  variant: (slug: string, mode: GameMode, seed?: number) =>
    api<GameVariant>(`${game(slug)}/variant?mode=${mode}${seed ? `&seed=${seed}` : ""}`),
  hint: (slug: string, attemptToken: string, tier: number) =>
    api<Hint>(`${game(slug)}/hint`, {
      method: "POST",
      body: { attempt_token: attemptToken, tier },
    }),
  grade: (slug: string, attemptToken: string, snippet: string) =>
    api<GradeResponse>(`${game(slug)}/grade`, {
      method: "POST",
      body: { attempt_token: attemptToken, snippet },
    }),
  practice: (slug: string, attemptToken: string, passed: boolean, score: number) =>
    api<TopicProgress>(`${game(slug)}/practice`, {
      method: "POST",
      body: { attempt_token: attemptToken, passed, score },
    }),
};

import { api } from "./client";
import type { GameVariant, GradeResponse, Hint } from "./types";

export const gamesApi = {
  variant: (slug: string, seed?: number) =>
    api<GameVariant>(`/games/${encodeURIComponent(slug)}/variant${seed ? `?seed=${seed}` : ""}`),
  hint: (slug: string, attemptToken: string, tier: number) =>
    api<Hint>(`/games/${encodeURIComponent(slug)}/hint`, {
      method: "POST",
      body: { attempt_token: attemptToken, tier },
    }),
  grade: (slug: string, attemptToken: string, snippet: string) =>
    api<GradeResponse>(`/games/${encodeURIComponent(slug)}/grade`, {
      method: "POST",
      body: { attempt_token: attemptToken, snippet },
    }),
};

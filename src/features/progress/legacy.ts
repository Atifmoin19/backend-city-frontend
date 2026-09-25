/**
 * Progress kept in this browser before the progress API existed (zustand key "bc-learning").
 * Read once per user, sent to POST /me/progress/import, then removed. Checkpoint results
 * are left behind on purpose: they only count when graded on the server.
 */
const KEY = "bc-learning";

interface LegacyState {
  byUser?: Record<string, Record<string, { lessonDone?: boolean }>>;
  onboarded?: Record<string, boolean>;
}

function read(): LegacyState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? ((JSON.parse(raw) as { state?: LegacyState }).state ?? null) : null;
  } catch {
    return null;
  }
}

export function legacyFor(userId: string): { onboarded: boolean; lessons_done: string[] } | null {
  const state = read();
  if (!state) return null;
  const topics = state.byUser?.[userId] ?? {};
  const lessons = Object.entries(topics)
    .filter(([, r]) => r.lessonDone)
    .map(([slug]) => slug);
  const onboarded = !!state.onboarded?.[userId];
  return lessons.length || onboarded ? { onboarded, lessons_done: lessons } : null;
}

export function clearLegacy(userId: string) {
  const state = read();
  if (!state) return;
  delete state.byUser?.[userId];
  delete state.onboarded?.[userId];
  try {
    const empty =
      !Object.keys(state.byUser ?? {}).length && !Object.keys(state.onboarded ?? {}).length;
    if (empty) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify({ state, version: 0 }));
  } catch {
    // storage blocked: nothing to clean
  }
}

/** Orientation done, on the server or (not yet imported) in this browser. */
export function hasOnboarded(user: { id: string; onboarded: boolean }): boolean {
  return user.onboarded || !!legacyFor(user.id)?.onboarded;
}

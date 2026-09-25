import { DISTRICTS, type DistrictKey } from "@/content/districts";

export type DistrictState = "done" | "active" | "locked";

/**
 * DEMO progress until GET /me/progress exists. Shown with a "Demo progress" label in the UI;
 * never present it as the learner's real record.
 */
export const DEMO_PROGRESS: Record<DistrictKey, DistrictState> = {
  academy: "done",
  "signal-tower": "done",
  "router-station": "done",
  gatehouse: "active",
  "data-vaults": "locked",
  citadel: "locked",
  speedway: "locked",
  factory: "locked",
  "control-room": "locked",
  skyline: "locked",
};

/** Playable game per district (only the Gatehouse has one so far). */
export const DISTRICT_GAME: Partial<Record<DistrictKey, string>> = {
  gatehouse: "signup-gate",
};

export const activeDistrict = (progress: Record<DistrictKey, DistrictState>) =>
  DISTRICTS.find((d) => progress[d.key] === "active") ?? DISTRICTS[0]!;

type Dir = "up" | "down" | "left" | "right";

/**
 * Arrow-key / WASD walking. Left/right follow the road (previous/next level) so the path is
 * predictable; up/down jump to the nearest district in that screen direction.
 */
export function neighbor(fromKey: DistrictKey, dir: Dir): DistrictKey {
  const index = DISTRICTS.findIndex((d) => d.key === fromKey);
  if (dir === "left" || dir === "right") {
    const next = DISTRICTS[index + (dir === "right" ? 1 : -1)];
    return next?.key ?? fromKey;
  }
  const from = DISTRICTS[index]!;
  let best: { key: DistrictKey; score: number } | null = null;
  for (const d of DISTRICTS) {
    if (d.key === fromKey) continue;
    const dx = d.map.x - from.map.x;
    const dy = d.map.y - from.map.y;
    const along = dir === "down" ? dy : -dy;
    if (along <= 0) continue;
    const across = Math.abs(dx);
    const score = along + across * 2; // prefer straight ahead
    if (!best || score < best.score) best = { key: d.key, score };
  }
  return best?.key ?? fromKey;
}

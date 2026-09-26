import { DISTRICTS, type DistrictKey } from "@/content/districts";
import { OPEN_DISTRICTS, topicsFor } from "@/content/topics";
import { topicComplete } from "@/features/progress/stats";
import type { TopicRecord } from "@/features/progress/records";

export type DistrictState = "done" | "active" | "locked";

/** Real state from the learner's records: open districts are active until their checkpoints pass. */
export function progressFrom(
  records: Record<string, TopicRecord>,
): Record<DistrictKey, DistrictState> {
  const out = {} as Record<DistrictKey, DistrictState>;
  for (const d of DISTRICTS) {
    if (!OPEN_DISTRICTS.has(d.key)) {
      out[d.key] = "locked";
      continue;
    }
    const topics = topicsFor(d.key);
    out[d.key] = topics.every((t) => topicComplete(t, records[t.slug])) ? "done" : "active";
  }
  return out;
}

/**
 * How much of each open district is restored (0-1): its briefings, practice games and
 * checkpoints done out of all of them. The map lights that share of the district's windows.
 */
export function restorationFrom(
  records: Record<string, TopicRecord>,
): Partial<Record<DistrictKey, number>> {
  const out: Partial<Record<DistrictKey, number>> = {};
  for (const d of DISTRICTS) {
    if (!OPEN_DISTRICTS.has(d.key)) continue;
    let done = 0;
    let total = 0;
    for (const t of topicsFor(d.key)) {
      const r = records[t.slug];
      total += 1 + t.practice.length + (t.checkpoint ? 1 : 0);
      done +=
        (r?.lessonDone ? 1 : 0) + t.practice.filter((g) => r?.practiceDone.includes(g.slug)).length;
      if (t.checkpoint && r?.checkpoint) done += 1;
    }
    out[d.key] = total ? done / total : 0;
  }
  return out;
}

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

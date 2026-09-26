import { pickGate, pickRoutes } from "./pick-the-line";
import { statusSpeedRound } from "./status-speed-round";
import type { Quiz } from "./types";

/** Local calendar day, e.g. "2026-09-26": the daily challenge changes at the learner's midnight. */
export function dayKey(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Stable number for a day (FNV-1a), so everyone gets the same five questions that day. */
export function daySeed(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Five questions from every drill (status codes, routes, the gate), explained after each. */
export const dailyChallenge: Quiz = {
  slug: "daily",
  title: "Daily challenge",
  kind: "pick",
  blurb: "Five questions from across the city, new every day. Finish it to keep your streak.",
  draw: 5,
  items: [...statusSpeedRound.items, ...pickRoutes.items, ...pickGate.items],
};

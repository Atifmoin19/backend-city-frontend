"use client";

import { Award, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Badge, Stats } from "@/lib/api/stats";
import { playSound } from "@/lib/sound/engine";

import { BADGE_ICON } from "./badgeIcons";
import { STATS_KEY } from "./useStats";

const seenKey = (userId: string) => `bc-badges-seen:${userId}`;

function readSeen(userId: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(seenKey(userId));
    return raw ? new Set(JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function writeSeen(userId: string, keys: string[]) {
  try {
    localStorage.setItem(seenKey(userId), JSON.stringify(keys));
  } catch {
    // storage blocked: the toast may show again next visit, which is harmless
  }
}

/**
 * Announces badges earned since this browser last looked. The first visit only records what's
 * already earned (no flood of old badges).
 */
export function BadgeToaster() {
  const qc = useQueryClient();
  const [queue, setQueue] = useState<Badge[]>([]);

  // react to each successful stats fetch (not to renders), then compare with what was seen
  useEffect(
    () =>
      qc.getQueryCache().subscribe((event) => {
        const q = event.query;
        if (event.type !== "updated" || event.action.type !== "success") return;
        if (q.queryKey[0] !== STATS_KEY[0]) return;
        const userId = String(q.queryKey[1]);
        const stats = q.state.data as Stats | undefined;
        if (!stats || userId === "guest") return;
        const earned = stats.badges.filter((b) => b.earned_at);
        const seen = readSeen(userId);
        writeSeen(
          userId,
          earned.map((b) => b.key),
        );
        const fresh = seen ? earned.filter((b) => !seen.has(b.key)) : [];
        if (fresh.length) {
          setQueue((prev) => [...prev, ...fresh]);
          playSound("win");
        }
      }),
    [qc],
  );

  const current = queue[0];
  useEffect(() => {
    if (!current) return;
    const id = window.setTimeout(() => setQueue((q) => q.slice(1)), 6000);
    return () => window.clearTimeout(id);
  }, [current]);

  const Icon = current ? (BADGE_ICON[current.key] ?? Award) : Award;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {current ? (
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-line-strong bg-bg-2 p-4 shadow-panel"
            role="status"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-amber/50 bg-amber/10">
              <Icon aria-hidden className="size-5 text-amber" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-amber">Badge earned</p>
              <p className="font-semibold text-text-1">{current.title}</p>
              <p className="text-sm text-text-2">{current.description}</p>
              <Link href="/badges" className="mt-1 inline-block text-sm text-cyan hover:underline">
                See all badges
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setQueue((q) => q.slice(1))}
              className="rounded-sm p-1 text-text-3 hover:text-text-1"
              aria-label="Dismiss"
            >
              <X aria-hidden className="size-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

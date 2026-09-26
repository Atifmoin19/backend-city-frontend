"use client";

import { ArrowRight, CalendarDays, Check } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { dailyChallenge, dayKey } from "@/content/quizzes";

import { useQuizResults } from "./useQuizResults";

/** Map sidebar: today's challenge, or a tick once it's done. */
export function DailyCard() {
  const { best } = useQuizResults();
  const mine = best(dailyChallenge.slug);
  const done = !!mine && dayKey(new Date(mine.last_played_at)) === dayKey();
  return (
    <Panel surface="glass" className="flex w-full items-center justify-between gap-3 p-4">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-cyan uppercase">
          <CalendarDays aria-hidden className="size-4" /> Daily challenge
        </p>
        <p className="mt-1 text-sm text-text-2">
          {done ? (
            <span className="inline-flex items-center gap-1.5 text-green">
              <Check aria-hidden className="size-4" /> Done today
            </span>
          ) : (
            "5 questions · +20 XP"
          )}
        </p>
      </div>
      <Link
        href="/daily"
        className={buttonClasses({ variant: done ? "ghost" : "primary", size: "sm" })}
      >
        {done ? "Replay" : "Play"} <ArrowRight aria-hidden className="size-4" />
      </Link>
    </Panel>
  );
}

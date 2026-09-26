"use client";

import { CalendarDays, Check } from "lucide-react";
import { useCallback, useMemo } from "react";

import { Panel } from "@/components/ui/Panel";
import { dailyChallenge, dayKey, daySeed } from "@/content/quizzes";

import { QuizRunner, type RoundResult } from "./QuizRunner";
import { useQuizResults } from "./useQuizResults";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Today's five questions: same set for everyone, XP and streak once a day. */
export function DailyScreen() {
  const today = useMemo(() => dayKey(), []);
  const { signedIn, best, record } = useQuizResults();
  const mine = best(dailyChallenge.slug);
  const doneToday = !!mine && dayKey(new Date(mine.last_played_at)) === today;
  const { mutate } = record;
  const save = useCallback(
    (r: RoundResult) => {
      if (signedIn)
        mutate({
          quiz: dailyChallenge.slug,
          score: r.score,
          total: r.total,
          best_combo: r.bestCombo,
          seconds: r.seconds,
        });
    },
    [mutate, signedIn],
  );
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-12">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm text-text-3">
          <CalendarDays aria-hidden className="size-4 text-cyan" /> {dateFmt.format(new Date())}
        </p>
        <div className="mt-6">
          <QuizRunner key={today} quiz={dailyChallenge} seed={daySeed(today)} onFinish={save} />
        </div>
      </div>
      <aside>
        <Panel className="p-5 text-sm text-text-2">
          {doneToday ? (
            <p className="flex items-center gap-2 font-semibold text-green">
              <Check aria-hidden className="size-4" /> Done for today
            </p>
          ) : (
            <p className="font-semibold text-text-1">Not played yet today</p>
          )}
          <p className="mt-2">
            The first round each day earns 20 bonus XP plus 2 per right answer, and counts for your
            streak. New questions at midnight.
          </p>
        </Panel>
      </aside>
    </div>
  );
}

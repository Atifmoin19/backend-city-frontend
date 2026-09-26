"use client";

import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";

import { Panel } from "@/components/ui/Panel";
import { DISTRICTS } from "@/content/districts";
import { quizBySlug } from "@/content/quizzes";

import { QuizRunner, type RoundResult } from "./QuizRunner";
import { useQuizResults } from "./useQuizResults";

/** A revision quiz page: the round in the main column, the learner's best in the rail. */
export function QuizScreen({ slug }: { slug: string }) {
  const quiz = quizBySlug(slug)!;
  const district = DISTRICTS.find((d) => d.key === quiz.district)!;
  const { signedIn, best, record } = useQuizResults();
  const mine = best(slug);
  const { mutate } = record;
  const save = useCallback(
    (r: RoundResult) => {
      if (!signedIn) return;
      mutate({
        quiz: slug,
        score: r.score,
        total: r.total,
        best_combo: r.bestCombo,
        seconds: r.seconds,
      });
    },
    [mutate, signedIn, slug],
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-12">
      <div className="min-w-0">
        <Link
          href={`/district/${district.key}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-3 hover:text-text-1"
        >
          <ArrowLeft aria-hidden className="size-4" /> {district.name}
        </Link>
        <div className="mt-6">
          <QuizRunner quiz={quiz} onFinish={save} />
        </div>
      </div>
      <aside className="flex flex-col gap-4">
        <Panel className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-text-1">
            <Trophy aria-hidden className="size-4 text-amber" /> Your best
          </p>
          {mine ? (
            <p className="mt-2 text-sm text-text-2">
              <span className="tabular text-text-1">
                {mine.best_score}/{mine.total}
              </span>
              {quiz.kind === "speed" ? ` · combo ×${mine.best_combo}` : ""} · {mine.plays}{" "}
              {mine.plays === 1 ? "round" : "rounds"}
            </p>
          ) : (
            <p className="mt-2 text-sm text-text-2">No rounds yet.</p>
          )}
        </Panel>
        <Panel className="p-5 text-sm text-text-2">
          <p className="font-semibold text-text-1">Extra practice</p>
          <p className="mt-2">
            Each round draws new questions in a new order. It never locks or unlocks anything:
            checkpoints still clear districts.
          </p>
        </Panel>
      </aside>
    </div>
  );
}

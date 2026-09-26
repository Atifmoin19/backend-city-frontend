"use client";

import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import type { DistrictKey } from "@/content/districts";
import { quizzesFor } from "@/content/quizzes";

import { useQuizResults } from "./useQuizResults";

/** Optional quizzes for a district (Speed Round, Pick the Line), with the learner's best. */
export function ExtraPractice({ district }: { district: DistrictKey }) {
  const quizzes = quizzesFor(district);
  const { best } = useQuizResults();
  if (!quizzes.length) return null;
  return (
    <section aria-labelledby="extra-practice">
      <h2 id="extra-practice" className="font-display text-xl font-semibold tracking-tight">
        Extra practice
      </h2>
      <p className="mt-1 text-sm text-text-3">
        Quick rounds for revision. Optional, phone-friendly.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {quizzes.map((q) => {
          const mine = best(q.slug);
          return (
            <li key={q.slug} className="flex flex-col rounded-lg border border-line bg-bg-1 p-5">
              <p className="flex items-center gap-2 font-semibold text-text-1">
                <Zap aria-hidden className="size-4 text-cyan" /> {q.title}
              </p>
              <p className="mt-2 flex-1 text-sm text-text-2">{q.blurb}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-text-3">
                  {mine ? `Best ${mine.best_score}/${mine.total}` : "Not played yet"}
                </span>
                <Link
                  href={`/quiz/${q.slug}`}
                  className={buttonClasses({ variant: "ghost", size: "sm" })}
                >
                  {mine ? "Play again" : "Play"} <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

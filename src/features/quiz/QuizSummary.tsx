"use client";

import { Check, RotateCcw, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import type { Quiz, QuizItem } from "@/content/quizzes";
import { InlineCode } from "@/features/game/InlineCode";

import type { RoundResult } from "./QuizRunner";

/** End of a round: the score, best combo, and every question with the right answer. */
export function QuizSummary({
  quiz,
  items,
  result,
  extra,
  againLabel = "New round",
  onAgain,
}: {
  quiz: Quiz;
  items: QuizItem[];
  result: RoundResult;
  extra?: ReactNode;
  againLabel?: string;
  onAgain: () => void;
}) {
  const pct = Math.round((100 * result.score) / result.total);
  const answered = result.answers.length;
  return (
    <div>
      <p className="font-mono text-xs text-cyan">{quiz.title}</p>
      <SignHeading as="h1" className="mt-2 text-[clamp(1.9rem,4vw,3rem)]">
        {result.score} of {result.total} right
      </SignHeading>
      <dl className="mt-5 flex flex-wrap gap-3 text-sm">
        <Stat label="Score" value={`${pct}%`} />
        {quiz.kind === "speed" ? <Stat label="Best combo" value={`×${result.bestCombo}`} /> : null}
        <Stat label="Time" value={`${result.seconds}s`} />
        {answered < result.total ? (
          <Stat label="Unanswered" value={String(result.total - answered)} />
        ) : null}
      </dl>
      {extra}
      <Button
        className="mt-6"
        variant="ghost"
        onClick={onAgain}
        icon={<RotateCcw aria-hidden className="size-4" />}
      >
        {againLabel}
      </Button>
      <h2 className="mt-10 font-display text-lg font-semibold text-text-1">Answers</h2>
      <ol className="mt-3 flex flex-col gap-3">
        {items.map((item, i) => {
          const a = result.answers[i];
          const right = !!a?.correct;
          return (
            <li key={item.prompt} className="rounded-lg border border-line bg-bg-1 p-4 text-sm">
              <p className="flex items-start gap-2 text-text-1">
                {right ? (
                  <Check aria-label="Right" className="mt-0.5 size-4 shrink-0 text-green" />
                ) : (
                  <X aria-label="Missed" className="mt-0.5 size-4 shrink-0 text-amber" />
                )}
                <span>
                  <InlineCode text={item.prompt} />
                </span>
              </p>
              <p className="mt-2 pl-6 text-text-2">
                <span className="text-text-3">Answer: </span>
                <span className="font-mono text-text-1">{item.options[item.correct]?.text}</span>
                {!right && a?.picked != null ? (
                  <>
                    <span className="text-text-3"> · yours: </span>
                    <span className="font-mono">{item.options[a.picked]?.text}</span>
                  </>
                ) : null}
                {!a ? <span className="text-text-3"> · not reached</span> : null}
              </p>
              <p className="mt-1 pl-6 text-text-3">{item.explain}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-bg-2 px-3 py-2">
      <dt className="text-xs text-text-3">{label}</dt>
      <dd className="tabular font-semibold text-text-1">{value}</dd>
    </div>
  );
}

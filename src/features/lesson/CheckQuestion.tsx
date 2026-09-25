"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

import type { CheckQuestion as Question } from "@/content/lessons/types";
import { InlineCode } from "@/features/game/InlineCode";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sound/engine";

/** Low-stakes understanding check. Unlimited tries; the explanation shows once answered right. */
export function CheckQuestion({
  question,
  onSolved,
}: {
  question: Question;
  onSolved: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const solved = picked === question.correct;
  return (
    <fieldset className="rounded-lg border border-line bg-bg-2 p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold text-purple">Quick check</legend>
      <p className="text-text-1">
        <InlineCode text={question.prompt} />
      </p>
      <div className="mt-4 grid gap-2">
        {question.options.map((o, i) => {
          const isPicked = picked === i;
          const right = isPicked && i === question.correct;
          const wrong = isPicked && i !== question.correct;
          return (
            <button
              key={o.text}
              type="button"
              disabled={solved}
              data-sound="none"
              onClick={() => {
                setPicked(i);
                playSound(i === question.correct ? "correct" : "wrong");
                if (i === question.correct) onSolved();
              }}
              aria-pressed={isPicked}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors",
                right && "border-green/60 bg-green/[0.08] text-text-1",
                wrong && "border-amber/60 bg-amber/[0.08] text-text-1",
                !isPicked &&
                  "border-line-strong bg-bg-1 text-text-1 hover:border-cyan/60 disabled:opacity-60",
              )}
            >
              <span className="grid size-5 shrink-0 place-items-center">
                {right ? (
                  <Check aria-hidden className="size-4 text-green" />
                ) : wrong ? (
                  <X aria-hidden className="size-4 text-amber" />
                ) : (
                  <span className="size-2 rounded-full bg-line-strong" />
                )}
              </span>
              <span className={o.code ? "font-mono text-[0.85rem]" : undefined}>{o.text}</span>
              {right ? (
                <span className="sr-only">Correct</span>
              ) : wrong ? (
                <span className="sr-only">Not quite</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {solved ? (
          <p className="mt-4 text-sm text-green">{question.explain}</p>
        ) : picked !== null ? (
          <p className="mt-4 text-sm text-amber">
            Not quite. Read the step again and try another answer.
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}

"use client";

import { Check, X } from "lucide-react";

import type { QuizItem } from "@/content/quizzes";
import { InlineCode } from "@/features/game/InlineCode";
import { CodeSample } from "@/features/lesson/CodeSample";
import { cn } from "@/lib/cn";

/**
 * One question. `revealed` shows right/wrong on the options (icon + text, never color alone);
 * placement never reveals. Options carry their number key (1-4).
 */
export function QuizQuestion({
  item,
  picked,
  revealed,
  onPick,
}: {
  item: QuizItem;
  picked: number | null;
  revealed: boolean;
  onPick: (i: number) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg leading-snug text-text-1 sm:text-xl">
        <InlineCode text={item.prompt} />
      </legend>
      {item.code ? (
        <div className="mt-4">
          <CodeSample {...item.code} />
        </div>
      ) : null}
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {item.options.map((o, i) => {
          const isPicked = picked === i;
          const right = revealed && i === item.correct;
          const wrong = revealed && isPicked && i !== item.correct;
          return (
            <button
              key={o.text}
              type="button"
              disabled={revealed || picked !== null}
              data-sound="none"
              onClick={() => onPick(i)}
              aria-keyshortcuts={String(i + 1)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-(--bc-dur-1)",
                right && "border-green/70 bg-green/[0.1] text-text-1",
                wrong && "border-amber/70 bg-amber/[0.1] text-text-1",
                !right && !wrong && isPicked && "border-cyan bg-bg-3 text-text-1",
                !right &&
                  !wrong &&
                  !isPicked &&
                  "border-line-strong bg-bg-1 text-text-1 enabled:hover:border-cyan/60 disabled:opacity-60",
              )}
            >
              <span
                aria-hidden
                className="grid size-6 shrink-0 place-items-center rounded-sm border border-line font-mono text-xs text-text-3"
              >
                {right ? (
                  <Check className="size-4 text-green" />
                ) : wrong ? (
                  <X className="size-4 text-amber" />
                ) : (
                  i + 1
                )}
              </span>
              <span className={o.code ? "font-mono text-[0.86rem] break-all" : undefined}>
                {o.text}
              </span>
              {right ? <span className="sr-only">(right answer)</span> : null}
              {wrong ? <span className="sr-only">(your answer, not right)</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

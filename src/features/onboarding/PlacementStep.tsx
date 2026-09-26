"use client";

import { ArrowRight, Compass } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import { districtByKey } from "@/content/districts";
import { placement, placementStart } from "@/content/quizzes";
import { QuizRunner, type RoundResult } from "@/features/quiz/QuizRunner";
import { bySkill, buildRound } from "@/features/quiz/round";
import { useQuizResults } from "@/features/quiz/useQuizResults";

/**
 * Onboarding step 2 (optional): eight questions that suggest a starting district. Only a
 * suggestion: "Next up" starts there, every district stays open (ideology 3).
 */
export function PlacementStep({ onDone }: { onDone: () => void }) {
  const [taking, setTaking] = useState(false);
  const { record, placement: savePlacement } = useQuizResults();
  const { mutate: saveRound } = record;
  const { mutate: saveStart } = savePlacement;

  // placement keeps its item order, so skills can be read straight off the answers
  const items = buildRound(placement, 0);
  const startFor = useCallback(
    (r: RoundResult) => placementStart(bySkill(items, r.answers)),
    [items],
  );
  const save = useCallback(
    (r: RoundResult) => {
      saveRound({
        quiz: placement.slug,
        score: r.score,
        total: r.total,
        best_combo: r.bestCombo,
        seconds: r.seconds,
      });
      saveStart(startFor(r));
    },
    [saveRound, saveStart, startFor],
  );

  if (taking) {
    return (
      <QuizRunner
        quiz={placement}
        onFinish={save}
        summaryExtra={(r) => {
          const d = districtByKey(startFor(r));
          return (
            <div className="mt-6 max-w-xl rounded-xl border border-cyan/50 bg-bg-2 p-5 shadow-glow-cyan">
              <p className="flex items-center gap-2 text-sm font-semibold text-cyan">
                <Compass aria-hidden className="size-4" /> Suggested start
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-text-1">{d?.name}</p>
              <p className="mt-1 text-sm text-text-2">
                {d?.teaches}. Every district stays open; &ldquo;Next up&rdquo; will start here.
              </p>
              <Button className="mt-4" onClick={onDone}>
                Continue orientation <ArrowRight aria-hidden className="size-4" />
              </Button>
            </div>
          );
        }}
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-text-3">Optional</p>
      <SignHeading as="h1" className="mt-4 max-w-xl text-[clamp(1.9rem,3.6vw,3rem)]">
        Know some Python or HTTP already?
      </SignHeading>
      <div className="mt-6 flex max-w-xl flex-col gap-4 text-lg leading-relaxed text-text-2">
        <p>
          Take a two-minute check and we&apos;ll suggest where to start. New to both? Start from the
          Academy; it&apos;s built for you.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <Button variant="quiet" onClick={onDone}>
          Start from the beginning
        </Button>
        <Button size="lg" onClick={() => setTaking(true)}>
          Take the check <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
    </div>
  );
}

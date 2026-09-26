"use client";

import { ArrowRight, Flame, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { SignHeading } from "@/components/ui/SignHeading";
import type { Quiz } from "@/content/quizzes";
import { playSound } from "@/lib/sound/engine";

import { QuizQuestion } from "./QuizQuestion";
import { QuizSummary } from "./QuizSummary";
import { buildRound, tally, type Answer } from "./round";

export interface RoundResult {
  score: number;
  total: number;
  bestCombo: number;
  seconds: number;
  answers: Answer[];
}

/** Speed rounds move on by themselves after a short look at the answer. */
const SPEED_REVEAL_MS = 650;

/**
 * Plays one quiz: intro → questions → summary. Keys: 1-4 answer, Enter starts / continues.
 * Speed rounds run one clock for the whole round; pick rounds explain each answer; placement
 * shows nothing until the end. `onFinish` gets the round (saving is the caller's job).
 */
export function QuizRunner({
  quiz,
  seed: fixedSeed,
  onFinish,
  summaryExtra,
}: {
  quiz: Quiz;
  /** Same questions for everyone (the daily challenge); otherwise a new draw each round. */
  seed?: number;
  onFinish?: (r: RoundResult) => void;
  /** Rendered under the summary (e.g. the placement suggestion). */
  summaryExtra?: (r: RoundResult) => React.ReactNode;
}) {
  const [seed, setSeed] = useState(() => fixedSeed ?? Date.now());
  const items = useMemo(() => buildRound(quiz, seed), [quiz, seed]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const finished = useRef(false);

  const speed = quiz.kind === "speed";
  const reveals = quiz.kind !== "placement";
  const item = items[index];
  const limit = (quiz.seconds ?? 0) * 1000;
  const left = speed && phase === "play" ? Math.max(0, limit - (now - startedAt)) : limit;
  const { score, combo } = tally(answers);

  const finish = useCallback(
    (all: Answer[]) => {
      if (finished.current) return;
      finished.current = true;
      const t = tally(all);
      const r: RoundResult = {
        score: t.score,
        total: items.length,
        bestCombo: t.bestCombo,
        seconds: Math.round((Date.now() - startedAt) / 1000),
        answers: all,
      };
      setResult(r);
      setPhase("done");
      playSound(100 * (t.score / items.length) >= 70 ? "win" : "lose");
      onFinish?.(r);
    },
    [items.length, onFinish, startedAt],
  );

  const start = () => {
    finished.current = false;
    setAnswers([]);
    setIndex(0);
    setPicked(null);
    setResult(null);
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase("play");
  };

  const next = useCallback(
    (all: Answer[]) => {
      setPicked(null);
      if (index + 1 >= items.length) finish(all);
      else setIndex(index + 1);
    },
    [finish, index, items.length],
  );

  const pick = useCallback(
    (i: number) => {
      if (phase !== "play" || !item || picked !== null) return;
      const answer = { picked: i, correct: i === item.correct };
      const all = [...answers, answer];
      setPicked(i);
      setAnswers(all);
      if (reveals) playSound(answer.correct ? "correct" : "wrong");
      // placement moves straight on; speed after a glance; pick waits for "Next"
      if (!reveals) next(all);
      else if (speed) window.setTimeout(() => next(all), SPEED_REVEAL_MS);
    },
    [answers, item, next, phase, picked, reveals, speed],
  );

  // the round clock (speed only)
  useEffect(() => {
    if (!speed || phase !== "play") return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [speed, phase]);
  useEffect(() => {
    if (speed && phase === "play" && left <= 0) finish(answers);
  }, [answers, finish, left, phase, speed]);

  // keys: 1-4 answer, Enter starts / continues
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (phase === "play" && n >= 1 && n <= (item?.options.length ?? 0)) {
        e.preventDefault();
        pick(n - 1);
      } else if (e.key === "Enter" && phase === "intro") {
        e.preventDefault();
        start();
      } else if (e.key === "Enter" && phase === "play" && picked !== null && !speed && reveals) {
        e.preventDefault();
        next(answers);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "intro") {
    return (
      <div>
        <p className="font-mono text-xs text-cyan">
          {quiz.kind === "speed"
            ? "Speed round"
            : quiz.kind === "pick"
              ? "Pick the line"
              : "Placement"}
        </p>
        <SignHeading as="h1" className="mt-2 text-[clamp(1.9rem,4vw,3rem)]">
          {quiz.title}
        </SignHeading>
        <p className="mt-4 max-w-xl text-lg text-text-2">{quiz.blurb}</p>
        <ul className="mt-6 flex flex-col gap-2 text-sm text-text-2">
          <li>
            {items.length} questions
            {speed ? `, ${quiz.seconds} seconds on the clock` : ", no clock"}.
          </li>
          <li className="hidden sm:block">
            Answer with <Kbd>1</Kbd>–<Kbd>4</Kbd>
            {reveals && !speed ? (
              <>
                , continue with <Kbd>Enter</Kbd>
              </>
            ) : null}
            .
          </li>
          {quiz.kind === "placement" ? (
            <li>No answers are shown until the end. Guessing is fine.</li>
          ) : (
            <li>Practice only: it never locks anything.</li>
          )}
        </ul>
        <Button size="lg" className="mt-8" onClick={start}>
          Start <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <QuizSummary
        quiz={quiz}
        items={items}
        result={result}
        extra={summaryExtra?.(result)}
        againLabel={fixedSeed === undefined ? "New round" : "Play again"}
        onAgain={() => {
          if (fixedSeed === undefined) setSeed(Date.now());
          setPhase("intro");
        }}
      />
    );
  }

  if (!item) return null;
  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-2"
        aria-live="off"
      >
        <span>
          Question <span className="tabular text-text-1">{index + 1}</span> of {items.length}
        </span>
        {reveals ? (
          <span>
            <span className="tabular text-text-1">{score}</span> right
          </span>
        ) : null}
        {speed ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Flame aria-hidden className="size-4 text-amber" />
              Combo <span className="tabular text-text-1">×{combo}</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 font-mono">
              <Timer aria-hidden className="size-4 text-cyan" />
              <span className="tabular text-text-1">{Math.ceil(left / 1000)}s</span>
            </span>
          </>
        ) : null}
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={speed ? "Time left" : "Progress"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(speed ? (100 * left) / limit : (100 * index) / items.length)}
      >
        <div
          className="h-full rounded-full bg-cyan transition-[width] duration-200 ease-linear"
          style={{ width: `${speed ? (100 * left) / limit : (100 * index) / items.length}%` }}
        />
      </div>
      <div className="mt-7">
        <QuizQuestion
          key={`${seed}-${index}`}
          item={item}
          picked={picked}
          revealed={reveals && picked !== null}
          onPick={pick}
        />
      </div>
      {reveals && !speed && picked !== null ? (
        <div className="mt-5" aria-live="polite">
          <p className={picked === item.correct ? "text-green" : "text-amber"}>
            {picked === item.correct ? "Right. " : "Not this one. "}
            <span className="text-text-2">{item.explain}</span>
          </p>
          <Button className="mt-4" onClick={() => next(answers)}>
            {index + 1 >= items.length ? "See results" : "Next"}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

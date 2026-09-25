"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Character } from "@/components/characters";
import { Button, buttonClasses } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import type { GradeResponse } from "@/lib/api/types";

import { ScoreMeter } from "./ScoreMeter";
import { playSound } from "@/lib/sound/engine";

const VERDICT_TEXT: Record<Exclude<GradeResponse["verdict"], "graded">, string> = {
  rejected: "The gate refused to run this code.",
  load_error: "Your server crashed while starting up.",
  timeout: "Your code took too long and was stopped.",
  crashed: "The grading sandbox crashed. Try again.",
};

interface ResultOverlayProps {
  result: GradeResponse;
  character: string;
  backHref: string;
  lessonHref?: string;
  /** Checkpoint fails in a row (from the saved record); after 2 we suggest a recap. */
  fails: number;
  onRetry: () => void;
  onClose: () => void;
}

/** Checkpoint result. Dramatic, never humiliating (ideology 9.2). */
export function ResultOverlay({
  result,
  character,
  backHref,
  lessonHref,
  fails,
  onRetry,
  onClose,
}: ResultOverlayProps) {
  const retryAt = result.retry_at ? new Date(result.retry_at) : null;
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    playSound(result.passed ? "win" : "lose");
  }, [result.passed]);
  useEffect(() => {
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg-0/80 p-4 backdrop-blur-sm">
      <motion.div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-lg rounded-lg border bg-bg-2 p-6 shadow-panel outline-none sm:p-8 ${result.passed ? "border-green/50 shadow-glow-green" : "border-line-strong"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {result.passed ? (
              <StatusLight status="pass">Checkpoint passed</StatusLight>
            ) : (
              <StatusLight status="bounce">Not yet</StatusLight>
            )}
            <SignHeading as="h2" id="result-title" className="mt-3 text-2xl sm:text-3xl">
              {result.passed ? "Checkpoint cleared." : "Some requests went the wrong way."}
            </SignHeading>
          </div>
          <Character name={character} state={result.passed ? "celebrating" : "sad"} size={72} />
        </div>

        {result.verdict === "graded" ? (
          <>
            <div className="mt-6">
              <ScoreMeter
                score={result.score}
                threshold={result.pass_threshold}
                stars={result.stars}
                label="Checkpoint score"
              />
            </div>
            <p className="mt-4 text-sm text-text-2">
              Public requests: {result.public_results.filter((r) => r.passed).length}/
              {result.public_results.length} · Hidden requests: {result.hidden_passed}/
              {result.hidden_total}
            </p>
            {result.hint_penalty > 0 ? (
              <p className="mt-1 text-sm text-text-3">
                {result.raw_score}% correct, minus {result.hint_penalty} for {result.hints_used}{" "}
                {result.hints_used === 1 ? "hint" : "hints"}.
              </p>
            ) : null}
            {!result.passed ? (
              <p className="mt-3 text-sm text-text-2">
                Hidden requests probe the edges: exact limits, one past them, missing pieces, and
                cases the public requests don&apos;t show. Check every rule in the brief.
              </p>
            ) : null}
            {!result.passed && fails >= 2 && lessonHref ? (
              <p className="mt-3 rounded-md border border-purple/40 bg-(--bc-byte-bubble) px-3 py-2 text-sm text-text-1">
                Two tries in a row. A quick look at the briefing usually unlocks it.{" "}
                <Link href={lessonHref} className="text-cyan underline">
                  Review the briefing
                </Link>
              </p>
            ) : null}
            {retryAt ? (
              <p className="mt-3 text-sm text-amber">
                Next attempt opens at{" "}
                {retryAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
              </p>
            ) : null}
          </>
        ) : (
          <div className="mt-6 space-y-2">
            <p className="text-text-1">{VERDICT_TEXT[result.verdict]}</p>
            {result.violations.map((v) => (
              <p key={`${v.line}-${v.message}`} className="font-mono text-sm text-amber">
                line {v.line}: {v.message}
              </p>
            ))}
            {result.error ? (
              <pre className="max-h-40 overflow-auto rounded-md bg-editor p-3 font-mono text-xs text-text-2">
                {result.error}
              </pre>
            ) : null}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {result.passed ? (
            <Link href={backHref} className={buttonClasses({ variant: "success" })}>
              Back to the district
            </Link>
          ) : null}
          <Button variant={result.passed ? "ghost" : "primary"} onClick={onRetry}>
            Play a new variant
          </Button>
          <Button variant="quiet" onClick={onClose}>
            Keep editing
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

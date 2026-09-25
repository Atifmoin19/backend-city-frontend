"use client";

import { ArrowUpRight, BookOpen, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import type { GameVariant } from "@/lib/api/types";
import { cn } from "@/lib/cn";

import { InlineCode } from "./InlineCode";
import type { GameMode } from "./useGamePlay";

interface MissionBriefProps {
  game: GameVariant;
  mode: GameMode;
  /** Every public request landed where it should. */
  cleared: boolean;
  lessonHref?: string;
  lessonDone: boolean;
}

/**
 * The mission brief: the brightest surface on the screen, lit from its top edge, so the task
 * reads first. Win condition, then the exact rules, then the one move to make.
 */
export function MissionBrief({ game, mode, cleared, lessonHref, lessonDone }: MissionBriefProps) {
  const rules = game.rules.length ? game.rules : [game.scenario.goal];
  const objective = game.objective || game.scenario.intro;
  return (
    <section
      aria-labelledby="mission-title"
      className="relative overflow-hidden rounded-lg shadow-brief [background:var(--bc-brief)]"
    >
      {/* Top strip: which variant, the story, and the mode stamp */}
      <div className="relative flex items-center gap-3 border-b border-brief-line py-2.5 pr-36 pl-5 text-xs text-text-2 [background:var(--bc-brief-strip)]">
        <span className="shrink-0 font-mono tracking-wide whitespace-nowrap text-text-3">
          Variant {String(game.seed % 10000).padStart(4, "0")}
        </span>
        <span aria-hidden className="h-3 w-px shrink-0 bg-brief-line" />
        <span className="truncate">{game.scenario.intro}</span>
        <Stamp mode={mode} cleared={cleared} />
      </div>

      <div className="px-5 pt-4 pb-4">
        <h2
          id="mission-title"
          className="font-display text-[1.15rem] leading-[1.22] font-bold tracking-[-0.015em] text-text-1 sm:text-[1.3rem]"
        >
          {objective}
        </h2>

        {mode === "checkpoint" ? (
          <p className="mt-2 text-sm text-amber">
            New variant: names and limits differ from practice. Hidden requests test every boundary.
          </p>
        ) : null}

        <ol className="mt-4 flex flex-col divide-y divide-brief-line border-y border-brief-line">
          {rules.map((rule, i) => (
            <li
              key={rule}
              className="flex items-baseline gap-3 py-2 text-[0.94rem] leading-relaxed text-text-1"
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-5 shrink-0 translate-y-0.5 place-items-center rounded-full border font-mono text-[0.68rem] font-semibold transition-colors duration-(--bc-dur-3)",
                  cleared
                    ? "border-green bg-green text-on-neon shadow-glow-green"
                    : "border-cyan/50 bg-cyan/10 text-cyan",
                )}
              >
                {cleared ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              <span>
                <InlineCode text={rule} tone="chip" />
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-2">
          <span>
            Edit the <span className="rounded-sm bg-cyan/15 px-1 text-cyan">highlighted lines</span>
            , then <strong className="font-semibold text-text-1">Run requests</strong>.
          </span>
          {lessonHref ? (
            <Link
              href={lessonHref}
              className={cn(
                "ml-auto inline-flex shrink-0 items-center gap-1 font-medium underline-offset-2 hover:underline",
                lessonDone ? "text-text-3 hover:text-text-1" : "text-amber underline",
              )}
            >
              <BookOpen aria-hidden className="size-3.5" />
              {lessonDone ? "Review the briefing" : "Read the briefing first"}
              <ArrowUpRight aria-hidden className="size-3" />
            </Link>
          ) : null}
        </p>
      </div>
    </section>
  );
}

/** Neon stamp naming the mode. Lands once with a thud; turns green when practice clears. */
function Stamp({ mode, cleared }: { mode: GameMode; cleared: boolean }) {
  const reduce = useReducedMotion();
  const label = cleared ? "Cleared" : mode === "checkpoint" ? "Checkpoint" : "Practice";
  return (
    <motion.span
      key={label}
      aria-label={`Mode: ${label}`}
      role="img"
      initial={reduce ? false : { opacity: 0, scale: 1.6, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: -4 }}
      transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.7 }}
      className={cn(
        "absolute top-1/2 right-4 -translate-y-1/2 rounded-[4px] border-2 px-2 py-px font-display text-[0.66rem] font-bold tracking-[0.14em] uppercase",
        cleared
          ? "border-green bg-green/10 text-green shadow-glow-green"
          : mode === "checkpoint"
            ? "border-amber bg-amber/10 text-amber shadow-glow-amber"
            : "border-cyan bg-cyan/10 text-cyan shadow-glow-cyan",
      )}
    >
      {label}
    </motion.span>
  );
}

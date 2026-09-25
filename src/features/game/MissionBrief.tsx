import { BookOpen, Crosshair, Pencil, Play, ShieldAlert, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { GameVariant } from "@/lib/api/types";

import { InlineCode } from "./InlineCode";
import type { GameMode } from "./useGamePlay";

interface MissionBriefProps {
  game: GameVariant;
  mode: GameMode;
  /** Link to the topic briefing; shown loud when the learner skipped it. */
  lessonHref?: string;
  lessonDone: boolean;
}

/** What to do, stated as a mission: the win condition, the exact rules, and the three moves. */
export function MissionBrief({ game, mode, lessonHref, lessonDone }: MissionBriefProps) {
  const rules = game.rules.length ? game.rules : [game.scenario.goal];
  const objective = game.objective || game.scenario.intro;
  const requests = game.public_tests.length;
  return (
    <section
      aria-labelledby="mission-title"
      className="relative overflow-hidden rounded-lg border border-cyan/30 bg-bg-2 shadow-panel"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-cyan shadow-glow-cyan" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-5 py-2.5">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-cyan uppercase">
          <Target aria-hidden className="size-3.5" />
          Your mission · {mode === "checkpoint" ? "Checkpoint" : "Practice"}
        </p>
        {lessonHref ? (
          <Link
            href={lessonHref}
            className={
              lessonDone
                ? "ml-auto inline-flex items-center gap-1.5 text-xs text-text-3 hover:text-text-1"
                : "ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-amber underline"
            }
          >
            <BookOpen aria-hidden className="size-3.5" />
            {lessonDone ? "Review the briefing" : "Read the briefing first"}
          </Link>
        ) : null}
      </div>

      <div className="px-5 pt-4 pb-4">
        <h2
          id="mission-title"
          className="font-display text-[1.05rem] leading-snug font-semibold tracking-tight text-text-1 sm:text-lg"
        >
          {objective}
        </h2>
        <p className="mt-1 text-sm text-text-3">{game.scenario.intro}</p>

        {mode === "checkpoint" ? (
          <p className="mt-3 flex items-start gap-2 rounded-md border border-amber/40 bg-amber/[0.07] px-3 py-2 text-sm text-amber">
            <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            New variant: names and limits differ from practice. Hidden requests test every boundary.
          </p>
        ) : null}

        <p className="mt-4 text-[0.7rem] font-semibold tracking-[0.14em] text-text-3 uppercase">
          Rules your server must enforce
        </p>
        <ol className="mt-2 flex flex-col gap-1.5">
          {rules.map((rule, i) => (
            <li key={rule} className="flex items-start gap-3 text-sm leading-relaxed text-text-1">
              <span
                aria-hidden
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm border border-cyan/40 bg-cyan/10 font-mono text-[0.7rem] font-semibold text-cyan"
              >
                {i + 1}
              </span>
              <span>
                <InlineCode text={rule} />
              </span>
            </li>
          ))}
        </ol>
      </div>

      <ol
        aria-label="How to win"
        className="grid grid-cols-1 border-t border-line bg-bg-1/60 text-xs text-text-2 sm:grid-cols-3"
      >
        <Move n={1} icon={<Pencil />}>
          Edit the <span className="text-cyan">highlighted lines</span>
        </Move>
        <Move n={2} icon={<Play />}>
          Press <span className="font-semibold text-text-1">Run requests</span>
        </Move>
        <Move n={3} icon={<Crosshair />}>
          All {requests} requests hit their <span className="text-green">expected</span> status
        </Move>
      </ol>
    </section>
  );
}

function Move({ n, icon, children }: { n: number; icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 px-5 py-2.5 sm:border-l sm:border-line sm:first:border-l-0">
      <span aria-hidden className="text-text-3 [&_svg]:size-3.5">
        {icon}
      </span>
      <span>
        <span className="sr-only">Step {n}: </span>
        {children}
      </span>
    </li>
  );
}

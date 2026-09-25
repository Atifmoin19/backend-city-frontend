"use client";

import { Clock, Construction, Zap } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";

import type { Chapter } from "./chapters";
import { GateSnippet } from "./GateSnippet";

const ease = [0.16, 1, 0.3, 1] as const;

/** Glass panel for one story chapter; reveals as it enters the viewport. */
export function ChapterPanel({ chapter }: { chapter: Chapter }) {
  return (
    // Phones: a compact card at the bottom so the city stays visible above it
    <div
      className={cn(
        "flex h-full items-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:px-10 sm:pb-0 lg:px-16",
        chapter.align === "right" && "sm:justify-end",
      )}
    >
      <motion.article
        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        // low threshold: on phones the card rests at the bottom edge of the screen
        viewport={{ amount: 0.2 }}
        transition={{ duration: 0.8, ease }}
        className="glass w-full max-w-md rounded-xl p-4 shadow-panel sm:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate font-mono text-[0.68rem] text-cyan sm:text-xs">
            {chapter.level}
          </p>
          {chapter.status === "open" ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-green">
              <Zap aria-hidden className="size-3.5" /> Playable now
            </span>
          ) : chapter.status === "soon" ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-line-strong px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-text-1">
              <Clock aria-hidden className="size-3.5" /> Coming soon
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium whitespace-nowrap text-text-2">
              <Construction aria-hidden className="size-3.5" /> Under construction
            </span>
          )}
        </div>
        <h2 className="mt-2 font-display text-[1.35rem] leading-[1.08] font-bold tracking-[-0.02em] text-text-1 sm:mt-3 sm:text-[clamp(1.7rem,3vw,2.4rem)] sm:leading-[1.05]">
          {chapter.title}
        </h2>
        <p className="mt-2 text-[0.86rem] leading-snug text-text-2 sm:mt-4 sm:text-base sm:leading-relaxed">
          {chapter.body}
        </p>
        {chapter.id === "gatehouse" ? (
          <div className="hidden sm:block">
            <GateSnippet />
          </div>
        ) : null}
        {chapter.points ? (
          <ul className="mt-5 hidden flex-wrap gap-2 sm:flex">
            {chapter.points.map((p) => (
              <li
                key={p}
                className="rounded-md border border-line-strong bg-bg-1/70 px-2.5 py-1 font-mono text-xs text-text-1"
              >
                {p}
              </li>
            ))}
          </ul>
        ) : null}
      </motion.article>
    </div>
  );
}

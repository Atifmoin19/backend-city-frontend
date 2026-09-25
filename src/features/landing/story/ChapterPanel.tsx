"use client";

import { Construction, Zap } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";

import type { Chapter } from "./chapters";
import { GateSnippet } from "./GateSnippet";

const ease = [0.16, 1, 0.3, 1] as const;

/** Glass panel for one story chapter; reveals as it enters the viewport. */
export function ChapterPanel({ chapter }: { chapter: Chapter }) {
  return (
    <div
      className={cn(
        "flex h-full items-center px-5 sm:px-10 lg:px-16",
        chapter.align === "right" && "justify-end",
      )}
    >
      <motion.article
        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ amount: 0.5, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 0.8, ease }}
        className="glass w-full max-w-md rounded-xl p-6 shadow-panel sm:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs text-cyan">{chapter.level}</p>
          {chapter.status === "open" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green">
              <Zap aria-hidden className="size-3.5" /> Playable now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-2">
              <Construction aria-hidden className="size-3.5" /> Under construction
            </span>
          )}
        </div>
        <h2 className="mt-3 font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.05] font-bold tracking-[-0.02em] text-text-1">
          {chapter.title}
        </h2>
        <p className="mt-4 leading-relaxed text-text-2">{chapter.body}</p>
        {chapter.id === "gatehouse" ? <GateSnippet /> : null}
        {chapter.points ? (
          <ul className="mt-5 flex flex-wrap gap-2">
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

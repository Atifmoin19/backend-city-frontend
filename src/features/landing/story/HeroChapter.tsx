"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

import { buttonClasses } from "@/components/ui/Button";
import { SessionCta } from "@/features/session/SessionCta";

import { LiveLegend, type TrafficCounts } from "../LiveLegend";

const ease = [0.16, 1, 0.3, 1] as const;
const WORDS = ["Your", "code", "runs", "the", "city."];

/** Chapter 0: kinetic headline over the 3D city. */
export function HeroChapter({ counts }: { counts: TrafficCounts }) {
  return (
    <div className="relative flex h-full flex-col justify-end px-5 pb-10 sm:px-10 lg:px-16 lg:pb-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_18%_78%,rgb(7_11_24/0.72),transparent_70%)]"
      />
      <h1 className="max-w-4xl font-display text-[clamp(2.8rem,8vw,6.25rem)] leading-[0.98] font-bold tracking-[-0.03em]">
        {WORDS.map((w, i) => (
          <span key={w} className="inline-block overflow-hidden pr-[0.22em] align-bottom">
            <motion.span
              className={`inline-block ${i >= 3 ? "sign-text" : "text-text-1"}`}
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease }}
        className="mt-6 max-w-xl text-lg leading-relaxed text-text-1/90 sm:text-xl"
      >
        You know the browser end of{" "}
        <code className="font-mono text-[0.9em] text-cyan">fetch()</code>. Learn the other end by
        playing: write a few lines inside a real FastAPI server and watch live traffic pass, bounce,
        or crash it.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.85, ease }}
        className="mt-9 flex flex-wrap items-center gap-4"
      >
        <SessionCta />
        <a href="#academy" className={buttonClasses({ variant: "ghost", size: "lg" })}>
          Fly through the city <ChevronDown aria-hidden className="size-4 animate-bounce" />
        </a>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="mt-12 w-fit rounded-lg border border-line/80 bg-bg-0/55 px-4 py-3 backdrop-blur-md"
      >
        <p className="sr-only">Live traffic in the city right now</p>
        <LiveLegend counts={counts} />
      </motion.div>
    </div>
  );
}

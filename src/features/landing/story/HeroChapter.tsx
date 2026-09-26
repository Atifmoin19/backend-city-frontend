"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

import { buttonClasses } from "@/components/ui/Button";
import { SessionCta } from "@/features/session/SessionCta";
import { TryAsGuest } from "@/features/session/TryAsGuest";

import { CitySoundToggle } from "../CitySoundToggle";
import { LiveLegend, type TrafficCounts } from "../LiveLegend";

const ease = [0.16, 1, 0.3, 1] as const;
const WORDS = ["Your", "code", "runs", "the", "city."];

/** Chapter 0: kinetic headline over the 3D city. */
export function HeroChapter({ counts }: { counts: TrafficCounts }) {
  return (
    <div className="relative flex h-full flex-col justify-end px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-10 lg:px-16 lg:pb-14">
      {/* Legibility: a deep-blue pool + soft blur behind the copy, fading into the city */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_62%_58%_at_16%_74%,rgb(var(--bc-scrim-rgb)/0.86)_0%,rgb(var(--bc-scrim-rgb)/0.55)_45%,transparent_78%)]"
      />
      {/* Narrow screens: copy spans the width, so wash the whole lower half */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-[rgb(var(--bc-scrim-rgb)/0.92)] via-[rgb(var(--bc-scrim-rgb)/0.7)] to-transparent sm:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_55%_50%_at_16%_74%,black_30%,transparent_75%)] backdrop-blur-[6px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] left-[4%] h-[46%] w-[48%] rounded-full bg-cyan/10 blur-3xl"
      />
      <h1 className="relative max-w-4xl font-display text-[clamp(2.3rem,10vw,6.25rem)] leading-[0.98] font-bold tracking-[-0.03em] [filter:drop-shadow(0_2px_18px_rgb(var(--bc-scrim-rgb)/0.85))]">
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
        className="relative mt-4 max-w-xl text-[0.98rem] leading-relaxed text-text-1 sm:mt-6 sm:text-xl"
      >
        <span className="font-semibold">Full Stack City</span>: the glass on top is the frontend,
        the steel inside is the backend.
        <span className="hidden sm:inline">
          {" "}
          Start underneath: write a few lines inside a real FastAPI server and watch live traffic
          pass, bounce, or crash it.
        </span>
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.85, ease }}
        className="relative mt-6 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4"
      >
        <SessionCta />
        <a href="#frontend" className={buttonClasses({ variant: "ghost", size: "lg" })}>
          Fly through the city <ChevronDown aria-hidden className="size-4 animate-bounce" />
        </a>
        <span className="hidden sm:contents">
          <CitySoundToggle />
        </span>
        <TryAsGuest className="basis-full" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative mt-12 hidden w-fit rounded-lg border border-line/80 bg-bg-0/55 px-4 py-3 backdrop-blur-md sm:block"
      >
        <p className="sr-only">Live traffic in the city right now</p>
        <LiveLegend counts={counts} />
      </motion.div>
    </div>
  );
}

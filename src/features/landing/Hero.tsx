"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

import { buttonClasses } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";

import { LiveLegend, type TrafficCounts } from "./LiveLegend";
import { SkylineCanvas } from "./skyline/SkylineCanvas";
import type { Outcome } from "./skyline/scene";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const [counts, setCounts] = useState<TrafficCounts>({ pass: 0, bounce: 0, crash: 0 });
  const onResolve = useCallback((o: Outcome) => setCounts((c) => ({ ...c, [o]: c[o] + 1 })), []);

  return (
    <section className="relative isolate flex min-h-dvh flex-col justify-between overflow-hidden sm:justify-end">
      <SkylineCanvas onResolve={onResolve} className="absolute inset-0 -z-10 size-full" />
      {/* legibility scrim behind the copy only */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(11_17_36/0.9)_0%,transparent_45%)] sm:bg-[radial-gradient(ellipse_60%_65%_at_12%_70%,rgb(11_17_36/0.9),transparent_72%)]"
      />
      <div className="flex flex-1 flex-col justify-between px-5 pt-24 pb-8 sm:flex-none sm:px-8 sm:pb-14 lg:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="max-w-3xl"
        >
          <SignHeading as="h1" lit className="text-[clamp(2.6rem,7.4vw,5.75rem)]">
            Your code runs the city.
          </SignHeading>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-text-2 sm:text-xl">
            You know the browser end of{" "}
            <code className="font-mono text-[0.9em] text-cyan">fetch()</code>. Now take the other
            end: write a few lines inside a real FastAPI server and watch live requests pass,
            bounce, or crash it.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup" className={buttonClasses({ size: "lg" })}>
              Start your first shift
            </Link>
            <Link
              href="/learn/gatehouse-validation"
              className={buttonClasses({ variant: "ghost", size: "lg" })}
            >
              Try the Gatehouse
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
          className="mt-12 rounded-md border-t border-line/80 bg-bg-0/70 pt-5 sm:bg-transparent"
        >
          <p className="sr-only">Live simulation legend</p>
          <LiveLegend counts={counts} />
        </motion.div>
      </div>
    </section>
  );
}

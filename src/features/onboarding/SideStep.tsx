"use client";

import { ArrowRight, BellRing, Check, Clock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import { sideByTrack, type SideKey } from "@/content/sides";
import { SideArt } from "@/features/sides/SideArt";
import { useChooseGoal, useSides } from "@/features/sides/useSides";
import { cn } from "@/lib/cn";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Onboarding step 1: "Which side of the city?" Saved to the account (PUT /me/goal). The
 * backend continues into orientation; a coming-soon side is noted (Notify me) and the
 * learner is offered the Backend District meanwhile.
 */
export function SideStep({
  initial,
  onDone,
}: {
  initial: SideKey | undefined;
  onDone: () => void;
}) {
  const { sides } = useSides();
  const choose = useChooseGoal();
  const [picked, setPicked] = useState<SideKey | undefined>(initial);
  const [waiting, setWaiting] = useState<SideKey | null>(null);
  const side = sideByTrack(picked);
  const pickedOpen = sides.find((s) => s.track === picked)?.open ?? false;

  const confirm = () => {
    if (!picked) return;
    choose.mutate(picked, {
      onSettled: () => (pickedOpen ? onDone() : setWaiting(picked)),
    });
  };

  if (waiting) {
    const soon = sideByTrack(waiting)!;
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-green">
          <BellRing aria-hidden className="size-4" /> You&apos;re on the list
        </p>
        <SignHeading as="h1" className="mt-4 max-w-xl text-[clamp(1.9rem,3.6vw,3rem)]">
          The {soon.name} is still being built.
        </SignHeading>
        <div className="mt-6 flex max-w-xl flex-col gap-4 text-lg leading-relaxed text-text-2">
          <p>We saved your pick and we&apos;ll tell you the day it opens.</p>
          <p>
            Meanwhile, the Backend District is open. Every page you&apos;ll build talks to a server
            like the ones in there, so it&apos;s the best head start for either side.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Button variant="quiet" onClick={() => setWaiting(null)}>
            Pick again
          </Button>
          <Button size="lg" onClick={onDone}>
            Start with the Backend District <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <p className="text-sm text-text-3">Before we start</p>
      <SignHeading as="h1" className="mt-4 max-w-xl text-[clamp(1.9rem,3.6vw,3rem)]">
        Which side of the city?
      </SignHeading>
      <p className="mt-4 max-w-xl text-lg text-text-2">Pick what you came to build.</p>
      <div
        role="radiogroup"
        aria-label="Side of the city"
        className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3"
      >
        {sides.map((s) => {
          const on = picked === s.track;
          return (
            <button
              key={s.track}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPicked(s.track)}
              className={cn(
                "flex flex-col items-start rounded-xl border p-4 text-left transition-colors duration-(--bc-dur-2)",
                on
                  ? "border-cyan bg-bg-2 shadow-glow-cyan"
                  : "border-line bg-bg-1 hover:border-line-strong",
              )}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <SideArt
                  side={s.track}
                  className={cn("h-10 w-12", on ? "text-cyan" : "text-text-2")}
                />
                {on ? (
                  <Check aria-hidden className="size-5 text-cyan" />
                ) : s.open ? null : (
                  <Clock aria-label="Coming soon" className="size-4 text-text-3" />
                )}
              </div>
              <span className="mt-3 font-display font-semibold text-text-1">{s.name}</span>
              <span className="text-sm text-text-3">
                {s.open ? "Open now" : "Coming soon"} · {s.tagline}
              </span>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {side ? (
          <motion.p
            key={side.track}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 max-w-2xl text-sm text-text-2"
          >
            {side.body}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <Button size="lg" disabled={!picked} loading={choose.isPending} onClick={confirm}>
          {picked && !pickedOpen ? "Save my pick" : "Continue"}
          <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
    </div>
  );
}

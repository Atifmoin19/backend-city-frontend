"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { SignHeading } from "@/components/ui/SignHeading";
import { SideCard } from "@/features/sides/SideCard";
import { useSides } from "@/features/sides/useSides";

const ease = [0.16, 1, 0.3, 1] as const;

/** Last chapter of the tour: pick a side of the city, over the wired-up skyline.
 * Phones swipe through the three cards so the scene stays visible above them. */
export function ChooseChapter() {
  const { sides, signedIn, notifyMe } = useSides();
  // watch the still slot, not the moving panel (see ChapterPanel)
  const slot = useRef<HTMLDivElement>(null);
  const shown = useInView(slot, { amount: 0.35 });
  return (
    <div
      ref={slot}
      className="flex h-full flex-col justify-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-center sm:px-10 sm:pb-0 lg:px-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease }}
        className="mx-auto w-full max-w-6xl"
        aria-labelledby="choose-title"
        role="region"
      >
        <div className="glass max-w-2xl rounded-xl p-4 shadow-panel sm:p-6">
          <p className="font-mono text-xs text-cyan">Full Stack City</p>
          <SignHeading
            as="h2"
            id="choose-title"
            className="mt-1 text-[1.5rem] sm:mt-2 sm:text-[clamp(2rem,4vw,3rem)]"
          >
            Choose your side of the city.
          </SignHeading>
          <p className="mt-2 text-sm text-text-2 sm:mt-3 sm:text-lg">
            The surface, the structure, or both wired together. The Backend District is open now;
            the others are being built.
          </p>
        </div>
        <ul className="-mx-3 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 sm:mt-5 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {sides.map((side) => (
            <SideCard
              key={side.track}
              side={side}
              signedIn={signedIn}
              pending={notifyMe.isPending && notifyMe.variables === side.track}
              onNotify={() => notifyMe.mutate(side.track)}
              className="w-[80%] shrink-0 snap-center md:w-auto"
            />
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

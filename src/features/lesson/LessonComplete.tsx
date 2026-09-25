"use client";

import { Check, Map, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { Byte } from "@/components/characters/Byte";
import { Button, buttonClasses } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import { districtByKey } from "@/content/districts";
import type { Lesson } from "@/content/lessons";
import type { Topic } from "@/content/topics";
import { NextStepCard } from "@/features/progress/NextStepCard";

const ease = [0.16, 1, 0.3, 1] as const;

/** End of a lesson-only briefing: recap, district lights on, and a clear next chapter. */
export function LessonComplete({
  lesson,
  topic,
  onReview,
}: {
  lesson: Lesson;
  topic: Topic;
  onReview: () => void;
}) {
  const district = districtByKey(topic.district);
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:py-16">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="flex items-center gap-4">
          <Byte size={72} state="celebrating" />
          <p className="rounded-md border border-purple/40 bg-(--bc-byte-bubble) px-4 py-2.5 text-sm text-text-1">
            Lights are back on in {district?.name}. Nice work.
          </p>
        </div>
        <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-green">
          <Check aria-hidden className="size-4" /> Briefing complete · {district?.name} cleared
        </p>
        <SignHeading as="h1" className="mt-3 text-[clamp(2rem,4.4vw,3.2rem)]">
          {lesson.title}
        </SignHeading>
        <h2 className="mt-10 text-sm font-semibold text-text-1">What you can do now</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {lesson.steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease }}
              className="flex items-start gap-3 rounded-lg border border-line bg-bg-1 px-4 py-3"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-green/60 text-green">
                <Check aria-hidden className="size-3.5" />
              </span>
              <span className="text-sm text-text-1">{s.title}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/map" className={buttonClasses({ variant: "ghost" })}>
            <Map aria-hidden className="size-4" /> Back to the map
          </Link>
          <Button
            variant="quiet"
            onClick={onReview}
            icon={<RotateCcw aria-hidden className="size-4" />}
          >
            Review the briefing
          </Button>
        </div>
      </motion.section>
      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease }}
        className="lg:pt-24"
      >
        <NextStepCard />
      </motion.aside>
    </div>
  );
}

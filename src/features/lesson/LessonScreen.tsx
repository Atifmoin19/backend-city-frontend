"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Byte } from "@/components/characters/Byte";
import { Button } from "@/components/ui/Button";
import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { SignHeading } from "@/components/ui/SignHeading";
import { districtByKey } from "@/content/districts";
import type { Lesson } from "@/content/lessons";
import type { Topic } from "@/content/topics";
import { InlineCode } from "@/features/game/InlineCode";
import { cn } from "@/lib/cn";
import { useLearning } from "@/stores/learning";

import { CheckQuestion } from "./CheckQuestion";
import { CodeSample } from "./CodeSample";
import { Diagram } from "./Diagram";

export function LessonScreen({ lesson, topic }: { lesson: Lesson; topic: Topic }) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const { update } = useLearning();
  const router = useRouter();
  const step = lesson.steps[index]!;
  const last = index === lesson.steps.length - 1;
  const canContinue = !step.check || solved[index];
  const district = districtByKey(topic.district);

  const next = () => {
    if (last) {
      update(topic.slug, { lessonDone: true });
      router.push(`/play/${topic.game}?mode=practice`);
      return;
    }
    setIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh bg-bg-0">
      <header className="flex items-center gap-4 border-b border-line bg-bg-1 px-4 py-3 sm:px-6">
        <Link
          href={`/district/${topic.district}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1"
        >
          <ArrowLeft aria-hidden className="size-4" /> {district?.name ?? "District"}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-text-3">Briefing · about {topic.minutes} min</p>
          <p className="truncate font-display text-sm font-semibold tracking-tight sm:text-base">
            {lesson.title}
          </p>
        </div>
        <PreferenceToggles />
      </header>

      {/* Step track */}
      <nav aria-label="Briefing steps" className="mx-auto max-w-3xl px-5 pt-6 sm:px-8">
        <ol className="flex gap-1.5">
          {lesson.steps.map((s, i) => (
            <li key={s.title} className="flex-1">
              <span className="sr-only">
                Step {i + 1}: {s.title} {i < index ? "(done)" : i === index ? "(current)" : ""}
              </span>
              <span
                aria-hidden
                className={cn(
                  "block h-1.5 rounded-full",
                  i < index ? "bg-green" : i === index ? "bg-cyan" : "bg-line-strong",
                )}
              />
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-text-3">
          Step {index + 1} of {lesson.steps.length}
        </p>
      </nav>

      <main className="mx-auto max-w-3xl px-5 pt-6 pb-24 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.article
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-start gap-4">
              <Byte size={56} state={canContinue ? "happy" : "idle"} />
              <p className="mt-2 rounded-md border border-purple/40 bg-[#261d4a] px-4 py-2.5 text-sm text-text-1">
                {step.byte}
              </p>
            </div>
            <SignHeading as="h1" className="text-[clamp(1.6rem,4vw,2.4rem)]">
              {step.title}
            </SignHeading>
            {step.diagram ? <Diagram name={step.diagram} /> : null}
            <div className="flex flex-col gap-4 text-[1.05rem] leading-relaxed text-text-2">
              {step.body.map((p) => (
                <p key={p}>
                  <InlineCode text={p} />
                </p>
              ))}
            </div>
            {step.code ? <CodeSample {...step.code} /> : null}
            {step.table ? (
              <table className="w-full overflow-hidden rounded-lg border border-line text-sm">
                <thead className="bg-bg-2 text-left text-text-2">
                  <tr>
                    <th className="px-4 py-2 font-medium">{step.table.head[0]}</th>
                    <th className="px-4 py-2 font-medium">{step.table.head[1]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-bg-1">
                  {step.table.rows.map(([a, b]) => (
                    <tr key={a}>
                      <td className="px-4 py-2 font-mono text-cyan">{a}</td>
                      <td className="px-4 py-2 text-text-1">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {step.check ? (
              <CheckQuestion
                key={index}
                question={step.check}
                onSolved={() => setSolved((s) => ({ ...s, [index]: true }))}
              />
            ) : null}
          </motion.article>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          <Button
            variant="quiet"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
            icon={<ArrowLeft aria-hidden className="size-4" />}
          >
            Back
          </Button>
          <div className="flex items-center gap-3">
            {!canContinue ? (
              <span className="text-sm text-text-3">Answer the check to continue</span>
            ) : null}
            <Button onClick={next} disabled={!canContinue}>
              {last ? "Start practice" : "Next"}
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { ArrowLeft, ArrowRight, Check, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Byte } from "@/components/characters/Byte";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
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
  const [reached, setReached] = useState(0);
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const { update } = useLearning();
  const router = useRouter();
  const step = lesson.steps[index]!;
  const last = index === lesson.steps.length - 1;
  const canContinue = !step.check || solved[index];
  const district = districtByKey(topic.district);

  const go = (i: number) => {
    setIndex(i);
    setReached((r) => Math.max(r, i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (!last) return go(index + 1);
    update(topic.slug, { lessonDone: true });
    router.push(topic.game ? `/play/${topic.game}?mode=practice` : `/district/${topic.district}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line py-6">
        <div>
          <nav aria-label="Breadcrumb" className="text-sm text-text-3">
            <Link href="/map" className="hover:text-text-1">
              City map
            </Link>{" "}
            /{" "}
            <Link href={`/district/${topic.district}`} className="hover:text-text-1">
              {district?.name}
            </Link>{" "}
            / <span className="text-text-2">Briefing</span>
          </nav>
          <p className="mt-2 font-display text-lg font-semibold tracking-tight text-text-1">
            {lesson.title}
          </p>
        </div>
        <p className="text-sm text-text-2">
          About {topic.minutes} min · Step {index + 1} of {lesson.steps.length}
        </p>
      </div>

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-14">
        <main>
          <AnimatePresence mode="wait">
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex max-w-3xl flex-col gap-6"
            >
              <div className="flex items-start gap-4">
                <Byte size={52} state={canContinue ? "happy" : "idle"} />
                <p className="mt-1.5 rounded-md border border-purple/40 bg-[#261d4a] px-4 py-2.5 text-sm text-text-1">
                  {step.byte}
                </p>
              </div>
              <SignHeading as="h1" className="text-[clamp(1.7rem,3.4vw,2.5rem)]">
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
                      <th className="px-4 py-2.5 font-medium">{step.table.head[0]}</th>
                      <th className="px-4 py-2.5 font-medium">{step.table.head[1]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-bg-1">
                    {step.table.rows.map(([a, b]) => (
                      <tr key={a}>
                        <td className="px-4 py-2.5 font-mono whitespace-nowrap text-cyan">{a}</td>
                        <td className="px-4 py-2.5 text-text-1">{b}</td>
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

          <div className="mt-10 flex max-w-3xl items-center justify-between gap-3 border-t border-line pt-6">
            <Button
              variant="quiet"
              disabled={index === 0}
              onClick={() => go(index - 1)}
              icon={<ArrowLeft aria-hidden className="size-4" />}
            >
              Back
            </Button>
            <div className="flex items-center gap-3">
              {!canContinue ? (
                <span className="text-sm text-text-3">Answer the check to continue</span>
              ) : null}
              <Button onClick={next} disabled={!canContinue} size="lg">
                {last ? (topic.game ? "Start practice" : "Finish briefing") : "Next"}
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            </div>
          </div>
        </main>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-text-1">In this briefing</h2>
            <ol className="mt-3 flex flex-col gap-1">
              {lesson.steps.map((s, i) => {
                const done = i < index || (i === index && canContinue && i < reached);
                const current = i === index;
                const reachable = i <= reached;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => go(i)}
                      aria-current={current ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        current
                          ? "bg-bg-3 text-text-1"
                          : reachable
                            ? "text-text-2 hover:bg-bg-3/60 hover:text-text-1"
                            : "text-text-3",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full border text-xs",
                          done
                            ? "border-green/60 text-green"
                            : current
                              ? "border-cyan text-cyan"
                              : "border-line-strong",
                        )}
                      >
                        {done ? <Check aria-hidden className="size-3.5" /> : i + 1}
                      </span>
                      {s.title}
                    </button>
                  </li>
                );
              })}
            </ol>
          </Panel>
          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-text-1">After this</h2>
            {topic.game ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-text-2">
                <Play aria-hidden className="mt-0.5 size-4 shrink-0 text-cyan" />
                Practice in a real FastAPI server, then take the checkpoint.
              </p>
            ) : (
              <p className="mt-2 text-sm text-text-2">
                Finishing this briefing completes the topic and lights up {district?.name}.
              </p>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

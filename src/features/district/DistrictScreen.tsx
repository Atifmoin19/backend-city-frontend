"use client";

import { ArrowLeft, BookOpen, Check, Lock, Play, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Bouncer } from "@/components/characters/Bouncer";
import { buttonClasses } from "@/components/ui/Button";
import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { SignHeading } from "@/components/ui/SignHeading";
import type { District } from "@/content/districts";
import type { Topic } from "@/content/topics";
import { cn } from "@/lib/cn";
import { useLearning, type TopicRecord } from "@/stores/learning";

type StepState = "done" | "ready" | "locked";

function stepsFor(topic: Topic, r: TopicRecord) {
  return [
    {
      key: "briefing",
      icon: BookOpen,
      title: "Briefing",
      body: `Learn the idea first: why servers validate, Pydantic models, Field() limits and status codes. About ${topic.minutes} minutes, with quick checks.`,
      state: (r.lessonDone ? "done" : "ready") as StepState,
      href: `/learn/${topic.lesson}`,
      cta: r.lessonDone ? "Review briefing" : "Start briefing",
    },
    {
      key: "practice",
      icon: Play,
      title: "Practice",
      body: "Edit two lines and watch real requests hit your server. Runs in your browser, as many tries as you like.",
      state: (r.practicePassed ? "done" : r.lessonDone ? "ready" : "locked") as StepState,
      href: `/play/${topic.game}?mode=practice`,
      cta: r.practicePassed ? "Practice again" : "Start practice",
      lockedWhy: "Finish the briefing first.",
    },
    {
      key: "checkpoint",
      icon: ShieldCheck,
      title: "Checkpoint",
      body: "A new variant with hidden requests at every boundary, graded on the server. Score 70% to clear the district.",
      state: (r.checkpoint ? "done" : r.practicePassed ? "ready" : "locked") as StepState,
      href: `/play/${topic.game}?mode=checkpoint`,
      cta: r.checkpoint ? "Retake for more stars" : "Take the checkpoint",
      lockedWhy: "Pass the practice first.",
    },
  ];
}

export function DistrictScreen({ district, topics }: { district: District; topics: Topic[] }) {
  const { record } = useLearning();
  return (
    <div className="min-h-dvh bg-bg-0">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-bg-1 px-4 py-3 sm:px-6">
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1"
        >
          <ArrowLeft aria-hidden className="size-4" /> City map
        </Link>
        <PreferenceToggles />
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs text-text-3">Level {district.level}</p>
            <SignHeading as="h1" className="mt-2 text-[clamp(2rem,5vw,3.2rem)]">
              {district.name}
            </SignHeading>
            <p className="mt-3 max-w-xl text-lg text-text-2">
              {district.teaches}. {district.metaphor}.
            </p>
          </div>
          <Bouncer size={96} className="hidden shrink-0 sm:block" />
        </div>

        {topics.map((topic) => {
          const r = record(topic.slug);
          return (
            <section key={topic.slug} className="mt-12" aria-labelledby={`topic-${topic.slug}`}>
              <h2
                id={`topic-${topic.slug}`}
                className="font-display text-lg font-semibold tracking-tight"
              >
                {topic.title}
              </h2>
              <p className="mt-1.5 text-text-2">{topic.summary}</p>
              {r.checkpoint ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-green">
                  <Check aria-hidden className="size-4" /> Cleared with {r.checkpoint.score}%
                  <span className="flex" aria-label={`${r.checkpoint.stars} of 3 stars`}>
                    {[1, 2, 3].map((n) => (
                      <Star
                        key={n}
                        aria-hidden
                        className={cn(
                          "size-4",
                          n <= r.checkpoint!.stars ? "fill-amber text-amber" : "text-line-strong",
                        )}
                      />
                    ))}
                  </span>
                </p>
              ) : null}
              <ol className="mt-6 grid gap-3">
                {stepsFor(topic, r).map(({ key, icon: Icon, ...s }, i) => (
                  <StepRow
                    key={key}
                    n={i + 1}
                    icon={<Icon aria-hidden className="size-5" />}
                    {...s}
                  />
                ))}
              </ol>
            </section>
          );
        })}
        <p className="mt-10 text-sm text-text-3">
          Progress is saved in this browser for now; account sync arrives with the progress API.
        </p>
      </main>
    </div>
  );
}

function StepRow(props: {
  n: number;
  icon: ReactNode;
  title: string;
  body: string;
  state: StepState;
  href: string;
  cta: string;
  lockedWhy?: string;
}) {
  const { n, icon, title, body, state, href, cta, lockedWhy } = props;
  return (
    <li
      className={cn(
        "flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:p-5",
        state === "ready" ? "border-cyan/50 bg-bg-2 shadow-glow-cyan" : "border-line bg-bg-1",
      )}
    >
      <div
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-md border",
          state === "done"
            ? "border-green/50 text-green"
            : state === "ready"
              ? "border-cyan/60 text-cyan"
              : "border-line-strong text-text-3",
        )}
      >
        {state === "done" ? (
          <Check aria-hidden className="size-5" />
        ) : state === "locked" ? (
          <Lock aria-hidden className="size-5" />
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-text-1">
          <span className="text-text-3">{n}. </span>
          {title}
          <span className="sr-only">
            {" "}
            ({state === "done" ? "done" : state === "ready" ? "available" : "locked"})
          </span>
        </h3>
        <p className="mt-1 text-sm text-text-2">{body}</p>
        {state === "locked" && lockedWhy ? (
          <p className="mt-1 text-sm text-text-3">{lockedWhy}</p>
        ) : null}
      </div>
      {state === "locked" ? null : (
        <Link
          href={href}
          className={buttonClasses({
            variant: state === "ready" ? "primary" : "ghost",
            className: "shrink-0",
          })}
        >
          {cta}
        </Link>
      )}
    </li>
  );
}

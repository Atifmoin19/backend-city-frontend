"use client";

import { BookOpen, Check, Lock, Play, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Character } from "@/components/characters";
import { buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import type { District } from "@/content/districts";
import type { Topic } from "@/content/topics";
import { SkylineCanvas } from "@/features/landing/skyline/SkylineCanvas";
import { topicComplete } from "@/features/progress/stats";
import { cn } from "@/lib/cn";
import { useLearning, type TopicRecord } from "@/stores/learning";

type StepState = "done" | "ready" | "locked";

const DISTRICT_CHARACTER: Record<string, { key: string; name: string; line: string }> = {
  gatehouse: {
    key: "bouncer",
    name: "The Bouncer",
    line: "Nobody gets in without the right papers.",
  },
};

function stepsFor(topic: Topic, r: TopicRecord) {
  const briefing = {
    key: "briefing",
    icon: BookOpen,
    title: "Briefing",
    body: `${topic.summary} About ${topic.minutes} minutes, with quick checks.`,
    state: (r.lessonDone ? "done" : "ready") as StepState,
    href: `/learn/${topic.lesson}`,
    cta: r.lessonDone ? "Review briefing" : "Start briefing",
  };
  if (!topic.game) return [briefing];
  return [
    briefing,
    {
      key: "practice",
      icon: Play,
      title: "Practice",
      body: "Edit a few lines and watch real requests hit your server. Runs in your browser, unlimited tries.",
      state: (r.practicePassed ? "done" : r.lessonDone ? "ready" : "locked") as StepState,
      href: `/play/${topic.game}?mode=practice`,
      cta: r.practicePassed ? "Practice again" : "Start practice",
      lockedWhy: "Finish the briefing first.",
    },
    {
      key: "checkpoint",
      icon: ShieldCheck,
      title: "Checkpoint",
      body: "A new variant with hidden requests at every boundary, graded on the server. Score 70% to clear.",
      state: (r.checkpoint ? "done" : r.practicePassed ? "ready" : "locked") as StepState,
      href: `/play/${topic.game}?mode=checkpoint`,
      cta: r.checkpoint ? "Retake for more stars" : "Take the checkpoint",
      lockedWhy: "Pass the practice first.",
    },
  ];
}

export function DistrictScreen({ district, topics }: { district: District; topics: Topic[] }) {
  const { record } = useLearning();
  const cast = DISTRICT_CHARACTER[district.key];
  const done = topics.filter((t) => topicComplete(t, record(t.slug))).length;
  const stars = topics.reduce((n, t) => n + (record(t.slug).checkpoint?.stars ?? 0), 0);

  return (
    <>
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-line bg-bg-1">
        <SkylineCanvas className="absolute inset-y-0 right-0 hidden h-full w-3/5 opacity-80 md:block" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,var(--bc-bg-1)_35%,transparent_75%)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-text-3">
            <Link href="/map" className="hover:text-text-1">
              City map
            </Link>{" "}
            / <span className="text-text-2">{district.name}</span>
          </nav>
          <p className="mt-6 font-mono text-xs text-cyan">
            Level {district.level}
            {district.optional ? " · optional" : ""}
          </p>
          <SignHeading as="h1" className="mt-2 text-[clamp(2.2rem,5vw,3.6rem)]">
            {district.name}
          </SignHeading>
          <p className="mt-3 max-w-xl text-lg text-text-2">
            {district.teaches}. {district.metaphor}.
          </p>
          <dl className="mt-6 flex flex-wrap gap-3 text-sm">
            <div className="rounded-md border border-line bg-bg-2 px-3 py-2">
              <dt className="text-text-3">Topics</dt>
              <dd className="tabular font-semibold text-text-1">
                {done}/{topics.length} complete
              </dd>
            </div>
            <div className="rounded-md border border-line bg-bg-2 px-3 py-2">
              <dt className="text-text-3">Stars</dt>
              <dd className="tabular font-semibold text-text-1">{stars}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-12">
          {topics.map((topic) => {
            const r = record(topic.slug);
            return (
              <section key={topic.slug} aria-labelledby={`topic-${topic.slug}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2
                    id={`topic-${topic.slug}`}
                    className="font-display text-xl font-semibold tracking-tight"
                  >
                    {topic.title}
                  </h2>
                  {r.checkpoint ? (
                    <p className="inline-flex items-center gap-2 text-sm text-green">
                      <Check aria-hidden className="size-4" /> Cleared with {r.checkpoint.score}%
                      <span className="flex" aria-label={`${r.checkpoint.stars} of 3 stars`}>
                        {[1, 2, 3].map((n) => (
                          <Star
                            key={n}
                            aria-hidden
                            className={cn(
                              "size-4",
                              n <= r.checkpoint!.stars
                                ? "fill-amber text-amber"
                                : "text-line-strong",
                            )}
                          />
                        ))}
                      </span>
                    </p>
                  ) : topicComplete(topic, r) ? (
                    <p className="inline-flex items-center gap-2 text-sm text-green">
                      <Check aria-hidden className="size-4" /> Complete
                    </p>
                  ) : null}
                </div>
                <ol className="mt-5 grid gap-3">
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
        </div>

        <aside className="flex flex-col gap-4">
          {cast ? (
            <Panel className="flex items-start gap-4 p-5">
              <Character name={cast.key} size={64} />
              <div>
                <p className="text-sm font-semibold text-text-1">{cast.name}</p>
                <p className="mt-1 text-sm text-text-2">&ldquo;{cast.line}&rdquo;</p>
              </div>
            </Panel>
          ) : null}
          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-text-1">What this district covers</h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {district.topics.map((t) => (
                <li
                  key={t}
                  className="rounded-sm border border-line bg-bg-1 px-2 py-1 text-xs text-text-2"
                >
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-text-3">
              Early access: more topics for this district are being built.
            </p>
          </Panel>
          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-text-1">How you clear it</h2>
            <p className="mt-2 text-sm text-text-2">
              Finish every topic. Topics with a checkpoint need 70%; 85% earns two stars and 95%
              with no hints earns three.
            </p>
            <p className="mt-3 text-xs text-text-3">Progress is saved in this browser for now.</p>
          </Panel>
        </aside>
      </div>
    </>
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

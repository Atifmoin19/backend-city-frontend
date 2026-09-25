"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileCode2,
  Lightbulb,
  Monitor,
  Pencil,
  Play,
  Radar,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button, buttonClasses } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { Panel } from "@/components/ui/Panel";
import { StatusLight } from "@/components/ui/StatusLight";
import { districtByKey } from "@/content/districts";
import { topicByGame } from "@/content/topics";
import { CodeEditor } from "@/engine/editor/CodeEditor";
import { RequestFlowVisualizer } from "@/engine/visualizer/RequestFlowVisualizer";
import { useSession } from "@/features/auth/useSession";
import { SessionMenu } from "@/features/session/SessionMenu";
import { cn } from "@/lib/cn";
import { useSlowPending } from "@/lib/useSlowPending";
import { EMPTY_RECORD } from "@/features/progress/records";
import { checkpointHref, nextPractice, practiceHref } from "@/features/progress/stats";
import { useLearning } from "@/features/progress/useLearning";
import { ApiError } from "@/lib/api/errors";

import { BootStatus } from "./BootStatus";
import { CharacterCorner } from "./CharacterCorner";
import { MissionBrief } from "./MissionBrief";
import { RequestLog } from "./RequestLog";
import { RequestsMeter } from "./RequestsMeter";
import { ResultOverlay } from "./ResultOverlay";
import { ScoreMeter } from "./ScoreMeter";
import { StepTrail } from "./StepTrail";
import { TrafficModal } from "./TrafficModal";
import { useGamePlay, type GameMode } from "./useGamePlay";

export function GameScreen({ slug, mode }: { slug: string; mode: GameMode }) {
  const { visualizer, ...g } = useGamePlay(slug, mode);
  const { data: user } = useSession();
  const [needLogin, setNeedLogin] = useState(false);
  const [trafficOpen, setTrafficOpen] = useState(false);
  const gradingSlow = useSlowPending(g.grade.isPending, 1200);
  const topic = topicByGame(slug);
  const learning = useLearning();
  const { recordPractice, refresh } = learning;
  const rec = topic ? learning.record(topic.slug) : EMPTY_RECORD;
  const allPublicPass = !!g.report?.ok && g.report.results.every((r) => r.passed);
  // After this game: the next practice game still to clear, else the checkpoint
  const upNext = topic
    ? nextPractice(topic, { ...rec, practiceDone: [...rec.practiceDone, slug] })
    : undefined;
  const nextHref = upNext
    ? practiceHref(upNext.slug)
    : topic?.checkpoint
      ? checkpointHref(topic.checkpoint.slug)
      : null;
  const nextLabel = upNext ? `Next practice: ${upNext.title}` : "Take the checkpoint";

  // Practice cleared -> save it once per variant (unlocks the next step)
  const savedFor = useRef<string | null>(null);
  const token = g.game?.attempt_token;
  useEffect(() => {
    if (mode !== "practice" || !allPublicPass || !user || !token || savedFor.current === token) {
      return;
    }
    savedFor.current = token;
    recordPractice.mutate({ slug, token, passed: true, score: 100 });
  }, [mode, allPublicPass, user, token, slug, recordPractice]);

  // A scored checkpoint changes stars, fails and cooldowns: reload progress
  useEffect(() => {
    if (g.result && g.result.verdict !== "rejected" && g.result.verdict !== "crashed") {
      void refresh();
    }
  }, [g.result, refresh]);

  if (mode === "checkpoint" && topic && learning.loading) {
    return <CenterNote>Loading your record…</CenterNote>;
  }
  if (mode === "checkpoint" && topic && user && !rec.practicePassed) {
    const todo = nextPractice(topic, rec);
    return (
      <CenterNote>
        <span className="flex max-w-md flex-col items-center gap-4">
          <span className="text-lg text-text-1">
            The checkpoint unlocks after you pass every practice game.
          </span>
          {todo ? (
            <Link href={practiceHref(todo.slug)} className="text-cyan underline">
              Go to practice: {todo.title}
            </Link>
          ) : null}
          <Link href={`/learn/${topic.lesson}`} className="text-sm text-text-2 underline">
            or read the briefing again
          </Link>
        </span>
      </CenterNote>
    );
  }
  if (g.variant.isPending) return <CenterNote>Loading the district…</CenterNote>;
  if (g.variant.isError || !g.game) {
    return (
      <CenterNote>
        We couldn&apos;t load this game. The server may be waking up; reload in a few seconds.
      </CenterNote>
    );
  }

  const game = g.game;
  const district = districtByKey(game.district);
  const ready = g.harness.state === "ready";
  const nextHint = game.hint_tiers.find((t) => t > g.hintsUsed);
  const editable = editableLines(game.starter_code, game.editable_region);

  const runAndWatch = () => {
    setTrafficOpen(true);
    void g.run();
  };

  const submit = () => {
    if (!user) return setNeedLogin(true);
    g.grade.mutate();
  };

  const results = g.report?.ok ? g.report.results : null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-0 lg:h-dvh">
      {/* One calm row: where you are, how you're doing, your account */}
      <header
        inert={trafficOpen}
        className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-bg-1 px-4 sm:px-5"
      >
        <Link
          href={`/district/${game.district}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-2 transition-colors hover:text-text-1"
        >
          <ArrowLeft aria-hidden className="size-4" />
          <span className="hidden max-w-36 truncate sm:inline">{district?.name ?? "District"}</span>
          <span className="sr-only sm:hidden">Back to the district</span>
        </Link>
        <span aria-hidden className="h-5 w-px bg-line" />
        <h1 className="min-w-0 truncate text-[0.95rem] font-semibold text-text-1">{game.title}</h1>
        {topic ? (
          <div className="ml-2 hidden lg:block">
            <StepTrail
              steps={[
                {
                  label: "Briefing",
                  href: `/learn/${topic.lesson}`,
                  state: rec.lessonDone ? "done" : "open",
                },
                {
                  label: "Practice",
                  href: practiceHref(
                    mode === "practice" ? slug : (topic.practice[0]?.slug ?? slug),
                  ),
                  state: mode === "practice" ? "current" : "done",
                },
                {
                  label: "Checkpoint",
                  href: topic.checkpoint ? checkpointHref(topic.checkpoint.slug) : "#",
                  state:
                    mode === "checkpoint"
                      ? "current"
                      : rec.checkpoint
                        ? "done"
                        : rec.practicePassed
                          ? "open"
                          : "locked",
                },
              ]}
            />
          </div>
        ) : null}
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:block">
            {mode === "checkpoint" ? (
              <ScoreMeter score={g.score} threshold={game.pass_threshold} label="Public requests" />
            ) : (
              <RequestsMeter total={game.public_tests.length} results={results} />
            )}
          </div>
          <SessionMenu />
        </div>
      </header>

      <main
        inert={trafficOpen}
        className="grid flex-1 gap-4 p-4 [grid-template-areas:'brief'_'editor'_'sim'_'log'] sm:p-5 lg:min-h-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:[grid-template-areas:'left_editor']"
      >
        {/* Left: brief, traffic, log. Its own scroll on desktop; dissolves into the grid on mobile */}
        <div className="contents lg:flex lg:min-h-0 lg:flex-col lg:gap-4 lg:overflow-y-auto lg:[grid-area:left]">
          <div className="min-w-0 [grid-area:brief]">
            <MissionBrief
              game={game}
              mode={mode}
              cleared={mode === "practice" && allPublicPass}
              lessonHref={topic ? `/learn/${topic.lesson}` : undefined}
              lessonDone={!!rec.lessonDone}
            />
          </div>

          {/* The gate keeper + the way into the full traffic view */}
          <section
            aria-label="Traffic"
            className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-line bg-bg-2 px-4 py-3 [grid-area:sim]"
          >
            <div className="min-w-0 flex-1 max-sm:basis-full">
              <CharacterCorner
                character={game.character}
                mood={g.mood}
                speech={g.speech ?? { who: "character", text: game.dialogue.start }}
                size={56}
                reverse
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="max-sm:w-full"
              icon={<Radar aria-hidden className="size-4 text-cyan" />}
              onClick={() => setTrafficOpen(true)}
            >
              {results ? "Replay traffic" : "Open traffic view"}
            </Button>
          </section>

          <div className="min-w-0 [grid-area:log]">
            <RequestLog tests={game.public_tests} results={results} />
          </div>
        </div>

        {/* Your code: the biggest thing on screen, with its own controls */}
        <Panel
          surface="editor"
          aria-label="Your code"
          className="flex min-h-[26rem] min-w-0 flex-col overflow-hidden [grid-area:editor] lg:min-h-0"
        >
          <div className="flex items-center gap-3 border-b border-line bg-bg-1/70 px-3 text-xs">
            <span className="inline-flex items-center gap-1.5 border-b-2 border-cyan px-1.5 py-2 font-mono text-text-1">
              <FileCode2 aria-hidden className="size-3.5 text-cyan" /> main.py
            </span>
            {editable ? (
              <span className="ml-auto inline-flex items-center gap-1.5 text-text-2">
                <Pencil aria-hidden className="size-3.5 text-cyan" />
                Edit lines {editable.from}–{editable.to}
                <span className="hidden text-text-3 xl:inline">· the rest is locked</span>
              </span>
            ) : null}
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              key={`${game.seed}-${g.editorKey}`}
              initialDoc={game.starter_code}
              region={game.editable_region}
              onChange={g.setDoc}
              onRun={runAndWatch}
              label="Game code. Only the highlighted lines between the edit markers can be changed."
            />
          </div>

          {g.report && !g.report.ok ? (
            <pre
              role="alert"
              className="max-h-32 overflow-auto border-t border-red/40 bg-red/[0.07] px-4 py-3 font-mono text-xs text-red"
            >
              {g.report.error}
            </pre>
          ) : null}
          {mode === "practice" && allPublicPass ? (
            <div
              role="status"
              className="flex flex-wrap items-center gap-3 border-t border-green/40 bg-green/[0.08] px-4 py-2.5"
            >
              <span className="text-sm text-text-1">
                Practice cleared. Every request landed where it should.
                {!user ? " Log in to save it to your record." : null}
              </span>
              {nextHref ? (
                <Link
                  href={nextHref}
                  className={buttonClasses({
                    variant: "success",
                    size: "sm",
                    className: "ml-auto",
                  })}
                >
                  {nextLabel} <ArrowRight aria-hidden className="size-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
          {gradingSlow ? (
            <p
              role="status"
              className="flex items-center gap-2 border-t border-cyan/30 bg-cyan/[0.06] px-4 py-2.5 text-sm text-text-1"
            >
              <StatusLight status="busy" iconOnly>
                Grading
              </StatusLight>
              Grading on the server: your code is facing the hidden requests. This takes about 10
              seconds.
            </p>
          ) : null}
          {g.grade.error instanceof ApiError && g.grade.error.code === "retest_cooldown" ? (
            <p
              role="alert"
              className="border-t border-amber/40 bg-amber/[0.07] px-4 py-2.5 text-sm text-amber"
            >
              {g.grade.error.message}. Review the briefing or replay a practice game meanwhile.
            </p>
          ) : null}
          {needLogin && !user ? (
            <p className="border-t border-amber/40 bg-amber/[0.07] px-4 py-2.5 text-sm text-amber">
              Checkpoints are graded on the server and saved to your record.{" "}
              <Link href={`/login?next=/play/${slug}?mode=checkpoint`} className="underline">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="underline">
                sign up
              </Link>{" "}
              to submit.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5 border-t border-line bg-bg-1/70 px-3 py-3">
            <Button
              onClick={runAndWatch}
              loading={g.running}
              disabled={!ready}
              icon={<Play aria-hidden className="size-4" />}
              data-sound="run"
            >
              Run requests
            </Button>
            {mode === "checkpoint" ? (
              <Button
                variant="success"
                onClick={submit}
                loading={g.grade.isPending}
                icon={<ShieldCheck aria-hidden className="size-4" />}
                data-sound="submit"
              >
                Submit checkpoint
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              icon={<Lightbulb aria-hidden className="size-4 text-purple" />}
              disabled={nextHint === undefined}
              loading={g.hint.isPending}
              onClick={() => nextHint && g.hint.mutate(nextHint)}
              title="Hints lower your maximum checkpoint score"
              data-sound="hint"
            >
              {nextHint ? `Hint ${nextHint}/${game.hint_tiers.length}` : "No hints left"}
            </Button>
            <Button
              variant="quiet"
              size="sm"
              onClick={g.reset}
              icon={<RotateCcw aria-hidden className="size-4" />}
            >
              Reset
            </Button>
            <span
              className={cn(
                "ml-auto min-w-0 text-xs text-text-3",
                ready ? "hidden md:inline" : "basis-full md:basis-auto",
              )}
            >
              {ready ? (
                <>
                  <Kbd>⌘/Ctrl</Kbd> + <Kbd>Enter</Kbd> runs
                </>
              ) : (
                <BootStatus status={g.harness} compact />
              )}
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-text-3 md:hidden">
              <Monitor aria-hidden className="size-3.5" /> Best on desktop
            </span>
          </div>
        </Panel>
      </main>

      <TrafficModal
        open={trafficOpen}
        onClose={() => setTrafficOpen(false)}
        title={`Live traffic at ${district?.name ?? "the district"}`}
        summary={
          mode === "checkpoint" ? (
            <ScoreMeter score={g.score} threshold={game.pass_threshold} label="Public requests" />
          ) : (
            <RequestsMeter total={game.public_tests.length} results={results} />
          )
        }
        stage={
          <>
            <div aria-hidden data-ambient className="city-grid absolute inset-0 opacity-60" />
            <RequestFlowVisualizer ref={visualizer} className="absolute inset-0" />
            <div className="absolute top-4 right-4">
              <CharacterCorner
                character={game.character}
                mood={g.mood}
                speech={g.speech ?? { who: "character", text: game.dialogue.start }}
              />
            </div>
          </>
        }
        log={<RequestLog tests={game.public_tests} results={results} />}
        action={
          mode === "practice" && allPublicPass && nextHref ? (
            <Link href={nextHref} className={buttonClasses({ variant: "success", size: "sm" })}>
              {nextLabel} <ArrowRight aria-hidden className="size-4" />
            </Link>
          ) : null
        }
      />

      {g.result ? (
        <ResultOverlay
          result={g.result}
          character={game.character}
          backHref={`/district/${game.district}`}
          lessonHref={topic ? `/learn/${topic.lesson}` : undefined}
          fails={rec.fails}
          onRetry={g.newVariant}
          onClose={() => g.setResult(null)}
        />
      ) : null}
    </div>
  );
}

/** 1-based line range between the edit markers, for the editor's tab bar. */
function editableLines(
  doc: string,
  region: { start_marker: string; end_marker: string },
): { from: number; to: number } | null {
  const lines = doc.split("\n");
  const start = lines.findIndex((l) => l.includes(region.start_marker));
  const end = lines.findIndex((l) => l.includes(region.end_marker));
  return start >= 0 && end > start + 1 ? { from: start + 2, to: end } : null;
}

function CenterNote({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg-0 p-6 text-center text-text-2">
      {children}
    </div>
  );
}

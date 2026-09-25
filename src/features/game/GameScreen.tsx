"use client";

import {
  ArrowLeft,
  FileCode2,
  Lightbulb,
  Monitor,
  Pencil,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { Button, buttonClasses } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { Panel } from "@/components/ui/Panel";
import { districtByKey } from "@/content/districts";
import { topicByGame } from "@/content/topics";
import { CodeEditor } from "@/engine/editor/CodeEditor";
import { RequestFlowVisualizer } from "@/engine/visualizer/RequestFlowVisualizer";
import { useSession } from "@/features/auth/useSession";
import { SessionMenu } from "@/features/session/SessionMenu";
import { useLearning } from "@/stores/learning";

import { BootStatus } from "./BootStatus";
import { CharacterCorner } from "./CharacterCorner";
import { MissionBrief } from "./MissionBrief";
import { RequestLog } from "./RequestLog";
import { RequestsMeter } from "./RequestsMeter";
import { ResultOverlay } from "./ResultOverlay";
import { ScoreMeter } from "./ScoreMeter";
import { StepTrail } from "./StepTrail";
import { useGamePlay, type GameMode } from "./useGamePlay";

export function GameScreen({ slug, mode }: { slug: string; mode: GameMode }) {
  const { visualizer, ...g } = useGamePlay(slug, mode);
  const { data: user } = useSession();
  const [needLogin, setNeedLogin] = useState(false);
  const topic = topicByGame(slug);
  const { record, update } = useLearning();
  const rec = topic ? record(topic.slug) : {};
  const allPublicPass = !!g.report?.ok && g.report.results.every((r) => r.passed);

  // Practice cleared -> unlock the checkpoint
  useEffect(() => {
    if (mode === "practice" && allPublicPass && topic && !rec.practicePassed) {
      update(topic.slug, { practicePassed: true });
    }
  }, [mode, allPublicPass, topic, rec.practicePassed, update]);

  // Checkpoint passed -> clear the district (keep the best score)
  useEffect(() => {
    const r = g.result;
    if (!r?.passed || !topic) return;
    if (!rec.checkpoint || r.score > rec.checkpoint.score) {
      update(topic.slug, { checkpoint: { score: r.score, stars: r.stars } });
    }
  }, [g.result, topic, rec.checkpoint, update]);

  if (mode === "checkpoint" && topic && !rec.practicePassed) {
    return (
      <CenterNote>
        <span className="flex max-w-md flex-col items-center gap-4">
          <span className="text-lg text-text-1">
            The checkpoint unlocks after you pass the practice.
          </span>
          <Link href={`/play/${slug}?mode=practice`} className="text-cyan underline">
            Go to practice
          </Link>
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

  const submit = () => {
    if (!user) return setNeedLogin(true);
    g.grade.mutate();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg-0 lg:h-dvh">
      {/* Where you are / progress / help */}
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line bg-bg-1 px-4 py-3 sm:px-6">
        <Link
          href={`/district/${game.district}`}
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft aria-hidden className="size-4" />
          <span className="max-w-40 truncate">{district?.name ?? "District"}</span>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
            {game.title}
          </h1>
        </div>
        {topic ? (
          <div className="hidden xl:block">
            <StepTrail
              steps={[
                {
                  label: "Briefing",
                  href: `/learn/${topic.lesson}`,
                  state: rec.lessonDone ? "done" : "open",
                },
                {
                  label: "Practice",
                  href: `/play/${slug}?mode=practice`,
                  state: mode === "practice" ? "current" : "done",
                },
                {
                  label: "Checkpoint",
                  href: `/play/${slug}?mode=checkpoint`,
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
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {mode === "checkpoint" ? (
            <ScoreMeter score={g.score} threshold={game.pass_threshold} label="Public requests" />
          ) : (
            <RequestsMeter
              total={game.public_tests.length}
              results={g.report?.ok ? g.report.results : null}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Lightbulb aria-hidden className="size-4 text-purple" />}
            disabled={nextHint === undefined}
            loading={g.hint.isPending}
            onClick={() => nextHint && g.hint.mutate(nextHint)}
            title="Hints lower your maximum checkpoint score"
          >
            {nextHint ? `Get a hint (${nextHint}/${game.hint_tiers.length})` : "No hints left"}
          </Button>
          <SessionMenu />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Left: mission + calm editor */}
        <section className="flex min-h-0 min-w-0 flex-col gap-3" aria-label="Your code">
          <MissionBrief
            game={game}
            mode={mode}
            lessonHref={topic ? `/learn/${topic.lesson}` : undefined}
            lessonDone={!!rec.lessonDone}
          />
          <Panel
            surface="editor"
            className="flex min-h-[18rem] flex-1 flex-col overflow-hidden lg:min-h-0"
          >
            <div className="flex items-center gap-3 border-b border-line bg-bg-1/70 px-3 py-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-t-sm border-b-2 border-cyan px-1.5 py-1 font-mono text-text-1">
                <FileCode2 aria-hidden className="size-3.5 text-cyan" /> main.py
              </span>
              {editable ? (
                <span className="ml-auto inline-flex items-center gap-1.5 text-text-2">
                  <Pencil aria-hidden className="size-3.5 text-cyan" />
                  You can edit lines {editable.from}–{editable.to} (highlighted). The rest is
                  locked.
                </span>
              ) : null}
            </div>
            <div className="min-h-0 flex-1">
              <CodeEditor
                key={`${game.seed}-${g.editorKey}`}
                initialDoc={game.starter_code}
                region={game.editable_region}
                onChange={g.setDoc}
                onRun={g.run}
                label="Game code. Only the highlighted lines between the edit markers can be changed."
              />
            </div>
          </Panel>
          {g.report && !g.report.ok ? (
            <pre
              role="alert"
              className="max-h-36 overflow-auto rounded-md border border-red/40 bg-red/[0.06] p-3 font-mono text-xs text-red"
            >
              {g.report.error}
            </pre>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={g.run}
              loading={g.running}
              disabled={!ready}
              icon={<Play aria-hidden className="size-4" />}
            >
              Run requests
            </Button>
            {mode === "checkpoint" ? (
              <Button
                variant="ghost"
                onClick={submit}
                loading={g.grade.isPending}
                icon={<ShieldCheck aria-hidden className="size-4" />}
              >
                Submit checkpoint
              </Button>
            ) : null}
            <Button
              variant="quiet"
              size="sm"
              onClick={g.reset}
              icon={<RotateCcw aria-hidden className="size-4" />}
            >
              Reset
            </Button>
            <span className="ml-auto hidden text-xs text-text-3 md:inline">
              <Kbd>⌘/Ctrl</Kbd> + <Kbd>Enter</Kbd> runs
            </span>
          </div>
          {mode === "practice" && allPublicPass ? (
            <div
              role="status"
              className="flex flex-wrap items-center gap-3 rounded-md border border-green/50 bg-green/[0.07] px-4 py-3"
            >
              <span className="text-sm text-text-1">
                Practice cleared: every public request landed where it should.
              </span>
              <Link
                href={`/play/${slug}?mode=checkpoint`}
                className="ml-auto text-sm font-semibold text-green underline"
              >
                Take the checkpoint
              </Link>
            </div>
          ) : null}
          {needLogin && !user ? (
            <p className="text-sm text-amber">
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
          <p className="flex items-center gap-1.5 text-xs text-text-3 md:hidden">
            <Monitor aria-hidden className="size-3.5" /> Best on desktop
          </p>
        </section>

        {/* Right: visualizer + log */}
        <section className="flex min-h-0 min-w-0 flex-col gap-3" aria-label="Traffic">
          <div className="relative min-h-[17rem] flex-1 overflow-hidden rounded-lg border border-line bg-bg-1 lg:min-h-0">
            <div aria-hidden data-ambient className="city-grid absolute inset-0 opacity-60" />
            <RequestFlowVisualizer ref={visualizer} className="absolute inset-0" />
            {!ready ? (
              <div className="glass absolute right-3 bottom-10 left-3 rounded-md px-3.5 py-2.5">
                <BootStatus status={g.harness} />
              </div>
            ) : null}
            <div className="absolute top-3 right-3">
              <CharacterCorner
                character={game.character}
                mood={g.mood}
                speech={g.speech ?? { who: "character", text: game.dialogue.start }}
              />
            </div>
          </div>
          <RequestLog tests={game.public_tests} results={g.report?.ok ? g.report.results : null} />
        </section>
      </main>

      {g.result ? (
        <ResultOverlay
          result={g.result}
          character={game.character}
          backHref={`/district/${game.district}`}
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

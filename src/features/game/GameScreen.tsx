"use client";

import { ArrowLeft, Lightbulb, Monitor, Play, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { Panel } from "@/components/ui/Panel";
import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { districtByKey } from "@/content/districts";
import { topicByGame } from "@/content/topics";
import { CodeEditor } from "@/engine/editor/CodeEditor";
import { RequestFlowVisualizer } from "@/engine/visualizer/RequestFlowVisualizer";
import { useSession } from "@/features/auth/useSession";
import { useLearning } from "@/stores/learning";

import { BootStatus } from "./BootStatus";
import { CharacterCorner } from "./CharacterCorner";
import { InlineCode } from "./InlineCode";
import { RequestLog } from "./RequestLog";
import { ResultOverlay } from "./ResultOverlay";
import { ScoreMeter } from "./ScoreMeter";
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

  const submit = () => {
    if (!user) return setNeedLogin(true);
    g.grade.mutate();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg-0 lg:h-dvh">
      {/* Score / hint bar */}
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line bg-bg-1 px-4 py-3 sm:px-6">
        <Link
          href={`/district/${game.district}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1"
        >
          <ArrowLeft aria-hidden className="size-4" /> District
        </Link>
        <div className="min-w-0">
          <p className="truncate text-xs text-text-3">
            {district?.name ?? game.district} · {mode === "checkpoint" ? "Checkpoint" : "Practice"}
          </p>
          <h1 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
            {game.title}
          </h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-4">
          <ScoreMeter
            score={g.score}
            threshold={game.pass_threshold}
            label={mode === "checkpoint" ? "Public requests" : "Practice score"}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Lightbulb aria-hidden className="size-4 text-purple" />}
            disabled={nextHint === undefined}
            loading={g.hint.isPending}
            onClick={() => nextHint && g.hint.mutate(nextHint)}
            title="Hints lower your maximum checkpoint score"
          >
            {nextHint ? `Hint ${nextHint}/${game.hint_tiers.length}` : "No hints left"}
          </Button>
          <PreferenceToggles />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Left: brief + calm editor */}
        <section className="flex min-h-0 min-w-0 flex-col gap-3" aria-label="Your code">
          <div className="rounded-lg border border-line bg-bg-2 px-4 py-3">
            {mode === "practice" && topic && !rec.lessonDone ? (
              <p className="mb-2 text-sm text-amber">
                New here?{" "}
                <Link href={`/learn/${topic.lesson}`} className="underline">
                  Read the {topic.minutes}-minute briefing first
                </Link>{" "}
                to learn what to write.
              </p>
            ) : null}
            {mode === "checkpoint" ? (
              <p className="mb-2 text-sm text-amber">
                New variant: field names and limits may differ from practice. Hidden requests test
                every boundary.
              </p>
            ) : null}
            <p className="text-sm text-text-2">{game.scenario.intro}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-1">
              <InlineCode text={game.scenario.goal} />
            </p>
          </div>
          <Panel surface="editor" className="min-h-[18rem] flex-1 overflow-hidden lg:min-h-0">
            <CodeEditor
              key={`${game.seed}-${g.editorKey}`}
              initialDoc={game.starter_code}
              region={game.editable_region}
              onChange={g.setDoc}
              onRun={g.run}
              label="Game code. Only the highlighted lines between the edit markers can be changed."
            />
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

function CenterNote({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg-0 p-6 text-center text-text-2">
      {children}
    </div>
  );
}

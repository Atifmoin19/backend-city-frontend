"use client";

import { ArrowLeft, Lightbulb, Monitor, Play, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PreferenceToggles } from "@/components/ui/PreferenceToggles";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { Panel } from "@/components/ui/Panel";
import { districtByKey } from "@/content/districts";
import { CodeEditor } from "@/engine/editor/CodeEditor";
import { RequestFlowVisualizer } from "@/engine/visualizer/RequestFlowVisualizer";
import { useSession } from "@/features/auth/useSession";

import { BootStatus } from "./BootStatus";
import { CharacterCorner } from "./CharacterCorner";
import { InlineCode } from "./InlineCode";
import { RequestLog } from "./RequestLog";
import { ResultOverlay } from "./ResultOverlay";
import { ScoreMeter } from "./ScoreMeter";
import { useGamePlay } from "./useGamePlay";

export function GameScreen({ slug }: { slug: string }) {
  const { visualizer, ...g } = useGamePlay(slug);
  const { data: user } = useSession();
  const [needLogin, setNeedLogin] = useState(false);

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
          href="/map"
          className="inline-flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1"
        >
          <ArrowLeft aria-hidden className="size-4" /> Map
        </Link>
        <div className="min-w-0">
          <p className="truncate text-xs text-text-3">
            {district?.name ?? game.district} · {game.is_checkpoint ? "Checkpoint" : "Practice"}
          </p>
          <h1 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
            {game.title}
          </h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-4">
          <ScoreMeter score={g.score} threshold={game.pass_threshold} label="Practice score" />
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
            <Button
              variant="ghost"
              onClick={submit}
              loading={g.grade.isPending}
              icon={<ShieldCheck aria-hidden className="size-4" />}
            >
              Submit checkpoint
            </Button>
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
          {needLogin && !user ? (
            <p className="text-sm text-amber">
              Checkpoints are graded on the server and saved to your record.{" "}
              <Link href={`/login?next=/play/${slug}`} className="underline">
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
          onRetry={g.newVariant}
          onClose={() => g.setResult(null)}
        />
      ) : null}
    </div>
  );
}

function CenterNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg-0 p-6 text-center text-text-2">
      {children}
    </div>
  );
}

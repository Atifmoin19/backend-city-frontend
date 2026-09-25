"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import type { CharacterState } from "@/components/characters";
import { extractSnippet } from "@/engine/editor/region";
import type { RunReport } from "@/engine/harness/protocol";
import { useHarness } from "@/engine/harness/useHarness";
import type { VisualizerHandle } from "@/engine/visualizer/RequestFlowVisualizer";
import { gamesApi } from "@/lib/api/games";
import type { GameVariant, GradeResponse } from "@/lib/api/types";

import type { Speech } from "./CharacterCorner";

export function practiceScore(report: RunReport | null): number | null {
  if (!report?.ok || report.results.length === 0) return null;
  return Math.round((100 * report.results.filter((r) => r.passed).length) / report.results.length);
}

/** All game-screen state: variant, editor doc, practice runs, hints, checkpoint grading. */
export function useGamePlay(slug: string) {
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const variant = useQuery({
    queryKey: ["variant", slug, seed ?? "first"],
    queryFn: () => gamesApi.variant(slug, seed),
    staleTime: Infinity,
  });
  const { client, status: harness } = useHarness();
  const visualizer = useRef<VisualizerHandle>(null);

  const [doc, setDocState] = useState<string | null>(null);
  // Latest editor text, updated synchronously so Run / Submit never read a stale closure
  const docRef = useRef<string | null>(null);
  const setDoc = useCallback((d: string | null) => {
    docRef.current = d;
    setDocState(d);
  }, []);
  const [editorKey, setEditorKey] = useState(0);
  const [report, setReport] = useState<RunReport | null>(null);
  const [running, setRunning] = useState(false);
  const [speech, setSpeech] = useState<Speech | null>(null);
  const [mood, setMood] = useState<CharacterState>("idle");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [result, setResult] = useState<GradeResponse | null>(null);

  const game: GameVariant | undefined = variant.data;
  const currentDoc = doc ?? game?.starter_code ?? "";

  const say = useCallback((s: Speech | null, m?: CharacterState) => {
    setSpeech(s);
    if (m) setMood(m);
  }, []);

  const run = useCallback(async () => {
    if (!game || running) return;
    setRunning(true);
    say({ who: "character", text: "Opening the gate…" }, "thinking");
    try {
      const r = await client.run({
        starterCode: game.starter_code,
        snippet: extractSnippet(docRef.current ?? game.starter_code, game.editable_region),
        region: game.editable_region,
        tests: game.public_tests,
      });
      setReport(r);
      if (!r.ok) {
        say(
          {
            who: "character",
            text: "Your server didn't even start. Check the error under the editor.",
          },
          "sad",
        );
        return;
      }
      await visualizer.current?.play(r.results);
      const allOk = r.results.every((x) => x.passed);
      say(
        { who: "character", text: allOk ? game.dialogue.success : game.dialogue.fail },
        allOk ? "happy" : "worried",
      );
    } finally {
      setRunning(false);
    }
  }, [client, game, running, say]);

  const hint = useMutation({
    mutationFn: (tier: number) => gamesApi.hint(slug, game!.attempt_token, tier),
    onSuccess: (h) => {
      setHintsUsed((n) => Math.max(n, h.tier));
      say({ who: "byte", text: h.text });
    },
    onError: () =>
      say({ who: "byte", text: "I can't reach the hint server right now. Try again in a moment." }),
  });

  const grade = useMutation({
    mutationFn: () =>
      gamesApi.grade(
        slug,
        game!.attempt_token,
        extractSnippet(docRef.current ?? game!.starter_code, game!.editable_region),
      ),
    onSuccess: (g) => {
      setResult(g);
      say(
        { who: "character", text: g.passed ? game!.dialogue.success : game!.dialogue.fail },
        g.passed ? "celebrating" : "sad",
      );
    },
  });

  const reset = useCallback(() => {
    setDoc(null);
    setReport(null);
    setEditorKey((k) => k + 1);
    visualizer.current?.reset();
    say(game ? { who: "character", text: game.dialogue.start } : null, "idle");
  }, [game, say, setDoc]);

  const newVariant = useCallback(() => {
    setSeed(Math.floor(Math.random() * 2_000_000_000) + 1);
    setDoc(null);
    setReport(null);
    setResult(null);
    setHintsUsed(0);
    setEditorKey((k) => k + 1);
    visualizer.current?.reset();
    say(null, "idle");
  }, [say, setDoc]);

  return {
    variant,
    game,
    harness,
    visualizer,
    doc: currentDoc,
    setDoc,
    editorKey,
    report,
    score: practiceScore(report),
    running,
    run,
    speech,
    mood,
    say,
    hint,
    hintsUsed,
    grade,
    result,
    setResult,
    reset,
    newVariant,
  };
}

"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import type { TestResult } from "@/engine/harness/protocol";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePreferences } from "@/stores/preferences";

import type { RequestFlowScene } from "./requestFlowScene";

export interface VisualizerHandle {
  play: (results: TestResult[]) => Promise<void>;
  reset: () => void;
}

/** Mounts the Pixi scene lazily (code-split) and exposes play/reset. */
export const RequestFlowVisualizer = forwardRef<VisualizerHandle, { className?: string }>(
  function RequestFlowVisualizer({ className }, ref) {
    const host = useRef<HTMLDivElement>(null);
    const scene = useRef<RequestFlowScene | null>(null);
    const reduced = useReducedMotion();
    const lowFx = usePreferences((s) => s.performanceMode);
    const opts = useRef({ instant: reduced, lowFx });
    useEffect(() => {
      opts.current = { instant: reduced, lowFx };
    }, [reduced, lowFx]);

    useEffect(() => {
      let cancelled = false;
      let created: RequestFlowScene | null = null;
      void import("./requestFlowScene").then(async ({ createRequestFlowScene }) => {
        if (cancelled || !host.current) return;
        created = await createRequestFlowScene(host.current);
        if (cancelled) created.destroy();
        else scene.current = created;
      });
      return () => {
        cancelled = true;
        created?.destroy();
        scene.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play: async (results) => {
        await scene.current?.play(results, opts.current);
      },
      reset: () => scene.current?.reset(),
    }));

    return <div ref={host} className={className} />;
  },
);

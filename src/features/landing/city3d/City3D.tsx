"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { useResolvedTheme } from "@/lib/theme";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePreferences } from "@/stores/preferences";

import { CutawayArt } from "../skyline/CutawayArt";
import { SkylineCanvas } from "../skyline/SkylineCanvas";
import type { CityScene, CityStage, Outcome } from "./cityScene";

export interface City3DHandle {
  setProgress: (p: number) => void;
}

export type LoadStage = "chunk" | CityStage | "fallback";

interface City3DProps {
  className?: string;
  onResolve?: (o: Outcome) => void;
  /** Real loading milestones (drives the preloader). */
  onStage?: (s: LoadStage) => void;
}

/**
 * Mounts the three.js city (lazy chunk). Pauses when offscreen or the tab is hidden.
 * Reduced motion -> one still frame per chapter. No WebGL -> the 2D skyline with a static
 * cutaway of the Backend Tower for the dive.
 */
export const City3D = forwardRef<City3DHandle, City3DProps>(function City3D(
  { className, onResolve, onStage },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CityScene | null>(null);
  const progress = useRef(0);
  const [fallback, setFallback] = useState(false);
  const [chapter, setChapter] = useState(0); // only tracked for the no-WebGL fallback
  const fallbackRef = useRef(false);
  const [ready, setReady] = useState(false);
  const still = useReducedMotion();
  const lowFx = usePreferences((s) => s.performanceMode);
  const theme = useResolvedTheme();
  const resolveRef = useRef(onResolve);
  const stageRef = useRef(onStage);
  useEffect(() => {
    resolveRef.current = onResolve;
    stageRef.current = onStage;
  }, [onResolve, onStage]);

  useImperativeHandle(ref, () => ({
    setProgress: (p) => {
      progress.current = p;
      scene.current?.setProgress(p);
      if (fallbackRef.current) setChapter(Math.round(p));
    },
  }));

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};
    const fail = () => {
      fallbackRef.current = true;
      setChapter(Math.round(progress.current));
      setFallback(true);
      stageRef.current?.("fallback");
    };
    void import("./cityScene").then(({ createCityScene, webglAvailable }) => {
      if (disposed) return;
      stageRef.current?.("chunk");
      if (!webglAvailable()) return fail();
      let s: CityScene;
      try {
        s = createCityScene(el, {
          lowFx,
          still,
          theme,
          onResolve: (o) => resolveRef.current?.(o),
          onStage: (st) => stageRef.current?.(st),
        });
      } catch {
        return fail();
      }
      scene.current = s;
      s.setProgress(progress.current);
      s.start();
      setReady(true);

      const onMove = (e: PointerEvent) =>
        s.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
      const onVis = () => (document.hidden ? s.stop() : s.start());
      const io = new IntersectionObserver(([en]) => (en?.isIntersecting ? s.start() : s.stop()));
      const ro = new ResizeObserver(() => s.resize());
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("visibilitychange", onVis);
      io.observe(el);
      ro.observe(el);
      cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("visibilitychange", onVis);
        io.disconnect();
        ro.disconnect();
        s.dispose();
        scene.current = null;
      };
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [lowFx, still, theme]);

  if (fallback)
    return (
      <div className={className}>
        <SkylineCanvas className="absolute inset-0 size-full" onResolve={onResolve} />
        <CutawayArt
          chapter={chapter}
          className="absolute bottom-[30%] left-1/2 h-[60%] max-w-none -translate-x-1/2 sm:bottom-0 sm:h-[82%]"
        />
      </div>
    );
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={`${className ?? ""} transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
});

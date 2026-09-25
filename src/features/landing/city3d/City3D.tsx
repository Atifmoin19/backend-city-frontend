"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePreferences } from "@/stores/preferences";

import { SkylineCanvas } from "../skyline/SkylineCanvas";
import type { CityScene, Outcome } from "./cityScene";

export interface City3DHandle {
  setProgress: (p: number) => void;
}

interface City3DProps {
  className?: string;
  onResolve?: (o: Outcome) => void;
}

/**
 * Mounts the three.js city (lazy chunk). Pauses when offscreen or the tab is hidden.
 * Reduced motion -> single still frame. No WebGL -> the 2D skyline.
 */
export const City3D = forwardRef<City3DHandle, City3DProps>(function City3D(
  { className, onResolve },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CityScene | null>(null);
  const progress = useRef(0);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);
  const still = useReducedMotion();
  const lowFx = usePreferences((s) => s.performanceMode);
  const resolveRef = useRef(onResolve);
  useEffect(() => {
    resolveRef.current = onResolve;
  }, [onResolve]);

  useImperativeHandle(ref, () => ({
    setProgress: (p) => {
      progress.current = p;
      scene.current?.setProgress(p);
    },
  }));

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};
    void import("./cityScene").then(({ createCityScene, webglAvailable }) => {
      if (disposed) return;
      if (!webglAvailable()) return setFallback(true);
      let s: CityScene;
      try {
        s = createCityScene(el, { lowFx, still, onResolve: (o) => resolveRef.current?.(o) });
      } catch {
        return setFallback(true);
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
  }, [lowFx, still]);

  if (fallback) return <SkylineCanvas className={className} onResolve={onResolve} />;
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={`${className ?? ""} transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
});

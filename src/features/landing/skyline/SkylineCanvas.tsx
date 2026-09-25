"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { render } from "./render";
import { buildScene, mulberry32, step, type Outcome } from "./scene";

interface SkylineCanvasProps {
  className?: string;
  onResolve?: (outcome: Outcome) => void;
}

/** Live neon skyline. Static single frame under reduced motion / performance mode. */
export function SkylineCanvas({ className, onResolve }: SkylineCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const onResolveRef = useRef(onResolve);
  useEffect(() => {
    onResolveRef.current = onResolve;
  }, [onResolve]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rand = mulberry32(7);
    let scene = buildScene(1, 1);
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = buildScene(width, height);
      // Pre-warm so the static / first frame already shows traffic
      for (let i = 0; i < 90; i++) step(scene, 1 / 30, rand);
      render(ctx, scene);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { resolved } = step(scene, dt, rand);
      for (const o of resolved) onResolveRef.current?.(o);
      render(ctx, scene);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      cancelAnimationFrame(raf);
      if (visible && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden className={className} />;
}

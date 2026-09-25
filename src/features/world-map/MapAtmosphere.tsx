"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { usePreferences } from "@/stores/preferences";

interface Win {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  speed: number;
  hue: 0 | 1;
}

/**
 * Living backdrop for the world map: far skyline with twinkling windows and rising data
 * particles. Canvas 2D, paused offscreen; one still frame under reduced motion.
 */
export function MapAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const lowFx = usePreferences((s) => s.performanceMode);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0;
    let h = 0;
    let towers: { x: number; w: number; h: number }[] = [];
    let wins: Win[] = [];
    let parts: { x: number; y: number; v: number; r: number; a: number }[] = [];
    let raf = 0;
    let visible = true;

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      let seed = 7;
      const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      towers = [];
      wins = [];
      for (let x = -10; x < w + 20;) {
        const tw = 26 + r() * 60;
        const th = h * (0.1 + r() * r() * 0.32);
        towers.push({ x, w: tw, h: th });
        for (let wy = h - th + 8; wy < h - 6; wy += 9) {
          for (let wx = x + 5; wx < x + tw - 6; wx += 8) {
            if (r() > 0.78)
              wins.push({
                x: wx,
                y: wy,
                w: 3,
                h: 3,
                phase: r() * 6.28,
                speed: 0.3 + r() * 1.4,
                hue: r() > 0.8 ? 1 : 0,
              });
          }
        }
        x += tw + 2 + r() * 10;
      }
      parts = Array.from({ length: lowFx ? 18 : 55 }, () => ({
        x: r() * w,
        y: r() * h,
        v: 6 + r() * 18,
        r: 0.6 + r() * 1.4,
        a: 0.2 + r() * 0.6,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      // far skyline silhouette
      ctx.fillStyle = "rgba(20,30,62,0.9)";
      for (const tw of towers) ctx.fillRect(tw.x, h - tw.h, tw.w, tw.h);
      // twinkling windows
      for (const win of wins) {
        const k = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * win.speed + win.phase));
        ctx.fillStyle = win.hue
          ? `rgba(77,255,154,${(0.55 * k).toFixed(3)})`
          : `rgba(160,200,255,${(0.5 * k).toFixed(3)})`;
        ctx.fillRect(win.x, win.y, win.w, win.h);
      }
      // horizon glow line
      const g = ctx.createLinearGradient(0, h - 2, w, h - 2);
      g.addColorStop(0, "rgba(62,230,255,0)");
      g.addColorStop(0.5, "rgba(62,230,255,0.45)");
      g.addColorStop(1, "rgba(62,230,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, h - 1.5, w, 1.5);
      // rising data particles
      for (const p of parts) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(62,230,255,${p.a.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const t = now / 1000;
      for (const p of parts) {
        p.y -= p.v / 60;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
      }
      draw(t);
      if (visible) raf = requestAnimationFrame(loop);
    };

    build();
    draw(0);
    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now() / 1000);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced, lowFx]);

  return <canvas ref={ref} aria-hidden className="absolute inset-x-0 bottom-0 h-[45%] w-full" />;
}

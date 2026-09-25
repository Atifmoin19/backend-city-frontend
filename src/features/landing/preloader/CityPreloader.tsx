"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";

import { StatusLight } from "@/components/ui/StatusLight";
import { useReducedMotion } from "@/lib/useReducedMotion";

import type { LoadStage } from "../city3d/City3D";

/** Each step is a real milestone reported by the 3D scene; the % never runs ahead of them. */
const STEPS: { stage: LoadStage; label: string; at: number }[] = [
  { stage: "chunk", label: "GET /city.bundle.js", at: 42 },
  { stage: "built", label: "BUILD towers + streets", at: 64 },
  { stage: "compiled", label: "COMPILE shaders", at: 88 },
  { stage: "frame", label: "RENDER first frame", at: 100 },
];
const SKYLINE = [34, 58, 44, 82, 50, 68, 40]; // emblem bar heights (of 100)
const SAFETY_MS = 20_000; // never trap a visitor behind a stuck loader
const ease = [0.16, 1, 0.3, 1] as const;

type Phase = "loading" | "opening" | "gone";

/**
 * Full-screen preloader for the 3D homepage. The light seam between the two city gates charges
 * as real load stages land; when the first frame is on the GPU the gates swing open onto it.
 */
export function CityPreloader({ stages }: { stages: ReadonlySet<LoadStage> }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("loading");
  const [timedOut, setTimedOut] = useState(false);
  const progress = useMotionValue(6);
  const [pct, setPct] = useState(6);
  useMotionValueEvent(progress, "change", (v) => setPct(Math.round(v)));
  const seam = useTransform(progress, [0, 100], [0, 1]);
  const barY = useTransform(progress, [0, 100], [100, 0]);

  const done = stages.has("frame") || stages.has("fallback") || timedOut;
  const target = done
    ? 100
    : Math.max(6, ...STEPS.filter((s) => stages.has(s.stage)).map((s) => s.at));

  useEffect(() => {
    const c = animate(progress, target, { duration: reduced ? 0 : 0.7, ease });
    return () => c.stop();
  }, [target, progress, reduced]);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), SAFETY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setPhase("opening"), reduced ? 0 : 520);
    return () => clearTimeout(t);
  }, [done, reduced]);

  // No scrolling the page out from under the loader
  useEffect(() => {
    if (phase === "gone") return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "gone") return null;
  const opening = phase === "opening";
  const gate = reduced
    ? { duration: 0.3 }
    : { duration: 1.05, ease: [0.76, 0, 0.24, 1] as const, delay: 0.12 };

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label={done ? "The city is ready" : `Loading the city, ${pct} percent`}
    >
      {/* The two city gates */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          aria-hidden
          className={`absolute inset-y-0 w-1/2 bg-bg-0 ${side === "left" ? "left-0" : "right-0"}`}
          initial={false}
          animate={
            opening
              ? reduced
                ? { opacity: 0 }
                : { x: side === "left" ? "-101%" : "101%" }
              : { x: 0, opacity: 1 }
          }
          transition={gate}
          onAnimationComplete={() => opening && side === "left" && setPhase("gone")}
        >
          <div className="city-grid absolute inset-0 opacity-70" />
          <div
            className={`absolute inset-y-0 w-40 ${side === "left" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-cyan/10 to-transparent`}
          />
        </motion.div>
      ))}

      {/* Light seam: charges bottom-up with real progress, flares when the gates open */}
      <motion.div
        aria-hidden
        className="absolute top-0 bottom-0 left-1/2 w-px origin-bottom -translate-x-1/2 bg-cyan shadow-[0_0_24px_4px_rgb(var(--bc-cyan-rgb)/0.55)]"
        style={{ scaleY: seam }}
        animate={opening ? { opacity: [1, 1, 0], width: ["1px", "6px", "1px"] } : { opacity: 1 }}
        transition={{ duration: 0.6, ease }}
      />

      <AnimatePresence>
        {!opening ? (
          <motion.div
            className="relative grid h-full place-items-center px-6"
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease }}
          >
            {/* soft pool that masks the seam behind the emblem, no hard box */}
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 size-[34rem] -translate-1/2 rounded-full [background:radial-gradient(closest-side,var(--bc-bg-0)_55%,transparent)]"
            />
            <div className="relative flex w-full max-w-sm flex-col items-center px-6 py-8 text-center">
              <Emblem barY={barY} reduced={reduced} />
              <p className="mt-6 font-display text-lg font-bold tracking-tight">
                BACKEND <span className="text-cyan">CITY</span>
              </p>
              <p className="mt-1 text-sm text-text-2">
                {timedOut && !stages.has("frame")
                  ? "Taking the long road in…"
                  : "Powering up the grid"}
              </p>
              <p className="tabular mt-5 font-mono text-4xl font-semibold text-text-1">
                {pct}
                <span className="text-xl text-text-3">%</span>
              </p>
              <ul className="mt-5 w-full space-y-1.5 text-left font-mono text-xs">
                {STEPS.map((s, i) => {
                  const ok = stages.has(s.stage) || (s.stage === "frame" && done);
                  const active = !ok && (i === 0 || stages.has(STEPS[i - 1]!.stage));
                  return (
                    <li key={s.stage} className="flex items-center justify-between gap-3">
                      <span className={ok ? "text-text-2" : active ? "text-text-1" : "text-text-3"}>
                        {s.label}
                      </span>
                      {ok ? (
                        <StatusLight status="pass" className="text-xs">
                          200
                        </StatusLight>
                      ) : active ? (
                        <StatusLight status="busy" className="text-xs">
                          …
                        </StatusLight>
                      ) : (
                        <span className="text-text-3">queued</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Wordmark tile: a packet circles the frame while the skyline fills in with real progress. */
function Emblem({
  barY,
  reduced,
}: {
  barY: ReturnType<typeof useTransform<number, number>>;
  reduced: boolean;
}) {
  const frame =
    "M14 4 H106 A10 10 0 0 1 116 14 V106 A10 10 0 0 1 106 116 H14 A10 10 0 0 1 4 106 V14 A10 10 0 0 1 14 4 Z";
  return (
    <svg viewBox="0 0 120 120" className="size-28" aria-hidden>
      <defs>
        <clipPath id="bc-pre-fill">
          <motion.rect x="0" width="120" height="120" style={{ y: barY }} />
        </clipPath>
      </defs>
      <path d={frame} fill="none" stroke="var(--bc-line-strong)" strokeWidth="1.5" />
      {/* unlit skyline */}
      <g transform="translate(22 22)">
        {SKYLINE.map((h, i) => (
          <rect
            key={i}
            x={i * 11}
            y={76 - h * 0.76}
            width="8"
            height={h * 0.76}
            rx="1"
            fill="var(--bc-body-b)"
          />
        ))}
      </g>
      {/* lit skyline, revealed bottom-up by progress */}
      <g clipPath="url(#bc-pre-fill)">
        <g transform="translate(22 22)">
          {SKYLINE.map((h, i) => (
            <rect
              key={i}
              x={i * 11}
              y={76 - h * 0.76}
              width="8"
              height={h * 0.76}
              rx="1"
              fill={i === 3 ? "var(--bc-amber)" : "var(--bc-cyan)"}
              opacity={i === 3 ? 0.95 : 0.85}
            />
          ))}
        </g>
      </g>
      <line x1="16" x2="104" y1="98.5" y2="98.5" stroke="var(--bc-cyan)" strokeOpacity="0.5" />
      {/* the packet on its lap */}
      {!reduced ? (
        <circle
          r="3.5"
          fill="var(--bc-cyan)"
          style={{ filter: "drop-shadow(0 0 6px var(--bc-cyan))" }}
        >
          <animateMotion dur="2.4s" repeatCount="indefinite" path={frame} />
        </circle>
      ) : null}
    </svg>
  );
}

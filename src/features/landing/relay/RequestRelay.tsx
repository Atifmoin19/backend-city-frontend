"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Character, type CharacterState } from "@/components/characters";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { CodeLine } from "./CodeLine";
import { SAMPLES, SERVER_LINES, clientLines, type RelaySample } from "./samples";

type Beat = "idle" | "out" | "gate" | "server" | "back" | "landed";
const ease = [0.65, 0, 0.35, 1] as const;

/** Beat timings (ms). A bounce turns round at the gate; a pass visits the server first. */
const PLAN: Record<RelaySample["status"], [Beat, number][]> = {
  422: [
    ["out", 0],
    ["gate", 650],
    ["back", 1050],
    ["landed", 1750],
  ],
  201: [
    ["out", 0],
    ["gate", 650],
    ["server", 950],
    ["back", 1500],
    ["landed", 2300],
  ],
};

/** Where the packet sits on the cable (0 = your browser, 50 = the gate, 100 = your server). */
const POS: Record<Beat, number> = { idle: 0, out: 50, gate: 50, server: 100, back: 0, landed: 0 };

/**
 * The homepage "you know this end" demo: pick a request, watch it cross from fetch() to the
 * FastAPI model, get judged by the exact rule line, and come back as the status you'd read.
 */
export function RequestRelay() {
  const reduced = useReducedMotion();
  const [sample, setSample] = useState<RelaySample>(SAMPLES[0]!);
  const [liveBeat, setBeat] = useState<Beat>("idle");
  const beat: Beat = reduced ? "landed" : liveBeat;
  const [run, setRun] = useState(0);
  const touched = useRef(false);

  // Play the beats for the current run
  useEffect(() => {
    if (reduced) return;
    const timers = PLAN[sample.status].map(([b, at]) => setTimeout(() => setBeat(b), at));
    return () => timers.forEach(clearTimeout);
  }, [sample, run, reduced]);

  // Until the visitor picks one, cycle through the samples
  useEffect(() => {
    if (reduced || beat !== "landed" || touched.current) return;
    const t = setTimeout(() => {
      const i = SAMPLES.indexOf(sample);
      setSample(SAMPLES[(i + 1) % SAMPLES.length]!);
      setRun((r) => r + 1);
    }, 2600);
    return () => clearTimeout(t);
  }, [beat, sample, reduced]);

  const send = (s: RelaySample) => {
    touched.current = true;
    setBeat("idle");
    setSample(s);
    setRun((r) => r + 1);
  };

  const bounced = sample.status === 422;
  const judged = beat === "gate" || beat === "server" || beat === "back" || beat === "landed";
  const returning = beat === "back" || beat === "landed";
  const landed = beat === "landed";
  const tone = bounced ? "amber" : "green";
  const mood: CharacterState = !judged ? "idle" : bounced ? "worried" : "happy";
  const statusText = landed ? `${sample.status} ${sample.statusText}` : "…";

  return (
    <div className="relative">
      {/* Pick a request */}
      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Pick a request to send"
      >
        <span className="mr-1 text-sm text-text-2">Send a signup with</span>
        {SAMPLES.map((s) => {
          const on = s.id === sample.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => send(s)}
              className={cn(
                "h-9 rounded-full border px-3.5 font-mono text-xs transition-[background-color,border-color,color,box-shadow] duration-(--bc-dur-2)",
                on
                  ? "border-cyan/70 bg-cyan/12 text-cyan shadow-glow-cyan"
                  : "border-line-strong text-text-2 hover:border-cyan/50 hover:text-text-1",
              )}
            >
              {s.chip}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_13rem_minmax(0,1fr)] lg:items-stretch">
        {/* Your frontend */}
        <Card title="Your frontend" file="signup.ts" lit={landed} tone={tone}>
          {clientLines(sample, statusText).map((l, i) => (
            <Line key={i} n={i + 1} highlight={i === 4 && landed ? tone : undefined}>
              {i === 4 ? (
                <motion.span
                  key={`${run}-${landed}`}
                  initial={landed && !reduced ? { opacity: 0, x: -6 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <CodeLine text={l} />
                </motion.span>
              ) : (
                <CodeLine text={l} />
              )}
            </Line>
          ))}
        </Card>

        {/* The cable, the gate and its keeper */}
        <div className="relative flex min-h-36 flex-col justify-center" aria-hidden>
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            <Character name="bouncer" state={mood} size={60} />
          </div>
          <div className="relative mx-2 mt-14 h-px bg-gradient-to-r from-line-strong via-cyan/60 to-line-strong">
            {/* gate posts */}
            <span
              className={cn(
                "absolute top-1/2 left-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-(--bc-dur-2)",
                judged
                  ? bounced
                    ? "bg-amber shadow-glow-amber"
                    : "bg-green shadow-glow-green"
                  : "bg-line-strong",
              )}
            />
            <motion.span
              key={run}
              className={cn(
                "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                returning
                  ? bounced
                    ? "bg-amber text-amber"
                    : "bg-green text-green"
                  : "bg-cyan text-cyan",
              )}
              style={{ boxShadow: "0 0 16px 3px currentColor" }}
              initial={{ left: "0%" }}
              animate={{ left: `${POS[beat]}%`, opacity: landed ? 0 : 1 }}
              transition={{ duration: reduced ? 0 : beat === "back" ? 0.7 : 0.6, ease }}
            />
          </div>
          <div className="mt-3 flex justify-between px-1 font-mono text-[0.68rem] text-text-3">
            <span>browser</span>
            <span>gate</span>
            <span>server</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${run}-${judged}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mt-3 text-center font-mono text-xs",
                !judged ? "text-cyan" : bounced ? "text-amber" : "text-green",
              )}
            >
              {!judged ? "POST /signup →" : `← ${sample.status} ${sample.statusText}`}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Your server */}
        <Card
          title="Your server (you'll write this)"
          file="signup.py"
          lit={judged}
          tone={tone}
          glow
        >
          {SERVER_LINES.map((l, i) => {
            const hit = judged && i === sample.line && (bounced || beat !== "gate");
            return (
              <Line key={i} n={i + 1} highlight={hit ? tone : undefined}>
                <CodeLine text={l} />
                {hit ? (
                  <motion.span
                    initial={reduced ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "ml-3 rounded-sm px-1.5 py-px font-sans text-[0.7rem] font-semibold whitespace-nowrap",
                      bounced ? "bg-amber/15 text-amber" : "bg-green/15 text-green",
                    )}
                  >
                    ← {sample.note}
                  </motion.span>
                ) : null}
              </Line>
            );
          })}
        </Card>
      </div>
      <p className="sr-only" aria-live="polite">
        {landed
          ? `Sent ${sample.body}. Server answered ${sample.status} ${sample.statusText}: ${sample.note}.`
          : ""}
      </p>
    </div>
  );
}

function Card({
  title,
  file,
  lit,
  tone,
  glow,
  children,
}: {
  title: string;
  file: string;
  lit: boolean;
  tone: "amber" | "green";
  glow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <figure
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border bg-editor transition-[border-color,box-shadow] duration-(--bc-dur-3)",
        lit
          ? tone === "amber"
            ? "border-amber/50 shadow-glow-amber"
            : "border-green/50 shadow-glow-green"
          : glow
            ? "border-cyan/40 shadow-glow-cyan"
            : "border-line shadow-panel",
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs">
        <span className="text-text-2">{title}</span>
        <span className="font-mono text-text-3">{file}</span>
      </figcaption>
      <pre className="overflow-x-auto py-3 font-mono text-[0.8rem] leading-6 text-(--bc-code-fg)">
        {children}
      </pre>
    </figure>
  );
}

function Line({
  n,
  highlight,
  children,
}: {
  n: number;
  highlight?: "amber" | "green";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center pr-4 transition-colors duration-(--bc-dur-2)",
        highlight === "amber" && "bg-amber/10 shadow-[inset_2px_0_0_var(--bc-amber)]",
        highlight === "green" && "bg-green/10 shadow-[inset_2px_0_0_var(--bc-green)]",
      )}
    >
      <span className="w-9 shrink-0 pr-3 text-right text-(--bc-code-gutter-fg) select-none">
        {n}
      </span>
      <span className="whitespace-pre">{children}</span>
    </div>
  );
}

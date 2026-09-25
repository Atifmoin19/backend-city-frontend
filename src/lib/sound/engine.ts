"use client";

import { usePreferences } from "@/stores/preferences";

/**
 * Backend City's sound kit, synthesized with Web Audio: no files to download, tiny and
 * consistent. Every cue is short and soft; the city should feel alive, never noisy.
 * Browsers only allow audio after a user gesture, so the context is created/resumed on the
 * first pointer or key press (see `unlockSound`). Before that, cues are silently skipped.
 */
export type Cue =
  | "click"
  | "select"
  | "step"
  | "open"
  | "toggle"
  | "correct"
  | "wrong"
  | "run"
  | "pass"
  | "bounce"
  | "crash"
  | "hint"
  | "submit"
  | "win"
  | "lose"
  | "chapter";

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
const last = new Map<Cue, number>();

function context(create: boolean): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx && create) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    out = ctx.createGain();
    out.gain.value = 0.32;
    out.connect(comp).connect(ctx.destination);
  }
  return ctx;
}

/** Call from a user gesture: creates/resumes the audio context. */
export function unlockSound(): void {
  const c = context(true);
  if (c && c.state === "suspended") void c.resume();
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  to?: number; // glide target frequency
  at?: number; // start offset (s)
  filter?: number; // lowpass cutoff
}

function tone(freq: number, dur: number, o: ToneOpts = {}) {
  const c = ctx!;
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  const peak = o.gain ?? 0.2;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + (o.attack ?? 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node: AudioNode = osc;
  if (o.filter) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.filter;
    node = node.connect(f);
  }
  node.connect(g).connect(out!);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(
  dur: number,
  o: { from: number; to: number; gain?: number; at?: number; q?: number },
) {
  const c = ctx!;
  const t0 = c.currentTime + (o.at ?? 0);
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = o.q ?? 1.2;
  f.frequency.setValueAtTime(o.from, t0);
  f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.15, t0 + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(out!);
  src.start(t0);
}

/** Chapter roots for the homepage flight: a rising progression as the city comes online. */
const CHAPTER_ROOTS = [220, 246.94, 277.18, 329.63, 369.99];

const CUES: Record<Cue, (arg: number) => void> = {
  click: () => tone(1400, 0.035, { type: "triangle", gain: 0.06 }),
  toggle: () => tone(760, 0.06, { type: "triangle", gain: 0.1, to: 980 }),
  step: () => tone(520, 0.07, { type: "triangle", gain: 0.09, to: 600 }),
  select: () => {
    tone(660, 0.09, { type: "triangle", gain: 0.12 });
    tone(990, 0.14, { type: "triangle", gain: 0.1, at: 0.06 });
  },
  open: () => {
    tone(420, 0.22, { type: "sine", gain: 0.12, to: 840 });
    noise(0.25, { from: 600, to: 2600, gain: 0.05 });
  },
  correct: () =>
    [523.25, 659.25, 783.99].forEach((f, i) =>
      tone(f, 0.18, { type: "triangle", gain: 0.12, at: i * 0.06 }),
    ),
  wrong: () => tone(240, 0.22, { type: "square", gain: 0.06, to: 170, filter: 900 }),
  run: () => {
    noise(0.5, { from: 350, to: 2800, gain: 0.12 });
    tone(300, 0.4, { type: "sine", gain: 0.06, to: 620 });
  },
  pass: (i) => tone(880 * (1 + i * 0.125), 0.16, { type: "sine", gain: 0.12 }),
  bounce: () => {
    tone(150, 0.16, { type: "sine", gain: 0.2, to: 80 });
    noise(0.1, { from: 300, to: 120, gain: 0.08, q: 0.7 });
  },
  crash: () => {
    noise(0.3, { from: 2000, to: 200, gain: 0.14, q: 0.5 });
    tone(110, 0.28, { type: "sawtooth", gain: 0.07, to: 55, filter: 700 });
  },
  hint: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.12, { gain: 0.06, at: i * 0.05 })),
  submit: () => {
    tone(392, 0.18, { type: "triangle", gain: 0.1 });
    tone(523.25, 0.24, { type: "triangle", gain: 0.1, at: 0.08 });
  },
  win: () =>
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, i === 3 ? 0.5 : 0.18, { type: "triangle", gain: 0.13, at: i * 0.09 }),
    ),
  lose: () =>
    [392, 329.63, 261.63].forEach((f, i) =>
      tone(f, 0.22, { type: "triangle", gain: 0.1, at: i * 0.12, filter: 1800 }),
    ),
  chapter: (i) => {
    const root = CHAPTER_ROOTS[Math.min(i, CHAPTER_ROOTS.length - 1)]!;
    noise(0.7, { from: 250, to: 1800, gain: 0.05 });
    [1, 1.25, 1.5].forEach((m, k) =>
      tone(root * m, 0.9, { gain: 0.05, attack: 0.12, at: k * 0.03 }),
    );
  },
};

/** Play a cue if sound is on and the browser has allowed audio. `arg` varies pitch per cue. */
export function playSound(cue: Cue, arg = 0): void {
  if (usePreferences.getState().soundMuted) return;
  const c = context(false);
  if (!c || c.state !== "running") return;
  const now = performance.now();
  if (now - (last.get(cue) ?? 0) < 40) return; // de-dupe double fires
  last.set(cue, now);
  CUES[cue](arg);
}

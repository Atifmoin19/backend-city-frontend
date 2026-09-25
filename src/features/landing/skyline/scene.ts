/**
 * Skyline simulation (pure logic, no DOM). Towers with windows, cables between rooftops and a
 * gate tower; packets travel cables and resolve as pass / bounce / crash.
 */

export type Outcome = "pass" | "bounce" | "crash";

export interface Tower {
  x: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  lit: Float32Array; // 0..1 window glow, decays
  tone: number; // 0..1 slight body tint
  isGate: boolean;
}

export interface Packet {
  from: number; // x on ground-line origin (left edge)
  to: number; // tower index
  t: number; // 0..1 progress
  speed: number;
  outcome: Outcome;
  bouncing: boolean;
}

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface Scene {
  width: number;
  height: number;
  groundY: number;
  towers: Tower[];
  packets: Packet[];
  sparks: Spark[];
  gateIndex: number;
  spawnClock: number;
}

// Deterministic PRNG so the skyline looks the same on every load (no layout shift between renders)
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildScene(width: number, height: number): Scene {
  const rand = mulberry32(20260925);
  const groundY = height * 0.96;
  const towers: Tower[] = [];
  const narrow = width < 700;
  // Keep the copy column clear: desktop copy sits left, mobile copy sits on top
  let x = narrow ? width * 0.04 : width * 0.4;
  const scale = narrow ? 0.62 : 1;
  while (x < width + 40) {
    const w = (narrow ? 26 : 38) + rand() * (narrow ? 40 : 70);
    const tall = rand() > 0.72;
    const h = height * scale * (tall ? 0.42 + rand() * 0.3 : 0.16 + rand() * 0.24);
    const cols = Math.max(2, Math.floor(w / 13));
    const rows = Math.max(3, Math.floor(h / 16));
    towers.push({
      x,
      w,
      h,
      cols,
      rows,
      lit: new Float32Array(cols * rows),
      tone: rand(),
      isGate: false,
    });
    x += w + 6 + rand() * 26;
  }
  // Gate: a mid-left tower everyone must pass (the Gatehouse)
  const gateIndex = Math.min(2, towers.length - 1);
  const gate = towers[gateIndex];
  if (gate) gate.isGate = true;
  // Seed a few lit windows so the first frame is not dead
  for (const t of towers)
    for (let i = 0; i < t.lit.length; i++) if (rand() > 0.86) t.lit[i] = 0.35 + rand() * 0.4;
  return { width, height, groundY, towers, packets: [], sparks: [], gateIndex, spawnClock: 0 };
}

export function rooftop(scene: Scene, i: number): { x: number; y: number } {
  const t = scene.towers[i]!;
  return { x: t.x + t.w / 2, y: scene.groundY - t.h };
}

/** Cable from the left edge (the internet) through the gate to a tower: quadratic arc. */
export function cablePoint(scene: Scene, p: Packet): { x: number; y: number } {
  const gate = rooftop(scene, scene.gateIndex);
  const end = rooftop(scene, p.to);
  const start = { x: -20, y: scene.height * (scene.width < 700 ? 0.62 : 0.34) };
  // two legs: start -> gate (first 45%), gate -> tower
  const split = 0.45;
  if (p.t <= split) {
    const k = p.t / split;
    return arc(start, gate, k, -scene.height * 0.08);
  }
  const k = (p.t - split) / (1 - split);
  return arc(gate, end, k, -Math.min(120, Math.abs(end.x - gate.x) * 0.25));
}

function arc(a: { x: number; y: number }, b: { x: number; y: number }, k: number, lift: number) {
  const cx = (a.x + b.x) / 2;
  const cy = Math.min(a.y, b.y) + lift;
  const u = 1 - k;
  return {
    x: u * u * a.x + 2 * u * k * cx + k * k * b.x,
    y: u * u * a.y + 2 * u * k * cy + k * k * b.y,
  };
}

export interface StepEvents {
  resolved: Outcome[];
}

export function spawn(scene: Scene, rand: () => number): void {
  const candidates = scene.towers.length - scene.gateIndex - 1;
  if (candidates <= 0) return;
  const r = rand();
  const outcome: Outcome = r < 0.7 ? "pass" : r < 0.93 ? "bounce" : "crash";
  scene.packets.push({
    from: 0,
    to: scene.gateIndex + 1 + Math.floor(rand() * candidates),
    t: 0,
    speed: 0.16 + rand() * 0.12,
    outcome,
    bouncing: false,
  });
}

export function step(scene: Scene, dt: number, rand: () => number, spawnEvery = 0.28): StepEvents {
  const events: StepEvents = { resolved: [] };
  scene.spawnClock += dt;
  while (scene.spawnClock > spawnEvery) {
    scene.spawnClock -= spawnEvery;
    if (scene.packets.length < 40) spawn(scene, rand);
  }

  for (const t of scene.towers)
    for (let i = 0; i < t.lit.length; i++) t.lit[i] = Math.max(0.06, t.lit[i]! - dt * 0.05);

  const survivors: Packet[] = [];
  for (const p of scene.packets) {
    if (p.bouncing) {
      p.t -= dt * p.speed * 1.6;
      if (p.t > 0) survivors.push(p);
      continue;
    }
    p.t += dt * p.speed;
    if (p.outcome === "bounce" && p.t >= 0.45) {
      p.bouncing = true;
      events.resolved.push("bounce");
      survivors.push(p);
      continue;
    }
    if (p.t >= 1) {
      events.resolved.push(p.outcome);
      const tower = scene.towers[p.to]!;
      if (p.outcome === "pass") {
        const idx = Math.floor(rand() * tower.lit.length);
        tower.lit[idx] = 1;
      } else {
        const top = rooftop(scene, p.to);
        for (let i = 0; i < 14; i++) {
          scene.sparks.push({
            x: top.x,
            y: top.y,
            vx: (rand() - 0.5) * 160,
            vy: -rand() * 140,
            life: 0.6 + rand() * 0.5,
          });
        }
      }
      continue;
    }
    survivors.push(p);
  }
  scene.packets = survivors;

  scene.sparks = scene.sparks.filter((s) => {
    s.life -= dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 260 * dt;
    return s.life > 0;
  });
  return events;
}

export { mulberry32 };

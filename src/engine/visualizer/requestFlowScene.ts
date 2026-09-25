/**
 * Request Flow scene (PixiJS v8). Internet -> Gate (validation) -> Server tower.
 * Imperative API so React only mounts it; the ticker runs only while a run is playing.
 */
import { Application, Container, Graphics, Text } from "pixi.js";

import type { TestResult } from "@/engine/harness/protocol";

import { outcomeOf, verdictLine } from "./outcome";

const C = {
  cyan: 0x3ee6ff,
  green: 0x4dff9a,
  amber: 0xffb547,
  red: 0xff4d6d,
  line: 0x2c3b69,
  lineStrong: 0x445890,
  body: 0x213060,
  bodyDark: 0x1a2750,
  window: 0x2a3a6e,
  text: 0xc5cee8,
};

const WIN_COLS = 4;
const WIN_ROWS = 7;

interface Layout {
  w: number;
  h: number;
  groundY: number;
  laneY: number;
  startX: number;
  gateX: number;
  serverX: number;
  serverW: number;
  serverH: number;
}

interface Flight {
  result: TestResult;
  delay: number;
  t: number;
  dot: Graphics;
  label: Text | null;
  done: boolean;
  resolvedAtGate: boolean;
  bounceV: { x: number; y: number };
}

export interface RequestFlowScene {
  play(results: TestResult[], opts: { instant: boolean; lowFx: boolean }): Promise<void>;
  reset(): void;
  destroy(): void;
}

export async function createRequestFlowScene(host: HTMLElement): Promise<RequestFlowScene> {
  const app = new Application();
  await app.init({
    resizeTo: host,
    backgroundAlpha: 0,
    antialias: true,
    autoStart: false,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  });
  host.appendChild(app.canvas);
  app.canvas.setAttribute("aria-hidden", "true");
  app.ticker.stop();

  const world = new Container();
  const flights = new Container();
  const fx = new Container();
  app.stage.addChild(world, flights, fx);

  let layout = computeLayout(host);
  let windows: Graphics[] = [];
  let lit: number[] = [];
  let gateBeam = new Graphics();
  let server = new Container();
  let shake = 0;
  let beamFlash = { color: C.amber, t: 0 };

  function computeLayout(el: HTMLElement): Layout {
    const w = Math.max(320, el.clientWidth);
    const h = Math.max(220, el.clientHeight);
    const groundY = h * 0.84;
    const serverH = Math.min(h * 0.62, 260);
    const serverW = Math.min(w * 0.2, 130);
    return {
      w,
      h,
      groundY,
      laneY: groundY - serverH * 0.55,
      startX: 24,
      gateX: w * 0.46,
      serverX: w * 0.8 - serverW / 2,
      serverW,
      serverH,
    };
  }

  function drawWorld() {
    world.removeChildren();
    const L = layout;
    // ground + lane cable
    world.addChild(new Graphics().rect(0, L.groundY, L.w, 1).fill({ color: C.cyan, alpha: 0.25 }));
    world.addChild(
      new Graphics()
        .moveTo(0, L.laneY)
        .lineTo(L.serverX, L.laneY)
        .stroke({ width: 1, color: C.cyan, alpha: 0.14 }),
    );
    // gate posts
    const gate = new Graphics();
    const gh = L.groundY - L.laneY + 34;
    gate.rect(L.gateX - 16, L.groundY - gh, 8, gh).fill(C.lineStrong);
    gate.rect(L.gateX + 8, L.groundY - gh, 8, gh).fill(C.lineStrong);
    world.addChild(gate);
    gateBeam = new Graphics();
    world.addChild(gateBeam);
    drawBeam(C.amber, 0.35);
    const gateLabel = new Text({
      text: "GATE · validation",
      style: { fontFamily: "JetBrains Mono, monospace", fontSize: 11, fill: C.text },
    });
    gateLabel.anchor.set(0.5, 0);
    gateLabel.position.set(L.gateX, L.groundY + 8);
    world.addChild(gateLabel);
    // server tower
    server = new Container();
    const body = new Graphics()
      .rect(0, 0, L.serverW, L.serverH)
      .fill(C.bodyDark)
      .stroke({ width: 1, color: C.lineStrong });
    server.addChild(body);
    windows = [];
    const cw = L.serverW / WIN_COLS;
    const rh = (L.serverH - 20) / WIN_ROWS;
    for (let r = 0; r < WIN_ROWS; r++) {
      for (let c = 0; c < WIN_COLS; c++) {
        const win = new Graphics()
          .rect(c * cw + cw * 0.25, 14 + r * rh + rh * 0.25, cw * 0.5, rh * 0.45)
          .fill(0xffffff);
        win.tint = C.window;
        server.addChild(win);
        windows.push(win);
      }
    }
    lit = windows.map(() => 0);
    server.position.set(L.serverX, L.groundY - L.serverH);
    world.addChild(server);
    const serverLabel = new Text({
      text: "YOUR SERVER",
      style: { fontFamily: "JetBrains Mono, monospace", fontSize: 11, fill: C.text },
    });
    serverLabel.anchor.set(0.5, 0);
    serverLabel.position.set(L.serverX + L.serverW / 2, L.groundY + 8);
    world.addChild(serverLabel);
    const netLabel = new Text({
      text: "INTERNET",
      style: { fontFamily: "JetBrains Mono, monospace", fontSize: 11, fill: C.text },
    });
    netLabel.position.set(L.startX, L.groundY + 8);
    world.addChild(netLabel);
  }

  function drawBeam(color: number, alpha: number) {
    const L = layout;
    gateBeam.clear();
    const top = L.groundY - (L.groundY - L.laneY + 34);
    gateBeam
      .rect(L.gateX - 8, top + 6, 16, L.groundY - top - 6)
      .fill({ color, alpha: alpha * 0.18 });
    gateBeam.rect(L.gateX - 18, top - 3, 36, 3).fill({ color, alpha: Math.min(1, alpha + 0.4) });
  }

  function lightWindow(color: number) {
    const free = lit.findIndex((v) => v === 0);
    const i = free >= 0 ? free : Math.floor(Math.random() * windows.length);
    lit[i] = 1;
    windows[i]!.tint = color;
  }

  function sparks(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const s = new Graphics().rect(0, 0, 2, 2).fill(C.red);
      s.position.set(x, y);
      (s as Graphics & { v: { x: number; y: number; life: number } }).v = {
        x: (Math.random() - 0.5) * 220,
        y: -Math.random() * 180,
        life: 0.7,
      };
      fx.addChild(s);
    }
  }

  drawWorld();
  app.render();

  const ro = new ResizeObserver(() => {
    layout = computeLayout(host);
    app.renderer.resize(layout.w, layout.h);
    drawWorld();
    app.render();
  });
  ro.observe(host);

  function reset() {
    flights.removeChildren();
    fx.removeChildren();
    drawWorld();
    app.render();
  }

  async function play(
    results: TestResult[],
    { instant, lowFx }: { instant: boolean; lowFx: boolean },
  ) {
    reset();
    if (instant) {
      for (const r of results) {
        const o = outcomeOf(r.status);
        if (o === "served") lightWindow(r.passed ? C.green : C.red);
      }
      app.render();
      return;
    }
    const L = layout;
    const stacks = { gate: 0, server: 0 };
    const list: Flight[] = results.map((result, i) => {
      const dot = new Graphics().circle(0, 0, 5).fill(C.cyan);
      dot.position.set(L.startX, L.laneY);
      dot.alpha = 0;
      flights.addChild(dot);
      return {
        result,
        delay: i * 0.38,
        t: 0,
        dot,
        label: null,
        done: false,
        resolvedAtGate: false,
        bounceV: { x: -140, y: -60 },
      };
    });

    await new Promise<void>((resolve) => {
      let elapsed = 0;
      const tick = () => {
        const dt = Math.min(0.05, app.ticker.deltaMS / 1000);
        elapsed += dt;
        let active = 0;
        for (const f of list) {
          if (f.done) continue;
          active++;
          if (elapsed < f.delay) continue;
          f.t += dt;
          f.dot.alpha = 1;
          const o = outcomeOf(f.result.status);
          const toGate = 0.55;
          const toServer = 0.5;
          if (f.t <= toGate) {
            const k = easeOut(f.t / toGate);
            f.dot.position.set(L.startX + (L.gateX - 20 - L.startX) * k, L.laneY);
          } else if (o === "bounced") {
            if (!f.resolvedAtGate) {
              f.resolvedAtGate = true;
              f.dot.clear().circle(0, 0, 5).fill(C.amber);
              beamFlash = { color: C.amber, t: 0.35 };
              f.label = addLabel(f, L.gateX - 20, L.laneY - 18 - 16 * (stacks.gate++ % 4));
            }
            f.bounceV.y += 420 * dt;
            f.dot.position.x += f.bounceV.x * dt;
            f.dot.position.y += f.bounceV.y * dt;
            f.dot.alpha = Math.max(0, f.dot.alpha - dt * 1.1);
            if (f.dot.position.y > L.groundY) finish(f);
          } else if (f.t <= toGate + toServer) {
            if (!f.resolvedAtGate) {
              f.resolvedAtGate = true;
              beamFlash = { color: f.result.passed ? C.green : C.red, t: 0.35 };
            }
            const k = easeOut((f.t - toGate) / toServer);
            f.dot.position.set(L.gateX - 20 + (L.serverX - (L.gateX - 20)) * k, L.laneY);
          } else {
            if (o === "crashed") {
              shake = 0.35;
              sparks(L.serverX, L.laneY, lowFx ? 6 : 18);
            } else {
              lightWindow(f.result.passed ? C.green : C.red);
            }
            f.label = addLabel(
              f,
              L.serverX + L.serverW / 2,
              L.groundY - L.serverH - 18 - 16 * (stacks.server++ % 4),
            );
            finish(f);
          }
        }
        // gate beam flash
        if (beamFlash.t > 0) {
          beamFlash.t -= dt;
          drawBeam(beamFlash.color, 0.35 + beamFlash.t * 2);
        } else drawBeam(C.amber, 0.35);
        // server shake
        if (shake > 0) {
          shake -= dt;
          server.position.x = L.serverX + (Math.random() - 0.5) * 6 * (shake / 0.35);
        } else server.position.x = L.serverX;
        // sparks
        for (const s of [...fx.children] as (Graphics & {
          v?: { x: number; y: number; life: number };
        })[]) {
          if (!s.v) continue;
          s.v.life -= dt;
          s.v.y += 380 * dt;
          s.position.x += s.v.x * dt;
          s.position.y += s.v.y * dt;
          s.alpha = Math.max(0, s.v.life / 0.7);
          if (s.v.life <= 0) fx.removeChild(s);
        }
        // fade labels slowly
        for (const f of list) if (f.label) f.label.alpha = Math.max(0.0, f.label.alpha - dt * 0.35);
        const sparksLeft = fx.children.some((c) => (c as { v?: unknown }).v);
        if (active === 0 && shake <= 0 && beamFlash.t <= 0 && !sparksLeft) {
          app.ticker.remove(tick);
          app.ticker.stop();
          app.render();
          resolve();
        }
      };
      app.ticker.add(tick);
      app.ticker.start();
    });

    function finish(f: Flight) {
      f.done = true;
      flights.removeChild(f.dot);
    }

    function addLabel(f: Flight, x: number, y: number): Text {
      const color = f.result.passed
        ? outcomeOf(f.result.status) === "bounced"
          ? C.amber
          : C.green
        : C.red;
      const t = new Text({
        text: verdictLine(f.result),
        style: {
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12,
          fill: color,
          fontWeight: "600",
        },
      });
      t.anchor.set(0.5, 1);
      t.position.set(x, y);
      fx.addChild(t);
      return t;
    }
  }

  return {
    play,
    reset,
    destroy() {
      ro.disconnect();
      app.destroy(true, { children: true });
    },
  };
}

function easeOut(k: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
}

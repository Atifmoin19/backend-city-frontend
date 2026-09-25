import { cssVar } from "@/lib/theme";

import { cablePoint, rooftop, type Scene } from "./scene";

/** Token palette, re-read when <html data-theme> changes. */
let cachedTheme = "";
let COLORS: ReturnType<typeof palette>;
function palette() {
  const ch = (n: string) => cssVar(`--bc-${n}-rgb`);
  return {
    cyan: cssVar("--bc-cyan"),
    green: cssVar("--bc-green"),
    amber: cssVar("--bc-amber"),
    red: cssVar("--bc-red"),
    bodyA: cssVar("--bc-body-a"),
    bodyB: cssVar("--bc-body-b"),
    window: cssVar("--bc-window"),
    cyanRgb: ch("cyan"),
    greenRgb: ch("green"),
    redRgb: ch("red"),
  };
}

export function render(ctx: CanvasRenderingContext2D, scene: Scene): void {
  const { width, height, groundY } = scene;
  const theme = document.documentElement.dataset.theme ?? "dark";
  if (theme !== cachedTheme) {
    cachedTheme = theme;
    COLORS = palette();
  }
  ctx.clearRect(0, 0, width, height);

  // Horizon haze
  const haze = ctx.createLinearGradient(0, height * 0.35, 0, groundY);
  haze.addColorStop(0, `rgb(${COLORS.cyanRgb} / 0)`);
  haze.addColorStop(1, `rgb(${COLORS.cyanRgb} / 0.06)`);
  ctx.fillStyle = haze;
  ctx.fillRect(0, height * 0.35, width, groundY - height * 0.35);

  // Cables at rest (internet -> gate -> towers)
  ctx.strokeStyle = `rgb(${COLORS.cyanRgb} / 0.2)`;
  ctx.lineWidth = 1;
  const gate = rooftop(scene, scene.gateIndex);
  const startY = height * (width < 700 ? 0.62 : 0.34);
  ctx.beginPath();
  ctx.moveTo(-20, startY);
  ctx.quadraticCurveTo((gate.x - 20) / 2, Math.min(gate.y, startY) - height * 0.08, gate.x, gate.y);
  ctx.stroke();
  for (let i = scene.gateIndex + 1; i < scene.towers.length; i++) {
    const end = rooftop(scene, i);
    ctx.beginPath();
    ctx.moveTo(gate.x, gate.y);
    ctx.quadraticCurveTo(
      (gate.x + end.x) / 2,
      Math.min(gate.y, end.y) - Math.min(120, Math.abs(end.x - gate.x) * 0.25),
      end.x,
      end.y,
    );
    ctx.stroke();
  }

  // Towers
  for (const t of scene.towers) {
    const top = groundY - t.h;
    ctx.fillStyle = t.tone > 0.5 ? COLORS.bodyA : COLORS.bodyB;
    ctx.fillRect(t.x, top, t.w, t.h);
    if (t.isGate) {
      ctx.fillStyle = COLORS.amber;
      ctx.shadowColor = COLORS.amber;
      ctx.shadowBlur = 14;
      ctx.fillRect(t.x - 2, top - 3, t.w + 4, 3);
      ctx.shadowBlur = 0;
    }
    const cw = t.w / t.cols;
    const rh = t.h / t.rows;
    for (let r = 0; r < t.rows; r++) {
      for (let c = 0; c < t.cols; c++) {
        const glow = t.lit[r * t.cols + c]!;
        ctx.fillStyle =
          glow > 0.1 ? `rgb(${COLORS.greenRgb} / ${(glow * 0.85).toFixed(3)})` : COLORS.window;
        ctx.fillRect(t.x + c * cw + cw * 0.28, top + r * rh + rh * 0.3, cw * 0.44, rh * 0.36);
      }
    }
  }

  // Ground line
  ctx.fillStyle = `rgb(${COLORS.cyanRgb} / 0.25)`;
  ctx.fillRect(0, groundY, width, 1);

  // Packets
  for (const p of scene.packets) {
    const pos = cablePoint(scene, p);
    const color = p.bouncing
      ? COLORS.amber
      : p.t > 0.45 && p.outcome === "crash"
        ? COLORS.red
        : COLORS.cyan;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Sparks (5xx)
  for (const s of scene.sparks) {
    ctx.fillStyle = `rgb(${COLORS.redRgb} / ${Math.min(1, s.life * 1.6).toFixed(3)})`;
    ctx.fillRect(s.x, s.y, 2, 2);
  }
}

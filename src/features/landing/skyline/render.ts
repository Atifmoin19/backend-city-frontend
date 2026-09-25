import { cablePoint, rooftop, type Scene } from "./scene";

const COLORS = {
  cyan: "#3ee6ff",
  green: "#4dff9a",
  amber: "#ffb547",
  red: "#ff4d6d",
  bodyA: "#0d1430",
  bodyB: "#111a3a",
  line: "rgba(62,230,255,0.13)",
  window: "rgba(170,190,255,0.07)",
};

export function render(ctx: CanvasRenderingContext2D, scene: Scene): void {
  const { width, height, groundY } = scene;
  ctx.clearRect(0, 0, width, height);

  // Horizon haze
  const haze = ctx.createLinearGradient(0, height * 0.35, 0, groundY);
  haze.addColorStop(0, "rgba(62,230,255,0)");
  haze.addColorStop(1, "rgba(62,230,255,0.06)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, height * 0.35, width, groundY - height * 0.35);

  // Cables at rest (internet -> gate -> towers)
  ctx.strokeStyle = COLORS.line;
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
        ctx.fillStyle = glow > 0.1 ? `rgba(77,255,154,${(glow * 0.85).toFixed(3)})` : COLORS.window;
        ctx.fillRect(t.x + c * cw + cw * 0.28, top + r * rh + rh * 0.3, cw * 0.44, rh * 0.36);
      }
    }
  }

  // Ground line
  ctx.fillStyle = "rgba(62,230,255,0.25)";
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
    ctx.fillStyle = `rgba(255,77,109,${Math.min(1, s.life * 1.6).toFixed(3)})`;
    ctx.fillRect(s.x, s.y, 2, 2);
  }
}

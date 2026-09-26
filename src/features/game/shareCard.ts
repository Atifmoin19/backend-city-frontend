import { cssVar } from "@/lib/theme";

export interface ShareCardData {
  name: string;
  game: string;
  district: string;
  score: number;
  stars: number;
}

const W = 1200;
const H = 630;

function font(varName: string, fallback: string) {
  // next/font exposes each family as a CSS variable (inherited by body)
  const family = getComputedStyle(document.body).getPropertyValue(varName).trim();
  return family ? `${family}, ${fallback}` : fallback;
}

function star(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    g.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
  }
  g.closePath();
}

/** A 1200x630 result card (the size social sites preview), drawn from the theme tokens. */
export async function drawShareCard(d: ShareCardData): Promise<Blob> {
  await document.fonts.ready;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const display = font("--font-unbounded", "Arial Black, sans-serif");
  const sans = font("--font-sora", "system-ui, sans-serif");
  const mono = font("--font-jetbrains", "monospace");

  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, cssVar("--bc-bg-0"));
  bg.addColorStop(1, cssVar("--bc-bg-2"));
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // skyline along the bottom, windows lit in the success colour
  g.fillStyle = cssVar("--bc-bg-3");
  const towers = [70, 150, 110, 190, 130, 220, 160, 100, 180, 140, 210, 120];
  towers.forEach((h, i) => {
    const x = 20 + i * 98;
    g.fillRect(x, H - h, 78, h);
    g.fillStyle = cssVar("--bc-green");
    for (let y = H - h + 14; y < H - 10; y += 22) {
      for (let wx = x + 12; wx < x + 66; wx += 20) {
        if ((wx + y + i) % 3 === 0) g.fillRect(wx, y, 8, 8);
      }
    }
    g.fillStyle = cssVar("--bc-bg-3");
  });

  g.fillStyle = cssVar("--bc-cyan");
  g.font = `600 26px ${mono}`;
  g.fillText("FULL STACK CITY · CHECKPOINT CLEARED", 72, 96);

  g.fillStyle = cssVar("--bc-text-1");
  g.font = `800 64px ${display}`;
  g.fillText(d.game, 72, 186, W - 144);

  g.fillStyle = cssVar("--bc-text-2");
  g.font = `400 30px ${sans}`;
  g.fillText(`${d.name} cleared ${d.district}`, 72, 240, W - 144);

  g.fillStyle = cssVar("--bc-green");
  g.font = `800 120px ${display}`;
  g.fillText(`${d.score}%`, 72, 380);

  for (let i = 0; i < 3; i++) {
    star(g, 520 + i * 78, 336, 30);
    g.fillStyle = i < d.stars ? cssVar("--bc-amber") : cssVar("--bc-line-strong");
    g.fill();
  }

  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas export failed"))), "image/png"),
  );
}

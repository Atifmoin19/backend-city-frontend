import type { Quiz, QuizItem } from "@/content/quizzes";

/** Small seeded PRNG (mulberry32) so a round is reproducible in tests. */
function prng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: readonly T[], rand: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** A new round: `draw` questions in random order, each with its options shuffled. */
export function buildRound(quiz: Quiz, seed: number): QuizItem[] {
  const rand = prng(seed);
  // placement keeps its order (skills alternate); drills are drawn at random
  const picked = quiz.kind === "placement" ? quiz.items : shuffle(quiz.items, rand);
  return picked.slice(0, quiz.draw).map((item) => {
    const order = shuffle(
      item.options.map((_, i) => i),
      rand,
    );
    return {
      ...item,
      options: order.map((i) => item.options[i]!),
      correct: order.indexOf(item.correct),
    };
  });
}

export interface Answer {
  picked: number | null; // null = the clock ran out
  correct: boolean;
}

export interface Tally {
  score: number;
  combo: number;
  bestCombo: number;
}

/** Score and combos: a combo is a run of consecutive right answers. */
export function tally(answers: readonly Answer[]): Tally {
  let combo = 0;
  let bestCombo = 0;
  let score = 0;
  for (const a of answers) {
    if (a.correct) {
      score++;
      combo++;
      bestCombo = Math.max(bestCombo, combo);
    } else combo = 0;
  }
  return { score, combo, bestCombo };
}

/** Right answers per skill (placement). */
export function bySkill(items: readonly QuizItem[], answers: readonly Answer[]) {
  const out = { python: 0, http: 0 };
  items.forEach((item, i) => {
    if (item.skill && answers[i]?.correct) out[item.skill]++;
  });
  return out;
}

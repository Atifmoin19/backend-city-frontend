import type { DistrictKey } from "../districts";

export interface QuizOption {
  text: string;
  code?: boolean;
}

export interface QuizItem {
  prompt: string; // `backticks` render as code
  code?: { file: string; source: string; highlight?: number[] };
  options: QuizOption[];
  correct: number; // index into options (options are shuffled per round)
  explain: string;
  /** Placement only: which skill the question measures. */
  skill?: "python" | "http";
}

/**
 * Revision drills graded in the browser, like lesson checks (ideology 6.2). They never gate
 * progress; the API only keeps scores.
 * - speed: timed, instant feedback, combos (Status Code Speed Round)
 * - pick: untimed, choose the line that makes the code right, explanation after each
 * - placement: no feedback until the end; suggests a starting district
 */
export interface Quiz {
  slug: string;
  title: string;
  kind: "speed" | "pick" | "placement";
  /** Where it's listed as extra practice (the daily challenge has none). */
  district?: DistrictKey;
  blurb: string;
  seconds?: number; // speed rounds: the whole round's clock
  draw: number; // questions per round, drawn from `items`
  items: QuizItem[];
}

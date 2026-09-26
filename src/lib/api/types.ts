/** Shapes returned by the backend (see backend docs/API.md). */

export type Role = "user" | "content_editor" | "super_admin";

export interface UserPublic {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  is_verified: boolean;
  /** Finished the first-run orientation (/welcome). */
  onboarded: boolean;
  /** Track slug chosen at signup ("Which side of the city?"). */
  learning_goal: string | null;
  start_district: string | null;
}

export interface TrackPublic {
  slug: string;
  title: string;
  description: string;
  status: "open" | "coming_soon";
}

export interface AuthResponse {
  user: UserPublic;
}

export interface SimRequest {
  method: string;
  path: string;
  json?: unknown;
  query?: string;
  headers?: Record<string, string>;
}

export interface PublicTest {
  name: string;
  request: SimRequest;
  expect_status: number;
  /** Keys/values the response JSON must contain (routing games). Null = status only. */
  expect_body?: unknown;
}

export type GameMode = "practice" | "checkpoint";

export interface GameVariant {
  slug: string;
  mode: GameMode;
  version: number;
  /** Topic slug this game belongs to. */
  topic: string;
  game_type: string;
  title: string;
  district: string;
  character: string;
  visualizer: string;
  is_checkpoint: boolean;
  pass_threshold: number;
  scenario: { intro: string; goal: string };
  /** One sentence: what winning looks like. */
  objective: string;
  /** The exact requirements for this variant, one per item (may contain `code`). */
  rules: string[];
  starter_code: string;
  editable_region: { start_marker: string; end_marker: string };
  public_tests: PublicTest[];
  hint_tiers: number[];
  dialogue: { start: string; success: string; fail: string };
  seed: number;
  attempt_token: string;
  harness_version: string;
}

export interface Hint {
  tier: number;
  text: string;
}

export type GradeVerdict = "graded" | "rejected" | "load_error" | "timeout" | "crashed";

export interface GradeResponse {
  verdict: GradeVerdict;
  /** After the hint penalty. */
  score: number;
  raw_score: number;
  hints_used: number;
  hint_penalty: number;
  passed: boolean;
  stars: number;
  pass_threshold: number;
  public_results: { name: string; expect_status: number; status: number; passed: boolean }[];
  hidden_passed: number;
  hidden_total: number;
  violations: { line: number; message: string }[];
  error: string | null;
  /** Set when a retest cooldown started after this failed attempt. */
  retry_at: string | null;
}

export interface CheckpointProgress {
  best_score: number;
  stars: number;
  attempts: number;
  passed: boolean;
  passed_at: string | null;
}

export interface TopicProgress {
  topic: string;
  track: string;
  status: "locked" | "unlocked" | "passed";
  complete: boolean;
  lesson_done: boolean;
  practice_games: string[];
  checkpoint_game: string | null;
  /** Live games in play order (hidden ones are left out). */
  games?: { slug: string; title: string; objective: string; is_checkpoint: boolean }[];
  practice_passed: string[];
  checkpoint: CheckpointProgress | null;
  consecutive_fails: number;
  retry_at: string | null;
}

export interface Progress {
  onboarded: boolean;
  topics: TopicProgress[];
}

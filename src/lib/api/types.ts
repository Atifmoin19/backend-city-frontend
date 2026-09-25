/** Shapes returned by the backend (see backend docs/API.md). */

export type Role = "user" | "content_editor" | "super_admin";

export interface UserPublic {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  is_verified: boolean;
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
}

export interface GameVariant {
  slug: string;
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
  score: number;
  passed: boolean;
  stars: number;
  pass_threshold: number;
  public_results: { name: string; expect_status: number; status: number; passed: boolean }[];
  hidden_passed: number;
  hidden_total: number;
  violations: { line: number; message: string }[];
  error: string | null;
}

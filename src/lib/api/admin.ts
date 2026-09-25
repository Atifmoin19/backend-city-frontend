import { api } from "./client";
import type { Progress, Role } from "./types";

/** Admin shapes (backend app/schemas/admin.py). Server-only content lives here: admins only. */

export type ContentStatus = "draft" | "published";

export interface AdminGameSummary {
  slug: string;
  title: string;
  game_type: string;
  is_checkpoint: boolean;
  status: ContentStatus;
  current_version: number | null;
  latest_version: number;
}

export interface AdminTopic {
  slug: string;
  title: string;
  status: ContentStatus;
  pass_threshold: number;
  hints_allowed: boolean;
  retest_cooldown_minutes: number;
  games: AdminGameSummary[];
}

export interface AdminLevel {
  slug: string;
  title: string;
  district_key: string;
  topics: AdminTopic[];
}

export interface GameBody {
  title: string;
  character: string;
  visualizer: string;
  scenario: Record<string, string>;
  objective: string;
  rules: string[];
  variant_params: Record<string, unknown[]>;
  starter_code: string;
  editable_region: { start_marker: string; end_marker: string };
  public_tests: unknown[];
  hidden_tests: Record<string, unknown>;
  reference_solution: string;
  hints: { tier: number; text: string }[];
  dialogue: Record<string, string>;
}

export interface AdminVersion {
  version: number;
  created_at: string;
  created_by: string | null;
  is_current: boolean;
}

export interface AdminGame {
  slug: string;
  topic: string;
  district: string;
  game_type: string;
  is_checkpoint: boolean;
  status: ContentStatus;
  pass_threshold: number;
  version: number;
  is_current: boolean;
  body: GameBody;
  versions: AdminVersion[];
}

export interface TestRunCase {
  name: string;
  hidden: boolean;
  request: { method: string; path: string; query?: string; json?: unknown };
  expect_status: number;
  expect_body: unknown;
  status: number | null;
  passed: boolean;
}

export interface TestRunResult {
  version: number;
  seed: number;
  params: Record<string, unknown>;
  verdict: string;
  score: number;
  passed: boolean;
  error: string | null;
  violations: string[];
  cases: TestRunCase[];
  starter_score: number | null;
  issues: string[];
}

export interface TopicSettings {
  pass_threshold?: number;
  hints_allowed?: boolean;
  retest_cooldown_minutes?: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  is_blocked: boolean;
  created_at: string;
  last_active_at: string | null;
  topics_passed: number;
  checkpoint_attempts: number;
}

export interface AdminUserDetail {
  user: AdminUserRow;
  progress: Progress;
  attempts: {
    game: string;
    version: number;
    is_checkpoint: boolean;
    score: number | null;
    passed: boolean;
    hints_used: number;
    created_at: string;
  }[];
}

const game = (slug: string) => `/admin/games/${encodeURIComponent(slug)}`;
const user = (id: string) => `/admin/users/${encodeURIComponent(id)}`;

export const adminApi = {
  content: () => api<{ levels: AdminLevel[] }>("/admin/content"),
  updateTopic: (slug: string, body: TopicSettings) =>
    api<{ levels: AdminLevel[] }>(`/admin/topics/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      body,
    }),
  game: (slug: string, version?: number) =>
    api<AdminGame>(`${game(slug)}${version ? `?version=${version}` : ""}`),
  saveVersion: (slug: string, body: GameBody) =>
    api<AdminGame>(`${game(slug)}/versions`, { method: "POST", body }),
  testRun: (slug: string, body: { version: number; seed?: number; snippet?: string }) =>
    api<TestRunResult>(`${game(slug)}/test-run`, { method: "POST", body }),
  publish: (slug: string, version: number) =>
    api<AdminGame>(`${game(slug)}/publish`, { method: "POST", body: { version } }),
  setStatus: (slug: string, status: ContentStatus) =>
    api<AdminGame>(game(slug), { method: "PATCH", body: { status } }),
  users: (q: string, offset: number) =>
    api<{ total: number; users: AdminUserRow[] }>(
      `/admin/users?limit=25&offset=${offset}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
    ),
  user: (id: string) => api<AdminUserDetail>(user(id)),
  block: (id: string, blocked: boolean) =>
    api<AdminUserDetail>(`${user(id)}/block`, { method: "POST", body: { blocked } }),
  role: (id: string, role: Role) =>
    api<AdminUserDetail>(`${user(id)}/role`, { method: "POST", body: { role } }),
  reset: (id: string) => api<AdminUserDetail>(`${user(id)}/reset`, { method: "POST" }),
};

export const isAdmin = (role: Role | undefined) =>
  role === "content_editor" || role === "super_admin";

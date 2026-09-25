"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import { useSession } from "@/features/auth/useSession";
import { adminApi, type AdminUserDetail } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/errors";
import type { Role } from "@/lib/api/types";

import { when } from "./UsersScreen";

const ROLES: Role[] = ["user", "content_editor", "super_admin"];

/** One learner's journey: every topic, every attempt, and account actions (super admin). */
export function UserDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data: me } = useSession();
  const key = ["admin", "user", id];
  const detail = useQuery({ queryKey: key, queryFn: () => adminApi.user(id) });
  const onDone = (d: AdminUserDetail) => {
    qc.setQueryData(key, d);
    void qc.invalidateQueries({ queryKey: ["admin", "users"] });
  };
  const block = useMutation({
    mutationFn: (b: boolean) => adminApi.block(id, b),
    onSuccess: onDone,
  });
  const role = useMutation({ mutationFn: (r: Role) => adminApi.role(id, r), onSuccess: onDone });
  const reset = useMutation({ mutationFn: () => adminApi.reset(id), onSuccess: onDone });
  const failure = [block, role, reset].find((m) => m.isError)?.error;

  if (detail.isPending) return <p className="px-8 py-10 text-text-2">Loading…</p>;
  if (detail.isError) {
    return (
      <p role="alert" className="px-8 py-10 text-red">
        {detail.error.message}
      </p>
    );
  }
  const { user, progress, attempts } = detail.data;
  const superAdmin = me?.role === "super_admin" && me.id !== user.id;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1"
      >
        <ArrowLeft aria-hidden className="size-4" /> All learners
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SignHeading as="h1" className="text-3xl">
            {user.display_name}
          </SignHeading>
          <p className="mt-1 text-text-2">
            {user.email} · {user.role} · joined {when(user.created_at)} · last active{" "}
            {when(user.last_active_at)}
          </p>
        </div>
        {user.is_blocked ? <StatusLight status="crash">Blocked</StatusLight> : null}
      </div>

      {superAdmin ? (
        <Panel className="mt-6 flex flex-wrap items-center gap-3 p-4">
          <Button
            size="sm"
            variant={user.is_blocked ? "ghost" : "danger"}
            loading={block.isPending}
            onClick={() => block.mutate(!user.is_blocked)}
          >
            {user.is_blocked ? "Unblock" : "Block account"}
          </Button>
          <label className="flex items-center gap-2 text-sm text-text-2">
            Role
            <select
              value={user.role}
              onChange={(e) => role.mutate(e.target.value as Role)}
              className="h-8 rounded-md border border-line-strong bg-bg-1 px-2 text-text-1"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <Button
            size="sm"
            variant="quiet"
            loading={reset.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Delete all attempts and progress for ${user.email}? This can't be undone.`,
                )
              ) {
                reset.mutate();
              }
            }}
          >
            Reset progress
          </Button>
          {failure ? (
            <span role="alert" className="text-sm text-red">
              {failure instanceof ApiError ? failure.message : "Action failed"}
            </span>
          ) : null}
        </Panel>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-sm font-semibold text-text-1">Topics</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {progress.topics.map((t) => (
              <li key={t.topic} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <span className="min-w-40 flex-1 text-text-1">{t.topic}</span>
                {t.complete ? (
                  <span className="inline-flex items-center gap-1 text-green">
                    <Check aria-hidden className="size-4" /> complete
                  </span>
                ) : (
                  <span className="text-text-3">{t.status}</span>
                )}
                <span className="text-xs text-text-3">
                  briefing {t.lesson_done ? "✓" : "–"} · practice {t.practice_passed.length}/
                  {t.practice_games.length}
                  {t.checkpoint
                    ? ` · best ${t.checkpoint.best_score}% · ${t.checkpoint.stars}★ · ${t.checkpoint.attempts} tries`
                    : ""}
                  {t.consecutive_fails >= 2 ? ` · ${t.consecutive_fails} fails in a row` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-sm font-semibold text-text-1">Recent attempts</h2>
          {attempts.length === 0 ? <p className="mt-3 text-sm text-text-3">None yet.</p> : null}
          <ul className="mt-3 divide-y divide-line text-sm">
            {attempts.map((a, i) => (
              <li key={`${a.created_at}-${i}`} className="flex items-center gap-3 py-2">
                <StatusLight
                  status={a.passed ? "pass" : a.score === null ? "locked" : "bounce"}
                  iconOnly
                >
                  {a.passed ? "passed" : "not passed"}
                </StatusLight>
                <span className="flex-1 text-text-1">
                  {a.game} <span className="font-mono text-xs text-text-3">v{a.version}</span>
                  <span className="ml-2 text-xs text-text-3">
                    {a.is_checkpoint ? "checkpoint" : "practice"}
                  </span>
                </span>
                <span className="tabular text-text-2">
                  {a.score === null ? "open" : `${a.score}%`}
                </span>
                <span className="text-xs text-text-3">{a.hints_used} hints</span>
                <span className="text-xs text-text-3">{when(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

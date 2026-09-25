"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, FlaskConical, Rocket, Save } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import { adminApi, type AdminGame, type GameBody } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";

import { CONTENT_KEY } from "./ContentScreen";
import { TestRunPanel } from "./TestRunPanel";

const JSON_FIELDS = [
  ["variant_params", "Variant params", "Each key lists the options a variant picks from."],
  ["public_tests", "Public tests", "Shown to learners. {{placeholders}} are filled per variant."],
  ["hidden_tests", "Hidden tests", 'Server only: {"tests": [...]} or {"generator": "name"}.'],
  ["hints", "Hints", "Tier 1 to 3, fetched one at a time; each lowers the max score."],
  ["dialogue", "Dialogue", "start / success / fail lines for the character."],
] as const;
type JsonKey = (typeof JSON_FIELDS)[number][0];

interface Draft {
  body: GameBody;
  json: Record<JsonKey, string>;
  rules: string;
}

function draftOf(body: GameBody): Draft {
  const json = Object.fromEntries(
    JSON_FIELDS.map(([k]) => [k, JSON.stringify(body[k], null, 2)]),
  ) as Record<JsonKey, string>;
  return { body, json, rules: body.rules.join("\n") };
}

/** Parsed body, or the first JSON field that doesn't parse. */
function bodyOf(d: Draft): { body: GameBody } | { error: string } {
  const body = {
    ...d.body,
    rules: d.rules
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean),
  };
  for (const [key, label] of JSON_FIELDS) {
    try {
      (body as Record<string, unknown>)[key] = JSON.parse(d.json[key]);
    } catch {
      return { error: `${label} is not valid JSON` };
    }
  }
  return { body };
}

const gameKey = (slug: string, version?: number) => ["admin", "game", slug, version ?? "live"];

export function GameEditor({ slug }: { slug: string }) {
  const [version, setVersion] = useState<number | undefined>(undefined);
  const game = useQuery({
    queryKey: gameKey(slug, version),
    queryFn: () => adminApi.game(slug, version),
  });
  if (game.isPending) return <p className="px-8 py-10 text-text-2">Loading the game…</p>;
  if (game.isError) {
    return (
      <p role="alert" className="px-8 py-10 text-red">
        {game.error.message}
      </p>
    );
  }
  // Keyed: switching versions (or publishing) starts a fresh draft from that version
  return (
    <VersionEditor
      key={`${game.data.version}-${game.data.is_current}-${game.data.status}`}
      slug={slug}
      loaded={game.data}
      onVersion={setVersion}
    />
  );
}

function VersionEditor({
  slug,
  loaded,
  onVersion,
}: {
  slug: string;
  loaded: AdminGame;
  onVersion: (version: number) => void;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(() => draftOf(loaded.body));
  const setVersion = onVersion;
  const parsed = useMemo(() => bodyOf(draft), [draft]);
  const dirty =
    "body" in parsed ? JSON.stringify(parsed.body) !== JSON.stringify(loaded.body) : true;

  const show = (g: AdminGame) => {
    qc.setQueryData(gameKey(slug, g.version), g);
    setVersion(g.version);
    void qc.invalidateQueries({ queryKey: CONTENT_KEY });
  };
  const save = useMutation({
    mutationFn: (body: GameBody) => adminApi.saveVersion(slug, body),
    onSuccess: show,
  });
  const publish = useMutation({
    mutationFn: (v: number) => adminApi.publish(slug, v),
    onSuccess: (g) => {
      show(g);
      void qc.invalidateQueries({ queryKey: gameKey(slug) });
    },
  });
  const visibility = useMutation({
    mutationFn: (status: "draft" | "published") => adminApi.setStatus(slug, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "game", slug] });
      void qc.invalidateQueries({ queryKey: CONTENT_KEY });
    },
  });

  const set = (patch: Partial<GameBody>) =>
    setDraft({ ...draft, body: { ...draft.body, ...patch } });
  const latest = loaded.versions[0]?.version ?? loaded.version;
  const errorOf = (e: unknown) => (e instanceof ApiError ? e.message : "Request failed");

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1"
      >
        <ArrowLeft aria-hidden className="size-4" /> All content
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-text-3">
            {loaded.district} / {loaded.topic} / {loaded.slug} · {loaded.game_type} ·{" "}
            {loaded.is_checkpoint ? "checkpoint" : "practice"} · pass {loaded.pass_threshold}%
          </p>
          <SignHeading as="h1" className="mt-1 text-3xl">
            {loaded.body.title}
          </SignHeading>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {loaded.status === "published" ? (
            <Button
              variant="quiet"
              size="sm"
              icon={<EyeOff aria-hidden className="size-4" />}
              loading={visibility.isPending}
              onClick={() => visibility.mutate("draft")}
            >
              Hide from learners
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye aria-hidden className="size-4" />}
              loading={visibility.isPending}
              onClick={() => visibility.mutate("published")}
            >
              Show to learners
            </Button>
          )}
        </div>
      </div>

      {/* Versions */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Versions">
        {loaded.versions.map((v) => (
          <button
            key={v.version}
            type="button"
            onClick={() => setVersion(v.version)}
            aria-pressed={v.version === loaded.version}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
              v.version === loaded.version
                ? "border-cyan text-cyan"
                : "border-line text-text-2 hover:border-line-strong",
            )}
            title={`${v.created_by ?? "seed files"} · ${new Date(v.created_at).toLocaleString()}`}
          >
            v{v.version}
            {v.is_current ? " · live" : ""}
          </button>
        ))}
        {loaded.status === "draft" ? (
          <StatusLight status="locked" className="ml-2">
            Hidden from learners
          </StatusLight>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if ("body" in parsed) save.mutate(parsed.body);
          }}
        >
          <Panel className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Title">
              <input
                value={draft.body.title}
                onChange={(e) => set({ title: e.target.value })}
                className={INPUT}
              />
            </Field>
            <Field label="Character">
              <select
                value={draft.body.character}
                onChange={(e) => set({ character: e.target.value })}
                className={INPUT}
              >
                {["byte", "bouncer"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Objective (one sentence)" wide>
              <input
                value={draft.body.objective}
                onChange={(e) => set({ objective: e.target.value })}
                className={INPUT}
              />
            </Field>
            <Field label="Scenario intro" wide>
              <textarea
                rows={2}
                value={draft.body.scenario.intro ?? ""}
                onChange={(e) =>
                  set({ scenario: { ...draft.body.scenario, intro: e.target.value } })
                }
                className={AREA}
              />
            </Field>
            <Field label="Scenario goal" wide>
              <textarea
                rows={2}
                value={draft.body.scenario.goal ?? ""}
                onChange={(e) =>
                  set({ scenario: { ...draft.body.scenario, goal: e.target.value } })
                }
                className={AREA}
              />
            </Field>
            <Field label="Rules (one per line)" wide>
              <textarea
                rows={4}
                value={draft.rules}
                onChange={(e) => setDraft({ ...draft, rules: e.target.value })}
                className={AREA}
              />
            </Field>
          </Panel>

          <Panel className="grid gap-4 p-5">
            <Field label="Starter code (learners edit only between the markers)">
              <textarea
                rows={18}
                spellCheck={false}
                value={draft.body.starter_code}
                onChange={(e) => set({ starter_code: e.target.value })}
                className={cn(AREA, CODE)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start marker">
                <input
                  value={draft.body.editable_region.start_marker}
                  onChange={(e) =>
                    set({
                      editable_region: {
                        ...draft.body.editable_region,
                        start_marker: e.target.value,
                      },
                    })
                  }
                  className={cn(INPUT, CODE)}
                />
              </Field>
              <Field label="End marker">
                <input
                  value={draft.body.editable_region.end_marker}
                  onChange={(e) =>
                    set({
                      editable_region: {
                        ...draft.body.editable_region,
                        end_marker: e.target.value,
                      },
                    })
                  }
                  className={cn(INPUT, CODE)}
                />
              </Field>
            </div>
            <Field label="Reference solution (server only; must score 100%)">
              <textarea
                rows={6}
                spellCheck={false}
                value={draft.body.reference_solution}
                onChange={(e) => set({ reference_solution: e.target.value })}
                className={cn(AREA, CODE)}
              />
            </Field>
          </Panel>

          <Panel className="grid gap-4 p-5">
            {JSON_FIELDS.map(([key, label, hint]) => (
              <Field key={key} label={label} hint={hint}>
                <textarea
                  rows={key === "public_tests" || key === "hidden_tests" ? 12 : 6}
                  spellCheck={false}
                  value={draft.json[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, json: { ...draft.json, [key]: e.target.value } })
                  }
                  className={cn(AREA, CODE)}
                />
              </Field>
            ))}
          </Panel>

          <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-line bg-bg-0/95 py-3 backdrop-blur">
            <Button
              type="submit"
              icon={<Save aria-hidden className="size-4" />}
              disabled={!dirty || "error" in parsed}
              loading={save.isPending}
            >
              Save as draft v{latest + 1}
            </Button>
            <Button
              type="button"
              variant="quiet"
              disabled={!dirty}
              onClick={() => setDraft(draftOf(loaded.body))}
            >
              Discard changes
            </Button>
            {"error" in parsed ? (
              <span role="alert" className="text-sm text-red">
                {parsed.error}
              </span>
            ) : null}
            {save.isError ? (
              <span role="alert" className="text-sm text-red">
                {errorOf(save.error)}
              </span>
            ) : null}
          </div>
        </form>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <Panel className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1">
              <Rocket aria-hidden className="size-4 text-green" /> Publish
            </h2>
            {loaded.is_current ? (
              <p className="mt-2 text-sm text-text-2">
                v{loaded.version} is live: learners play it now.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-text-2">
                  Make v{loaded.version} the version learners play. The server first runs its
                  reference solution on three fixed variants; anything short of 100% blocks it.
                  Attempts already started keep their version.
                </p>
                <Button
                  variant="success"
                  size="sm"
                  className="mt-3"
                  disabled={dirty}
                  loading={publish.isPending}
                  onClick={() => publish.mutate(loaded.version)}
                >
                  Publish v{loaded.version}
                </Button>
                {dirty ? (
                  <p className="mt-2 text-xs text-amber">Save or discard your edits first.</p>
                ) : null}
                {publish.isError ? (
                  <p role="alert" className="mt-2 text-sm text-red">
                    {errorOf(publish.error)}
                  </p>
                ) : null}
              </>
            )}
          </Panel>
          <Panel className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-1">
              <FlaskConical aria-hidden className="size-4 text-purple" /> Test-run v{loaded.version}
            </h2>
            <TestRunPanel slug={slug} version={loaded.version} stale={dirty} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

const INPUT =
  "h-10 w-full rounded-md border border-line-strong bg-bg-1 px-3 text-sm text-text-1 focus:border-cyan focus:outline-none";
const AREA =
  "w-full rounded-md border border-line-strong bg-bg-1 px-3 py-2 text-sm text-text-1 focus:border-cyan focus:outline-none";
const CODE = "bg-editor font-mono text-[0.8rem] leading-relaxed";

function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <span className="text-sm font-medium text-text-1">{label}</span>
      {children}
      {hint ? <span className="text-xs text-text-3">{hint}</span> : null}
    </label>
  );
}

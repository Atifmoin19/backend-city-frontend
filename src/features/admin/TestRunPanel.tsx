"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { StatusLight } from "@/components/ui/StatusLight";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/errors";

/** Run a saved version on one variant (reference solution, or a learner-style answer). */
export function TestRunPanel({
  slug,
  version,
  stale,
}: {
  slug: string;
  version: number;
  stale: boolean;
}) {
  const [seed, setSeed] = useState("");
  const [snippet, setSnippet] = useState("");
  const run = useMutation({
    mutationFn: () =>
      adminApi.testRun(slug, {
        version,
        seed: seed ? Number(seed) : undefined,
        snippet: snippet.trim() ? snippet : undefined,
      }),
  });
  const r = run.data?.version === version ? run.data : undefined;

  return (
    <div className="mt-3 flex flex-col gap-3 text-sm">
      {stale ? (
        <p className="text-xs text-amber">Runs the saved v{version}, not your unsaved edits.</p>
      ) : null}
      <label className="flex items-center gap-2 text-text-2">
        Seed
        <input
          inputMode="numeric"
          placeholder="random"
          value={seed}
          onChange={(e) => setSeed(e.target.value.replace(/\D/g, ""))}
          className="h-8 w-28 rounded-md border border-line-strong bg-bg-1 px-2 font-mono text-text-1 focus:border-cyan focus:outline-none"
        />
      </label>
      <details>
        <summary className="cursor-pointer text-text-2">Try a learner answer instead</summary>
        <textarea
          rows={5}
          spellCheck={false}
          value={snippet}
          onChange={(e) => setSnippet(e.target.value)}
          placeholder="Lines for the editable region. Empty = reference solution."
          className="mt-2 w-full rounded-md border border-line-strong bg-editor px-3 py-2 font-mono text-[0.8rem] text-text-1 focus:border-cyan focus:outline-none"
        />
      </details>
      <Button size="sm" variant="ghost" loading={run.isPending} onClick={() => run.mutate()}>
        Run {snippet.trim() ? "this answer" : "reference solution"}
      </Button>
      {run.isError ? (
        <p role="alert" className="text-red">
          {run.error instanceof ApiError ? run.error.message : "Test-run failed"}
        </p>
      ) : null}

      {r ? (
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <StatusLight status={r.passed ? "pass" : "bounce"}>
              {r.verdict === "graded" ? `${r.score}%` : r.verdict}
            </StatusLight>
            <span className="text-text-3">
              seed {r.seed} · starter scores {r.starter_score ?? "–"}%
            </span>
          </div>
          {r.issues.length ? (
            <ul className="list-inside list-disc text-amber">
              {r.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          ) : (
            <p className="text-green">Ready to publish on this variant.</p>
          )}
          {r.error || r.violations.length ? (
            <pre className="max-h-32 overflow-auto rounded-md bg-editor p-2 font-mono text-xs text-red">
              {[r.error, ...r.violations].filter(Boolean).join("\n")}
            </pre>
          ) : null}
          <p className="font-mono text-xs break-words text-text-3">
            {Object.entries(r.params)
              .map(([k, v]) => `${k}=${String(v)}`)
              .join("  ")}
          </p>
          <ul className="flex max-h-96 flex-col divide-y divide-line overflow-auto rounded-md border border-line">
            {r.cases.map((c) => (
              <li key={`${c.hidden}-${c.name}`} className="flex items-start gap-2 px-2.5 py-1.5">
                <StatusLight status={c.passed ? "pass" : "crash"} iconOnly>
                  {c.passed ? "passed" : "failed"}
                </StatusLight>
                <span className="min-w-0 flex-1">
                  <span className="text-text-1">{c.name}</span>
                  {c.hidden ? <span className="ml-1.5 text-xs text-purple">hidden</span> : null}
                  <span className="block truncate font-mono text-xs text-text-3">
                    {c.request.method} {c.request.path}
                    {c.request.query ? `?${c.request.query}` : ""}
                  </span>
                </span>
                <span className="tabular font-mono text-xs text-text-2">
                  {c.status ?? "–"}/{c.expect_status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

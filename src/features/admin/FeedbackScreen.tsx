"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { SignHeading } from "@/components/ui/SignHeading";
import { insightsApi, type FeedbackStatus } from "@/lib/api/insights";
import { cn } from "@/lib/cn";

const TABS: { key: FeedbackStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "seen", label: "Seen" },
  { key: "done", label: "Done" },
];
const KIND_LABEL = { bug: "Bug", idea: "Idea", content: "Content", other: "Other" } as const;
const when = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Learner feedback, triaged new → seen → done. */
export function FeedbackScreen() {
  const [tab, setTab] = useState<FeedbackStatus>("new");
  const qc = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: ["admin", "feedback", tab],
    queryFn: () => insightsApi.feedback(tab),
  });
  const move = useMutation({
    mutationFn: (a: { id: string; status: FeedbackStatus }) =>
      insightsApi.setFeedbackStatus(a.id, a.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feedback"] }),
  });
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <SignHeading as="h1" className="text-3xl">
        Feedback
      </SignHeading>
      <div role="tablist" aria-label="Status" className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              tab === t.key
                ? "border-cyan bg-bg-3 text-text-1"
                : "border-line text-text-2 hover:text-text-1",
            )}
          >
            {t.label} <span className="tabular text-text-3">{data?.counts[t.key] ?? ""}</span>
          </button>
        ))}
      </div>
      {isPending ? (
        <p className="mt-6 text-text-3">Loading…</p>
      ) : !data?.items.length ? (
        <p className="mt-6 text-text-3">Nothing here.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {data.items.map((f) => (
            <li key={f.id} className="rounded-lg border border-line bg-bg-1 p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-3">
                <span className="rounded-sm border border-line-strong px-1.5 py-0.5 font-semibold text-text-1">
                  {KIND_LABEL[f.kind]}
                </span>
                <span>{f.user_name ?? "Deleted account"}</span>
                {f.user_email ? <span>{f.user_email}</span> : null}
                <span>{when.format(new Date(f.created_at))}</span>
                {f.game_slug ? <span className="font-mono">game: {f.game_slug}</span> : null}
                {f.page ? <span className="font-mono">{f.page}</span> : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-text-1">{f.message}</p>
              <div className="mt-3 flex gap-2">
                {TABS.filter((t) => t.key !== f.status).map((t) => (
                  <Button
                    key={t.key}
                    size="sm"
                    variant="ghost"
                    loading={
                      move.isPending &&
                      move.variables?.id === f.id &&
                      move.variables.status === t.key
                    }
                    onClick={() => move.mutate({ id: f.id, status: t.key })}
                  >
                    Mark {t.label.toLowerCase()}
                  </Button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

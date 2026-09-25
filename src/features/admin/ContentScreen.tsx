"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import { adminApi, type AdminTopic } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/errors";

export const CONTENT_KEY = ["admin", "content"] as const;

/** Every district, topic and game, with what learners play now and what is still a draft. */
export function ContentScreen() {
  const content = useQuery({ queryKey: CONTENT_KEY, queryFn: adminApi.content });
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <SignHeading as="h1" className="text-3xl">
        Content
      </SignHeading>
      <p className="mt-2 max-w-2xl text-text-2">
        Edits are saved as new draft versions. Learners keep playing the live version until you
        publish; publishing re-checks the reference solution on fixed variants first.
      </p>
      {content.isPending ? <p className="mt-8 text-text-2">Loading content…</p> : null}
      {content.isError ? (
        <p role="alert" className="mt-8 text-red">
          Couldn&apos;t load content: {content.error.message}
        </p>
      ) : null}
      {content.data?.tracks.length ? (
        <Panel className="mt-8 p-5">
          <h2 className="text-sm font-semibold text-text-1">Sides of the city</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {content.data.tracks.map((t) => (
              <li key={t.slug} className="rounded-md border border-line bg-bg-1 px-4 py-3">
                <p className="text-sm text-text-1">
                  {t.title} <span className="font-mono text-xs text-text-3">{t.slug}</span>
                </p>
                <p className="mt-1 text-xs text-text-2">
                  {t.status === "published" ? "Open" : "Coming soon"} ·{" "}
                  <span className="tabular font-semibold text-text-1">{t.interested}</span> want it
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
      <div className="mt-8 flex flex-col gap-10">
        {content.data?.levels.map((level) => (
          <section key={level.slug} aria-labelledby={`level-${level.slug}`}>
            <h2 id={`level-${level.slug}`} className="font-display text-xl font-semibold">
              {level.title}
              <span className="ml-3 font-mono text-xs font-normal text-text-3">
                {level.district_key}
              </span>
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {level.topics.map((topic) => (
                <TopicPanel key={topic.slug} topic={topic} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function TopicPanel({ topic }: { topic: AdminTopic }) {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-semibold text-text-1">
          {topic.title} <span className="font-mono text-xs text-text-3">{topic.slug}</span>
        </h3>
      </div>
      <TopicSettingsForm topic={topic} />
      {topic.games.length === 0 ? (
        <p className="mt-4 text-sm text-text-3">Briefing only: no games.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Games in {topic.title}</caption>
          <thead className="text-left text-xs text-text-3">
            <tr className="border-b border-line">
              <th scope="col" className="py-2 font-medium">
                Game
              </th>
              <th scope="col" className="py-2 font-medium">
                Role
              </th>
              <th scope="col" className="py-2 font-medium">
                Visible
              </th>
              <th scope="col" className="py-2 font-medium">
                Versions
              </th>
              <th scope="col" className="py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {topic.games.map((g) => (
              <tr key={g.slug}>
                <td className="py-2.5">
                  <span className="text-text-1">{g.title}</span>{" "}
                  <span className="font-mono text-xs text-text-3">{g.slug}</span>
                </td>
                <td className="py-2.5 text-text-2">
                  {g.is_checkpoint ? "Checkpoint" : "Practice"}
                </td>
                <td className="py-2.5">
                  {g.status === "published" ? (
                    <StatusLight status="pass">Published</StatusLight>
                  ) : (
                    <StatusLight status="locked">Hidden</StatusLight>
                  )}
                </td>
                <td className="py-2.5 font-mono text-xs text-text-2">
                  live v{g.current_version ?? "–"}
                  {g.latest_version > (g.current_version ?? 0) ? (
                    <span className="ml-2 rounded-sm border border-amber/50 px-1.5 py-0.5 text-amber">
                      draft v{g.latest_version}
                    </span>
                  ) : null}
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/admin/games/${g.slug}`}
                    className="inline-flex items-center gap-1.5 text-cyan hover:underline"
                  >
                    <Pencil aria-hidden className="size-3.5" /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function TopicSettingsForm({ topic }: { topic: AdminTopic }) {
  const qc = useQueryClient();
  const [threshold, setThreshold] = useState(topic.pass_threshold);
  const [cooldown, setCooldown] = useState(topic.retest_cooldown_minutes);
  const [hints, setHints] = useState(topic.hints_allowed);
  const save = useMutation({
    mutationFn: () =>
      adminApi.updateTopic(topic.slug, {
        pass_threshold: threshold,
        retest_cooldown_minutes: cooldown,
        hints_allowed: hints,
      }),
    onSuccess: (data) => qc.setQueryData(CONTENT_KEY, data),
  });
  const dirty =
    threshold !== topic.pass_threshold ||
    cooldown !== topic.retest_cooldown_minutes ||
    hints !== topic.hints_allowed;
  const input =
    "h-9 w-20 rounded-md border border-line-strong bg-bg-1 px-2 text-text-1 tabular focus:border-cyan focus:outline-none";
  return (
    <form
      className="mt-3 flex flex-wrap items-end gap-4 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-text-2">
        Pass mark (%)
        <input
          type="number"
          min={1}
          max={100}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className={input}
        />
      </label>
      <label className="flex flex-col gap-1 text-text-2">
        Retest cooldown (min)
        <input
          type="number"
          min={0}
          max={1440}
          value={cooldown}
          onChange={(e) => setCooldown(Number(e.target.value))}
          className={input}
        />
      </label>
      <label className="flex h-9 items-center gap-2 text-text-2">
        <input
          type="checkbox"
          checked={hints}
          onChange={(e) => setHints(e.target.checked)}
          className="size-4 accent-(--bc-cyan)"
        />
        Hints allowed
      </label>
      <Button type="submit" size="sm" variant="ghost" disabled={!dirty} loading={save.isPending}>
        Save settings
      </Button>
      {save.isError ? (
        <span role="alert" className="text-red">
          {save.error instanceof ApiError ? save.error.message : "Couldn't save"}
        </span>
      ) : null}
    </form>
  );
}

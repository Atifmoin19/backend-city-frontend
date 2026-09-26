"use client";

import { useQuery } from "@tanstack/react-query";

import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { insightsApi } from "@/lib/api/insights";

import { SignupsChart } from "./SignupsChart";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Who is learning, where they drop off, and which games are hardest. */
export function AnalyticsScreen() {
  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: insightsApi.analytics,
  });
  if (isPending) return <p className="px-8 py-10 text-text-3">Loading analytics…</p>;
  if (error || !data) return <p className="px-8 py-10 text-red">Couldn&apos;t load analytics.</p>;
  const { learners } = data;
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <SignHeading as="h1" className="text-3xl">
        Analytics
      </SignHeading>

      <div className="mt-6 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {[
            ["Accounts", learners.total],
            ["Active, 7 days", learners.active_7d],
            ["Active, 30 days", learners.active_30d],
          ].map(([label, value]) => (
            <Panel key={label} className="p-4">
              <dt className="text-xs text-text-3">{label}</dt>
              <dd className="tabular mt-1 font-display text-2xl font-bold text-text-1">{value}</dd>
            </Panel>
          ))}
        </dl>
        <Panel className="p-5">
          <p className="text-sm font-semibold text-text-1">Signups, last 14 days</p>
          <div className="mt-4">
            <SignupsChart days={learners.signups_14d} />
          </div>
        </Panel>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">Drop-off by topic</h2>
      <p className="mt-1 text-sm text-text-3">
        Learners at each step, in curriculum order. Bars are relative to briefings finished.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-bg-2 text-left text-xs text-text-3">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                Topic
              </th>
              {["Briefed", "Practised", "Tried checkpoint", "Passed"].map((h) => (
                <th key={h} scope="col" className="px-4 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.funnel.map((row) => (
              <tr key={row.topic}>
                <th scope="row" className="px-4 py-2.5 text-left font-normal">
                  <span className="text-text-1">{row.title}</span>
                  <span className="block text-xs text-text-3">{row.district}</span>
                </th>
                {[row.briefed, row.practiced, row.attempted, row.passed].map((n, i) => (
                  <td key={i} className="px-4 py-2.5">
                    {n === null ? (
                      <span className="text-text-3">no checkpoint</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="tabular w-8 text-text-1">{n}</span>
                        <span
                          className="h-1.5 w-20 overflow-hidden rounded-full bg-line"
                          aria-hidden
                        >
                          <span
                            className="block h-full rounded-full bg-cyan"
                            style={{
                              width: `${row.briefed ? Math.min(100, (100 * n) / row.briefed) : 0}%`,
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">Hardest games</h2>
      <p className="mt-1 text-sm text-text-3">
        Lowest pass rate first. Checkpoints: passed submissions; practice: learners who cleared it.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-bg-2 text-left text-xs text-text-3">
            <tr>
              {["Game", "Kind", "Players", "Attempts", "Pass rate", "Avg score", "Avg hints"].map(
                (h) => (
                  <th key={h} scope="col" className="px-4 py-2 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.games.map((g) => (
              <tr key={g.slug}>
                <th scope="row" className="px-4 py-2.5 text-left font-normal">
                  <span className="text-text-1">{g.title}</span>
                  <span className="block font-mono text-xs text-text-3">{g.slug}</span>
                </th>
                <td className="px-4 py-2.5 text-text-2">
                  {g.is_checkpoint ? "Checkpoint" : "Practice"}
                </td>
                <td className="tabular px-4 py-2.5">{g.players}</td>
                <td className="tabular px-4 py-2.5">{g.attempts}</td>
                <td className="tabular px-4 py-2.5 text-text-1">
                  {g.players ? pct(g.pass_rate) : "—"}
                </td>
                <td className="tabular px-4 py-2.5">{g.avg_score ?? "—"}</td>
                <td className="tabular px-4 py-2.5">{g.avg_hints ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">Quizzes</h2>
      {data.quizzes.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {data.quizzes.map((q) => (
            <li key={q.quiz}>
              <Panel className="p-4 text-sm">
                <p className="font-mono text-xs text-text-3">{q.quiz}</p>
                <p className="mt-1 text-text-1">
                  <span className="tabular">{q.rounds}</span> rounds ·{" "}
                  <span className="tabular">{q.players}</span> players
                </p>
                <p className="text-text-2">Average {q.avg_pct}% right</p>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-text-3">No quiz rounds yet.</p>
      )}
    </div>
  );
}

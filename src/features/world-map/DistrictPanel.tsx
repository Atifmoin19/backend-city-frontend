"use client";

import { Check, Circle, Construction } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { StatusLight } from "@/components/ui/StatusLight";
import type { District } from "@/content/districts";
import { topicsFor } from "@/content/topics";
import { topicComplete } from "@/features/progress/stats";
import type { TopicRecord } from "@/stores/learning";

import type { DistrictState } from "./progress";

interface DistrictPanelProps {
  district: District;
  state: DistrictState;
  records: Record<string, TopicRecord>;
}

/** Floating drawer for the selected district. */
export function DistrictPanel({ district, state, records }: DistrictPanelProps) {
  const topics = topicsFor(district.key);
  return (
    <Panel surface="glass" className="w-full p-5" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-text-3">
          Level {district.level}
          {district.optional ? " · optional" : ""}
        </span>
        {state === "done" ? (
          <StatusLight status="pass">Cleared</StatusLight>
        ) : state === "active" ? (
          <StatusLight status="flow">Open</StatusLight>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-2">
            <Construction aria-hidden className="size-4" /> Under construction
          </span>
        )}
      </div>
      <SignHeading as="h2" className="mt-3 text-2xl">
        {district.name}
      </SignHeading>
      <p className="mt-1.5 text-text-1">{district.teaches}</p>
      <p className="mt-0.5 text-sm text-text-3">{district.metaphor}</p>

      {topics.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {topics.map((t) => {
            const done = topicComplete(t, records[t.slug]);
            return (
              <li key={t.slug} className="flex items-start gap-2.5 text-sm">
                {done ? (
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-green" />
                ) : (
                  <Circle aria-hidden className="mt-0.5 size-4 shrink-0 text-text-3" />
                )}
                <span className="text-text-1">
                  {t.title}
                  <span className="block text-text-3">
                    {t.game ? "Briefing · practice · checkpoint" : `Briefing · ${t.minutes} min`}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <p className="mt-5 text-sm text-text-2">You&apos;ll learn:</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {district.topics.map((t) => (
              <li
                key={t}
                className="rounded-sm border border-line bg-bg-1/60 px-2 py-1 text-xs text-text-2"
              >
                {t}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6">
        {topics.length > 0 ? (
          <Link
            href={`/district/${district.key}`}
            data-sound="open"
            className={buttonClasses({ className: "w-full" })}
          >
            {state === "done" ? "Revisit the district" : "Enter the district"}
          </Link>
        ) : (
          <p className="text-sm text-text-2">
            This district&apos;s lessons and games are being built and will open in a later update.
          </p>
        )}
      </div>
    </Panel>
  );
}

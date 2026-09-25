"use client";

import { Target } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { cityStats, nextMission } from "@/features/progress/stats";
import type { TopicRecord } from "@/features/progress/records";

/** HUD: the next thing to do, plus real progress through the open content. */
export function MissionCard({ records }: { records: Record<string, TopicRecord> }) {
  const mission = nextMission(records);
  const stats = cityStats(records);
  const pct = Math.round((100 * stats.topicsDone) / Math.max(1, stats.topicsTotal));
  return (
    <Panel surface="glass" className="w-full p-4">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-cyan uppercase">
        <Target aria-hidden className="size-4" /> Current mission
      </p>
      {mission ? (
        <>
          <p className="mt-2 font-display text-[0.95rem] leading-snug font-semibold text-text-1">
            {mission.topic.title}
          </p>
          <p className="mt-1 text-sm text-text-2">
            Next:{" "}
            {mission.step === "briefing"
              ? `briefing, about ${mission.topic.minutes} min`
              : mission.step}
          </p>
          <Link
            href={mission.href}
            className={buttonClasses({ size: "sm", className: "mt-3 w-full" })}
          >
            {mission.step === "briefing"
              ? "Start briefing"
              : mission.step === "practice"
                ? "Start practice"
                : "Take the checkpoint"}
          </Link>
        </>
      ) : (
        <p className="mt-2 text-sm text-text-1">
          Every open district is cleared. New districts are under construction.
        </p>
      )}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-3">
          <span>Early-access content</span>
          <span className="tabular">
            {stats.topicsDone}/{stats.topicsTotal} topics
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-1"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Topics completed"
        >
          <div
            className="h-full rounded-full bg-green transition-[width] duration-(--bc-dur-3)"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Panel>
  );
}

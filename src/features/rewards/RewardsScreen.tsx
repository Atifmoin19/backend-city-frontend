"use client";

import { Award, Flame, Lock } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SignHeading } from "@/components/ui/SignHeading";
import { cn } from "@/lib/cn";

import { BADGE_ICON } from "./badgeIcons";
import { useStats } from "./useStats";

const dateFmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

/** Level, XP bar, streak and every badge (earned or still to earn). */
export function RewardsScreen() {
  const { data: stats, isPending } = useStats();
  if (isPending || !stats) {
    return <p className="mx-auto max-w-7xl px-5 py-12 text-text-3 sm:px-8">Loading your stats…</p>;
  }
  const { level, streak } = stats;
  const pct = Math.round((100 * level.xp_into) / level.xp_needed);
  const earned = stats.badges.filter((b) => b.earned_at).length;
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <SignHeading as="h1" className="text-[clamp(2rem,4.5vw,3.2rem)]">
        Your shift record
      </SignHeading>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Panel className="p-5 md:col-span-2">
          <p className="text-sm text-text-3">Level</p>
          <p className="mt-1 font-display text-3xl font-bold text-text-1">
            {level.level}{" "}
            <span className="text-base font-normal text-text-2">· {stats.xp} XP total</span>
          </p>
          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label={`Level ${level.level + 1} progress`}
            aria-valuemin={0}
            aria-valuemax={level.xp_needed}
            aria-valuenow={level.xp_into}
          >
            <div className="h-full rounded-full bg-cyan" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-text-2">
            {level.xp_needed - level.xp_into} XP to level {level.level + 1}. Briefings 20 XP,
            practice games 30, checkpoints 100 + 25 per star, quiz answers 2.
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-text-3">Streak</p>
          <p className="mt-1 flex items-center gap-2 font-display text-3xl font-bold text-text-1">
            <Flame
              aria-hidden
              className={cn("size-7", streak.current ? "text-amber" : "text-text-3")}
            />
            {streak.current} {streak.current === 1 ? "day" : "days"}
          </p>
          <p className="mt-2 text-sm text-text-2">
            {streak.active_today
              ? "Today counts. Come back tomorrow to keep it going."
              : streak.current
                ? "Play anything today to keep your streak."
                : "Play anything today to start a streak."}{" "}
            Best: {streak.best}.
          </p>
        </Panel>
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-text-1">
        Badges{" "}
        <span className="text-base font-normal text-text-3">
          · {earned} of {stats.badges.length}
        </span>
      </h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.badges.map((b) => {
          const Icon = BADGE_ICON[b.key] ?? Award;
          const got = !!b.earned_at;
          return (
            <li
              key={b.key}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4",
                got ? "border-amber/50 bg-bg-2" : "border-line bg-bg-1",
              )}
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-lg border",
                  got ? "border-amber/50 bg-amber/10" : "border-line",
                )}
              >
                {got ? (
                  <Icon aria-hidden className="size-5 text-amber" />
                ) : (
                  <Lock aria-hidden className="size-4 text-text-3" />
                )}
              </span>
              <div>
                <p className={cn("font-semibold", got ? "text-text-1" : "text-text-2")}>
                  {b.title}
                </p>
                <p className="text-sm text-text-2">{b.description}</p>
                <p className="mt-1 text-xs text-text-3">
                  {got ? `Earned ${dateFmt.format(new Date(b.earned_at!))}` : "Not yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

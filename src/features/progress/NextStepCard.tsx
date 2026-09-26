"use client";

import { ArrowRight, BookOpen, Map, Play, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { useSession } from "@/features/auth/useSession";
import { districtByKey } from "@/content/districts";
import { cn } from "@/lib/cn";
import { useLearning } from "@/features/progress/useLearning";

import { nextMission } from "./stats";

const ICON = { briefing: BookOpen, practice: Play, checkpoint: ShieldCheck };
const CTA = {
  briefing: "Start the briefing",
  practice: "Start practice",
  checkpoint: "Take the checkpoint",
};

/** "Next up": the learner's real next mission, so a finished chapter always leads somewhere. */
export function NextStepCard({ className }: { className?: string }) {
  const { records } = useLearning();
  const { data: user } = useSession();
  const mission = nextMission(records, user?.start_district);
  if (!mission) {
    return (
      <div className={cn("rounded-xl border border-green/40 bg-green/[0.06] p-5", className)}>
        <p className="font-semibold text-text-1">Every open district is cleared.</p>
        <p className="mt-1 text-sm text-text-2">
          New districts are under construction. Check the map for what&apos;s coming.
        </p>
        <Link
          href="/map"
          className={buttonClasses({ variant: "ghost", size: "sm", className: "mt-4" })}
        >
          <Map aria-hidden className="size-4" /> Open the Backend District
        </Link>
      </div>
    );
  }
  const Icon = ICON[mission.step];
  const district = districtByKey(mission.topic.district);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-cyan/50 bg-bg-2 p-5 shadow-glow-cyan",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-16 size-48 rounded-full bg-cyan/10 blur-3xl"
      />
      <p className="relative text-xs font-semibold tracking-wide text-cyan uppercase">Next up</p>
      <div className="relative mt-3 flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-md border border-cyan/60 text-cyan">
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tracking-tight text-text-1">
            {mission.topic.title}
          </p>
          <p className="mt-0.5 text-sm text-text-2">
            {district?.name} ·{" "}
            {mission.step === "briefing"
              ? `briefing, about ${mission.topic.minutes} min`
              : mission.step}
          </p>
        </div>
      </div>
      <Link href={mission.href} className={buttonClasses({ className: "relative mt-5 w-full" })}>
        {CTA[mission.step]} <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}

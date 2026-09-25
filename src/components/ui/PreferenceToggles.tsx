"use client";

import { Gauge, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/cn";
import { usePreferences } from "@/stores/preferences";

/** Always-visible mute + performance mode (ideology 9.2 / 9.4). */
export function PreferenceToggles({ className }: { className?: string }) {
  const { soundMuted, toggleSound, performanceMode, setPerformanceMode } = usePreferences();
  const base =
    "inline-flex size-9 items-center justify-center rounded-md border border-line text-text-2 transition-colors hover:border-line-strong hover:text-text-1";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        className={base}
        onClick={toggleSound}
        aria-pressed={!soundMuted}
        aria-label={soundMuted ? "Unmute sound" : "Mute sound"}
        title={soundMuted ? "Sound off" : "Sound on"}
      >
        {soundMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      <button
        type="button"
        className={cn(base, performanceMode && "border-green/50 text-green")}
        onClick={() => setPerformanceMode(!performanceMode)}
        aria-pressed={performanceMode}
        aria-label="Performance mode"
        title={performanceMode ? "Performance mode on" : "Performance mode off"}
      >
        <Gauge className="size-4" />
      </button>
    </div>
  );
}

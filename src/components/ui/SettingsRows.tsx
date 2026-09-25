"use client";

import { Gauge, Volume2, VolumeX } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { usePreferences } from "@/stores/preferences";

/** Sound + performance mode as labeled switches (ideology 9.2 / 9.4). */
export function SettingsRows() {
  const { soundMuted, toggleSound, performanceMode, setPerformanceMode } = usePreferences();
  return (
    <div className="flex flex-col">
      <SwitchRow
        icon={soundMuted ? <VolumeX /> : <Volume2 />}
        label="Sound effects"
        detail="Clicks and gate sounds while you play"
        on={!soundMuted}
        onToggle={toggleSound}
      />
      <SwitchRow
        icon={<Gauge />}
        label="Performance mode"
        detail="Fewer animations, easier on older laptops"
        on={performanceMode}
        onToggle={() => setPerformanceMode(!performanceMode)}
      />
    </div>
  );
}

function SwitchRow({
  icon,
  label,
  detail,
  on,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  detail: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-bg-3/70"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-bg-2 text-text-2 [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-1">{label}</span>
        <span className="block text-xs text-text-3">{detail}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-(--bc-dur-2)",
          on ? "border-cyan/70 bg-cyan/30" : "border-line-strong bg-bg-1",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-3.5 rounded-full transition-[left,background-color] duration-(--bc-dur-2)",
            on ? "left-[1.1rem] bg-cyan shadow-glow-cyan" : "left-0.5 bg-text-3",
          )}
        />
      </span>
    </button>
  );
}

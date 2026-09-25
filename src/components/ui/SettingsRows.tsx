"use client";

import { Gauge, Monitor, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { usePreferences, type ThemePreference } from "@/stores/preferences";

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Night", icon: Moon },
  { value: "light", label: "Day", icon: Sun },
  { value: "system", label: "Auto", icon: Monitor },
];

/** City lighting, sound and performance mode as labeled controls (ideology 9.2 / 9.4). */
export function SettingsRows() {
  const { soundMuted, toggleSound, performanceMode, setPerformanceMode, theme, setTheme } =
    usePreferences();
  return (
    <div className="flex flex-col">
      <div className="px-2.5 pt-1.5 pb-2.5">
        <p id="theme-label" className="mb-1.5 text-sm font-medium text-text-1">
          City lighting
        </p>
        <div
          role="radiogroup"
          aria-labelledby="theme-label"
          className="grid grid-cols-3 gap-1 rounded-md border border-line bg-bg-1 p-1"
        >
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={theme === value}
              onClick={() => setTheme(value)}
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1.5 rounded-sm text-xs font-medium transition-colors",
                theme === value
                  ? "bg-bg-2 text-text-1 shadow-glow-cyan"
                  : "text-text-2 hover:bg-bg-3 hover:text-text-1",
              )}
            >
              <Icon aria-hidden className={cn("size-3.5", theme === value && "text-cyan")} />
              {label}
            </button>
          ))}
        </div>
      </div>
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
      data-sound="toggle"
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

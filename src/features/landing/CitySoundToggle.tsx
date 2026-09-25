"use client";

import { Volume2, VolumeX } from "lucide-react";

import { playSound, unlockSound } from "@/lib/sound/engine";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/stores/preferences";

/** Hero pill: turning the city sound on is also the gesture browsers need to allow audio. */
export function CitySoundToggle({ className }: { className?: string }) {
  const { soundMuted, toggleSound } = usePreferences();
  return (
    <button
      type="button"
      data-sound="none"
      aria-pressed={!soundMuted}
      onClick={() => {
        unlockSound();
        toggleSound();
        if (soundMuted) setTimeout(() => playSound("open"), 30);
      }}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium backdrop-blur-md transition-colors",
        soundMuted
          ? "border-line-strong bg-bg-0/55 text-text-2 hover:text-text-1"
          : "border-cyan/50 bg-cyan/10 text-cyan",
        className,
      )}
    >
      {soundMuted ? (
        <VolumeX aria-hidden className="size-4" />
      ) : (
        <Volume2 aria-hidden className="size-4" />
      )}
      City sound {soundMuted ? "off" : "on"}
    </button>
  );
}

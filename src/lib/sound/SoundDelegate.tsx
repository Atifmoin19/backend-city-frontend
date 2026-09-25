"use client";

import { useEffect } from "react";

import { playSound, unlockSound, type Cue } from "./engine";

/**
 * One listener for the whole app: the first gesture unlocks audio, and every button or link
 * clicks softly. An element opts into a specific cue with `data-sound="select"`, or out of
 * the default with `data-sound="none"` (when its handler plays a result-dependent cue).
 */
export function SoundDelegate(): null {
  useEffect(() => {
    const onGesture = () => unlockSound();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(
        "[data-sound], button, a[href], [role='radio'], [role='switch']",
      );
      if (!el || (el as HTMLButtonElement).disabled) return;
      const cue = el.dataset.sound;
      if (cue === "none") return;
      playSound((cue as Cue | undefined) ?? "click");
    };
    addEventListener("pointerdown", onGesture, { capture: true });
    addEventListener("keydown", onGesture, { capture: true });
    addEventListener("click", onClick, { capture: true });
    return () => {
      removeEventListener("pointerdown", onGesture, { capture: true });
      removeEventListener("keydown", onGesture, { capture: true });
      removeEventListener("click", onClick, { capture: true });
    };
  }, []);
  return null;
}

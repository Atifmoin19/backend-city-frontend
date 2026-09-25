"use client";

import { AnimatePresence, motion } from "motion/react";

import { Character, type CharacterState } from "@/components/characters";
import { cn } from "@/lib/cn";

export interface Speech {
  who: "character" | "byte";
  text: string;
}

/** Character + speech bubble. Byte (AI/hints) speaks in purple; the district character in neutral. */
export function CharacterCorner({
  character,
  mood,
  speech,
}: {
  character: string;
  mood: CharacterState;
  speech: Speech | null;
}) {
  const isByte = speech?.who === "byte";
  return (
    <div className="pointer-events-none flex items-start gap-2">
      <AnimatePresence mode="wait">
        {speech ? (
          <motion.p
            key={speech.text}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "pointer-events-auto mt-3 max-w-64 rounded-md border px-3.5 py-2.5 text-sm shadow-panel",
              isByte
                ? "border-purple/50 bg-[#261d4a] text-text-1 shadow-glow-purple"
                : "border-line-strong bg-bg-2 text-text-1",
            )}
            aria-live="polite"
          >
            {isByte ? (
              <span className="mb-0.5 block text-xs font-semibold text-purple">Byte</span>
            ) : null}
            {speech.text}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <Character name={isByte ? "byte" : character} state={isByte ? "thinking" : mood} size={76} />
    </div>
  );
}

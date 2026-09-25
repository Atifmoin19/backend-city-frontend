import type { ReactNode } from "react";

import { Bouncer } from "@/components/characters/Bouncer";
import type { CharacterState } from "@/components/characters/types";

interface GateAsideProps {
  mood: CharacterState;
  line: string;
  children: ReactNode;
}

/** The Bouncer watching your request, with a speech line above the preview. */
export function GateAside({ mood, line, children }: GateAsideProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end gap-4">
        <Bouncer state={mood} size={84} />
        <p
          className="relative mb-3 rounded-md border border-line bg-bg-2 px-4 py-3 text-sm text-text-1"
          aria-live="polite"
        >
          {line}
        </p>
      </div>
      {children}
      <p className="text-sm text-text-3">
        This is the exact request your form sends. In the Gatehouse district you&apos;ll write the
        rules that check it.
      </p>
    </div>
  );
}

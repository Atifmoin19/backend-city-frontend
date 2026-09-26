import type { ReactNode } from "react";

import { Bouncer } from "@/components/characters/Bouncer";
import type { CharacterState } from "@/components/characters/types";

interface GateAsideProps {
  mood: CharacterState;
  line: string;
  children: ReactNode;
  /** The "this is the exact request" note under a request preview (login / signup). */
  requestNote?: boolean;
}

/** The Bouncer watching your request, as a glass card floating over the city. */
export function GateAside({ mood, line, children, requestNote = true }: GateAsideProps) {
  return (
    <div className="glass max-w-xl rounded-2xl p-5 shadow-panel">
      <div className="flex items-end gap-4">
        <Bouncer state={mood} size={76} />
        <div className="mb-2">
          <p className="text-xs font-semibold text-text-2">The Bouncer</p>
          <p
            className="mt-1 rounded-md border border-line bg-bg-1/80 px-3.5 py-2.5 text-sm text-text-1"
            aria-live="polite"
          >
            {line}
          </p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
      {requestNote ? (
        <p className="mt-3 text-xs text-text-3">
          This is the exact request your form sends. In the Gatehouse you&apos;ll write the rules
          that check it.
        </p>
      ) : null}
    </div>
  );
}

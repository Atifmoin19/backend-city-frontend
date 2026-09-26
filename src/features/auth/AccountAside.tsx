import type { CharacterState } from "@/components/characters/types";

import { GateAside } from "./GateAside";

/** The Bouncer's card for the account pages (reset, verify): one line, no request preview. */
export function AccountAside({
  mood,
  line,
  note,
}: {
  mood: CharacterState;
  line: string;
  note: string;
}) {
  return (
    <GateAside mood={mood} line={line} requestNote={false}>
      <p className="mt-4 text-sm text-text-2">{note}</p>
    </GateAside>
  );
}

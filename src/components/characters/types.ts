/**
 * Character contract. Placeholder SVG characters implement it today; Rive state machines will
 * implement the same props later (input `state` maps 1:1 to a Rive state-machine input).
 */
export type CharacterState = "idle" | "happy" | "sad" | "thinking" | "worried" | "celebrating";

export interface CharacterProps {
  state?: CharacterState;
  size?: number;
  className?: string;
  /** Accessible name; decorative when omitted. */
  label?: string;
}

export type CharacterKey = "byte" | "bouncer" | "packet" | "librarian" | "squirrel" | "glitch";

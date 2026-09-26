import { Bouncer } from "./Bouncer";
import { Byte } from "./Byte";
import { Glitch } from "./Glitch";
import { Librarian } from "./Librarian";
import { Packet } from "./Packet";
import type { CharacterKey, CharacterProps } from "./types";

const REGISTRY: Partial<Record<CharacterKey, (p: CharacterProps) => React.JSX.Element>> = {
  byte: Byte,
  bouncer: Bouncer,
  glitch: Glitch,
  librarian: Librarian,
  packet: Packet,
};

/** Resolve a character by the key stored in game content (`character_key`). */
export function Character({ name, ...props }: CharacterProps & { name: string }) {
  const Component = REGISTRY[name as CharacterKey] ?? Byte;
  return <Component {...props} />;
}

export { Bouncer, Byte, Glitch, Librarian, Packet };
export type { CharacterKey, CharacterProps, CharacterState } from "./types";

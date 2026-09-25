import {
  BookOpen,
  Gauge,
  Keyboard,
  Lightbulb,
  Map,
  Play,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Kbd } from "@/components/ui/Kbd";
import { StatusLight, type Status } from "@/components/ui/StatusLight";

export interface Slide {
  key: string;
  title: (name: string) => string;
  body: ReactNode;
  visual: "skyline" | "loop" | "lights" | "controls";
}

const LOOP = [
  {
    icon: BookOpen,
    title: "Briefing",
    body: "A short lesson with diagrams, examples and quick checks. You always learn before you're tested.",
  },
  {
    icon: Play,
    title: "Practice",
    body: "Edit a few lines in a real FastAPI server and watch traffic hit it. Unlimited tries, runs in your browser.",
  },
  {
    icon: ShieldCheck,
    title: "Checkpoint",
    body: "A fresh variant with hidden requests at every edge, graded on the server. Score 70% to clear the district.",
  },
];

const LIGHTS: { status: Status; label: string; body: string }[] = [
  { status: "flow", label: "Cyan: a request", body: "Data travelling through the city." },
  { status: "pass", label: "Green: 2xx", body: "Served. The request did what it should." },
  { status: "bounce", label: "Amber: 4xx", body: "Bounced. The client sent something wrong." },
  { status: "crash", label: "Red: 5xx", body: "Crashed. The server's own code failed." },
  { status: "ai", label: "Purple: Byte", body: "Hints and explanations from your robot guide." },
];

const CONTROLS: { icon: typeof Map; keys: ReactNode; body: string }[] = [
  {
    icon: Keyboard,
    keys: (
      <>
        <Kbd>⌘/Ctrl</Kbd> + <Kbd>Enter</Kbd>
      </>
    ),
    body: "Run your code against the traffic.",
  },
  {
    icon: Map,
    keys: (
      <>
        <Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>↑</Kbd> <Kbd>↓</Kbd> or <Kbd>WASD</Kbd>
      </>
    ),
    body: "Walk Byte around the city map.",
  },
  {
    icon: Lightbulb,
    keys: <span className="text-purple">Hint button</span>,
    body: "Three tiers of help. Hints lower your best possible stars.",
  },
  {
    icon: Volume2,
    keys: <span>Sound toggle</span>,
    body: "In your account menu, top right on every screen. Off by default.",
  },
  {
    icon: Gauge,
    keys: <span>Performance mode</span>,
    body: "Same menu. Turns off heavy effects on slower machines.",
  },
];

export const SLIDES: Slide[] = [
  {
    key: "story",
    visual: "skyline",
    title: (name) => `Welcome to the night shift, ${name}.`,
    body: (
      <>
        <p>
          Backend City runs on servers, and most of them are dark. A villain called{" "}
          <span className="font-semibold text-red">Glitch</span> keeps flooding the streets with bad
          requests.
        </p>
        <p>
          You&apos;re the new engineer. Every district teaches one layer of the backend: routing,
          validation, databases, auth, caching, queues. Clear a district and its lights come back
          on.
        </p>
      </>
    ),
  },
  {
    key: "loop",
    visual: "loop",
    title: () => "How every district works",
    body: (
      <ol className="grid gap-4">
        {LOOP.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-md border border-cyan/50 bg-bg-2 text-cyan">
              <Icon aria-hidden className="size-5" />
            </span>
            <span>
              <span className="block font-semibold text-text-1">
                {i + 1}. {title}
              </span>
              <span className="mt-0.5 block text-text-2">{body}</span>
            </span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    key: "lights",
    visual: "lights",
    title: () => "Read the lights",
    body: (
      <>
        <p>
          Every color in the city means one thing, and it always comes with an icon and a label.
        </p>
        <ul className="mt-2 grid gap-3">
          {LIGHTS.map((l) => (
            <li key={l.label} className="flex items-baseline gap-3">
              <StatusLight status={l.status}>{l.label}</StatusLight>
              <span className="text-text-2">{l.body}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    key: "controls",
    visual: "controls",
    title: () => "Your controls",
    body: (
      <ul className="grid gap-4">
        {CONTROLS.map(({ icon: Icon, keys, body }) => (
          <li key={body} className="flex gap-4">
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-text-3" />
            <span>
              <span className="block text-sm text-text-1">{keys}</span>
              <span className="mt-0.5 block text-text-2">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    ),
  },
];

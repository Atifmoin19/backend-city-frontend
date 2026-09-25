# Product

<!-- impeccable:product-schema 1 -->

Source of truth for everything below: [docs/PROJECT_IDEOLOGY.md](docs/PROJECT_IDEOLOGY.md).

## Platform

web

## Users

Primary (confirmed 2026-09-25): **programmers new to backend**, mostly frontend developers who
know JS/HTML and have played Flexbox Froggy-style games, and now want to understand servers.
They study on a laptop, often in the evening after work, in short sessions.
Secondary: complete beginners, routed through placement to the optional Level -1 Python kit.

## Product Purpose

Take someone from zero to a job-ready backend developer by playing. Each topic: a short lesson,
2–3 practice mini-games, and a scored checkpoint that gates the next chapter. Success = the
learner passes checkpoints on the first or second variant and comes back the next day.

## Positioning

Backend concepts are invisible; Full Stack City makes them visible. The learner edits a small
snippet inside a pre-written FastAPI backend and **watches a traffic simulation** hit it:
requests pass (2xx), bounce (4xx) or crash the server (5xx). No other backend course shows the
learner's own code handling live requests.

## Operating Context

- World: Full Stack City. The surface is the Frontend District (coming soon); inside its buildings
  is the Backend District (open), a broken neon city the learner brings back online. See
  docs/FULL_STACK_CITY.md.
  Each level is a district (Signal Tower, Router Station, Gatehouse, Data Vaults, Citadel,
  Speedway, Factory, Control Room, Skyline). Completed topics light up the district.
- Practice code runs in the browser (Pyodide); checkpoints are re-graded on the server with
  hidden tests. Variants change on every retest.
- AI tutor speaks through the mascot, never gives full answers during scored attempts.

## Capabilities and Constraints

- Next.js 16 frontend, FastAPI backend, 100% free-tier hosting; backend may cold-start.
- Coding is desktop-first; mobile favors pick-the-line / drag games with a "Best on desktop" tag.
- Must run on low-end devices: performance mode, pause heavy animation while typing.
- Brand **Full Stack City** (renamed from Backend City, 2026-09-26); mascot placeholder name
  **Byte** (configurable).
- Built so far: auth, Bouncer game (signup-gate). Lessons, XP, AI, admin UI are later phases.

## Brand Commitments

Pinned by ideology §9 (binding):

- Dark base (deep navy `#0a0e1a`-ish, never pure black), neon accents with fixed meaning:
  cyan = requests/data flow, green = success/2xx, amber = warning/4xx, red = error/5xx,
  purple = AI/magic.
- Owner decision 2026-09-25: an optional **Daybreak** light theme ships alongside the night
  default (same color meanings, deeper inks, golden-hour 3D scenes). Never a white card inside
  the night theme.
- Owner decision 2026-09-25: soft synthesized UI sound is **on by default**, one toggle turns it off.
- Glow on active elements, gradient headings, glass panels (blur sparingly), slow animated
  district backgrounds. Monospace for code (JetBrains Mono or Fira Code).
- The code editor area is always calm: solid background, nothing animating behind code.
- Game feel matters: juice on success, dramatic-but-never-humiliating failure.
- Characters: Byte (robot mascot), Packet (courier), The Bouncer, The Librarian,
  Squirrel the Cacher, Glitch (villain). Placeholders now, Rive later.

## Evidence on Hand

- No users, testimonials, metrics, or press yet. Never invent learner counts, ratings, or
  completion stats. Demo progress on the world map must be labeled as demo.
- Real content: the curriculum (ideology §5) and one real game (`signup-gate`).

## Product Principles

1. Make the invisible visible: every concept is shown happening, not described.
2. Snippets, not apps: the learner edits a small marked region inside working code.
3. Mastery before progress: pass to unlock; retests are new variants.
4. Tutor, not answer machine.
5. Fun is a feature, and it never gets in the way of reading code.

## Accessibility & Inclusion

Respect `prefers-reduced-motion`; performance-mode toggle; never color alone (icons + text);
keyboard navigable with visible focus; high-contrast editor; sound toggle always reachable
(Settings / account menu, homepage pill); both themes keep text ≥ 4.5:1.

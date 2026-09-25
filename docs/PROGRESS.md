# Progress Log — Frontend

Newest entry on top. Update at the end of every task.

## 2026-09-25 — Round 3: 3D homepage

### Done

- Homepage rebuilt around a real 3D city (three.js r186, lazy chunk ~139 KB gz, homepage only):
  instanced towers with a procedural window shader and crisp rim edges, wet-street reflection,
  glowing streets, packet trails (served / bounced at the Gatehouse / crashed), search beams, bloom.
- Scroll story: sticky 3D canvas, five chapters (hero, Academy, Signal Tower, Gatehouse, districts
  under construction). Scroll drives the camera flight (arcs over rooftops between stops) and
  switches each district's lights on. Mouse parallax. Live traffic legend.
- Gatehouse chapter has a tiny playable `Field(ge=…)` demo (pure JS).
- New sections: "You know this end" (fetch() ↔ FastAPI), FAQ, sticky transparent header with
  section links. Old hero / shift loop / district list removed.
- Fallbacks: reduced motion = still frame; performance mode = no reflection, lighter bloom, fewer
  packets; no WebGL = 2D skyline. Rendering pauses offscreen and in hidden tabs.
- Scroll snapping was tried and removed at the owner's request (normal scrolling).

## 2026-09-25 — Round 2 (owner feedback)

### Done

- **Bug fix:** landing page and public header are session-aware ("Continue your shift", "Open city
  map"); signed-in visitors to /login or /signup are redirected (only if already signed in when
  the page opened, so form redirects don't race).
- **Onboarding** `/welcome` after first sign-in: story, how districts work, what the lights mean,
  controls. Stored per user (`onboarded`).
- **Content:** Academy ("Python for JavaScript developers") and Signal Tower ("How a request
  travels") briefings; lesson-only topics complete on the briefing. New learners start at the Academy.
- **Map:** full-screen world, illustrated district plates, lit roads with traffic, scaffolding + crane
  for unbuilt districts ("under construction"), side HUD with current mission, district drawer and
  guide.
- **App shell** for signed-in screens with real stats (districts cleared, stars).
- District and lesson pages: wide layouts with banners and side rails (step outline, what's next).
- 23 unit tests; full new-user E2E (signup → orientation → map → briefing → practice → checkpoint →
  cleared) passes.

## 2026-09-25 — Session 1: foundation, Phase 0 spike 2, learning flow

### Done

- Next.js 16.3.6 scaffold: strict TS, Tailwind 4, ESLint + Prettier, Vitest, `/api/*` rewrite,
  harness sync script + `harness.lock`.
- Design system: tokens, Tailwind theme, UI kit, preferences store (mute, performance mode,
  motion), placeholder characters (Byte, Bouncer) behind a Rive-ready contract. PRODUCT.md.
- Landing: live canvas skyline (packets pass / bounce / crash) with live legend counters.
- Auth: signup + login with live request preview at the gate; wired to backend cookies.
- World map: walkable (arrows / WASD), real progress, unbuilt districts marked in production.
- **Learning flow** (after owner feedback): district page (Briefing → Practice → Checkpoint with
  locks), 5-step Gatehouse briefing with diagrams, code, a constraints table and quick checks.
- **Game (spike 2 passed)**: CodeMirror locked-region editor, Pyodide module worker running the
  shared harness, Pixi request-flow visualizer, request log, hints via API, practice/checkpoint
  modes, server-graded checkpoint with result overlay. Verified end to end in Chrome.
- Theme lifted for readability (owner: "too dark").
- 19 unit tests; production build passes.

### Pending

- Backend progress API (`topic_progress`, attempts) → replace localStorage learning store.
- Hint penalty on the score (needs persisted attempts).
- Levels 0–1 content (Signal Tower, Router Station) and more games per topic (2–3 required).
- Onboarding placement quiz, forgot/reset password screens (backend email flows first).
- Rive characters, sound (Howler), Recharts admin, admin panel.
- Formal Impeccable finish review + documenter pass (not run this session; see known issues).

### Known issues

- Progress is per browser until the progress API exists.
- Pyodide first load is 5–7 s on a cold cache; later visits are cached.
- `harness.lock` points at an unpushed backend commit; Vercel builds need the backend pushed.
- Impeccable's finish-reviewer and documenter subagents aren't available in this setup; two
  screenshot rounds, the owner's review, and the mechanical detector (gradient text kept as
  pinned, decorative grids removed) stood in for them.

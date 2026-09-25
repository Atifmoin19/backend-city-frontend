# Progress Log — Frontend

Newest entry on top. Update at the end of every task.

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

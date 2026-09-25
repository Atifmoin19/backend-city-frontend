# Architecture — Frontend

## Layers

```
src/app/*            thin route files (params -> feature screen)
   ▼
src/features/*       screens + feature hooks (auth, world-map, district, lesson, game)
   ▼        ▼
src/engine/*         game engine (harness client, editor, visualizer)   src/lib/api/*  typed backend client
   ▼                                                                      ▼
public/workers/pyodide.worker.mjs  (Python in the browser)               /api/* rewrite -> FastAPI
src/components/*     design-system primitives, characters, layout
src/stores/*         Zustand: preferences
src/content/*        static curriculum: districts, topics, lessons
```

## Learning flow

```
/map ─► /district/gatehouse ─► /learn/gatehouse-validation ─► /play/ticket-booth ─► /play/badge-check ─► /play/signup-gate?mode=checkpoint
          steps with locks        quick checks gate each step     practice games: in the browser;          new variant; hidden
                                  POST /me/progress/lessons/..    each clear POSTs /games/../practice      tests on the server
```

Progress comes from the backend: `features/progress/useLearning` wraps `GET /me/progress`
(React Query, per user) and turns it into `TopicRecord`s (`records.ts`); writes return the
updated topic, which is patched into the cache. Topic → game lists are static in
`content/topics.ts` and must match the backend seed. The map derives district state from the
records (`progressFrom`): nothing is ever pre-cleared; districts without content show "In
production". `legacy.ts` moves pre-API browser progress (onboarding, briefings) once.

## Admin

`/admin` (route group `(admin)`, `AdminShell`): role-gated in the UI, enforced by the backend.
`ContentScreen` (tree + topic settings) → `GameEditor` (keyed per version; draft state local,
JSON sections parsed on save) + `TestRunPanel`; `UsersScreen` → `UserDetail`. Client in
`lib/api/admin.ts`. These screens show server-only content (hidden tests, reference solutions)
to admins only.

## Game run (practice)

```
GameScreen ─ useGamePlay ─ HarnessClient.run() ── postMessage ──► pyodide.worker.mjs
                                                                 splice(starter, snippet) (harness/splice.py)
                                                                 run(source, public_tests) (harness/runner.py, in-process ASGI)
   ◄── RunReport {ok, results[]} ──────────────────────────────────
   ├─► TrafficModal opens → RequestFlowVisualizer.play(results)   Pixi: pass / bounce / crash
   ├─► playSound(pass | bounce | crash) per request
   └─► RequestLog + RequestsMeter (practice) / ScoreMeter (checkpoint) + MissionBrief stamp
```

- The worker boots once per tab; `useHarness` starts it as soon as a game mounts.
- A run over 5 s (infinite loop) terminates and reboots the worker.
- The editor reads the latest doc from a ref so Ctrl/Cmd+Enter never runs stale code.

## Checkpoint

`POST /api/games/{slug}/grade {attempt_token, snippet}` → backend sandbox runs public + hidden
tests for the seed inside the signed token → `GradeResponse` → `ResultOverlay`. Requires login.

## Homepage 3D city

`features/landing/story/CityStory` pins `city3d/City3D` (lazy `import("./cityScene")`) and maps
scroll progress → `setProgress(0..4)`. `cityScene.ts` is imperative three.js: one InstancedMesh
for all towers with a ShaderMaterial (windows, floor slabs, rim edges via `fwidth`, per-district
`uLit` uniforms), Reflector ground, packet trails, UnrealBloom. Chapters live in
`story/chapters.ts`; chapter i = camera stop i (`STOPS`).

## Game screen layout

Left: `MissionBrief` (objective + rules from the backend variant) → gate card → `RequestLog`.
Right: editor with its own action bar (Run, Submit, Hint, Reset, boot status). The Pixi stage
lives in `TrafficModal`, always mounted (`inert` when closed) so the scene never restarts; Run
opens it. Mobile order: brief → editor → gate → log (`display: contents` + grid areas).

## Themes

`tokens.css` has a night `:root` block and a `:root[data-theme="light"]` (Daybreak) block; every
color is a token, alpha washes use channel vars (`rgb(var(--bc-cyan-rgb) / a)`).
`lib/themeBoot.ts` runs inline in `<head>` to set `data-theme` before paint; `Providers` keeps it
in sync with the store (and `prefers-color-scheme` for Auto). Canvas / WebGL code reads tokens
with `cssVar` / `cssHex` and rebuilds when `useResolvedTheme()` changes; the 3D city keeps its own
`LOOKS` table (sky stops, fog, face colors, tone mapping, blending, bloom).

## Sound

`lib/sound/engine.ts` synthesizes every cue with Web Audio (oscillators + filtered noise, master
gain + compressor). `SoundDelegate` (in `Providers`) unlocks audio on the first gesture and plays a
default click for buttons/links; `data-sound="<cue>"` overrides, `"none"` opts out. Feature code
calls `playSound(cue)` for result-dependent sounds.

## Homepage preloader

`City3D` reports real milestones (`chunk` → `built` → `compiled` via `renderer.compile` →
`frame` after the first presented frame, or `fallback`). `CityPreloader` shows them as a boot
log, charges a light seam with progress, then opens two gate panels onto the scene; 20 s safety
exit; reduced motion fades.

## Key decisions

- **Static module worker** in `public/workers/`: Turbopack emits bundled workers as classic
  workers, and Pyodide 314 only runs in module workers. Cost: the worker is plain JS (`// @ts-check`),
  so its protocol is mirrored in `src/engine/harness/protocol.ts`.
- **Pyodide from jsDelivr**, pinned to 314.0.7; FastAPI installed from its exact wheel with
  `deps=False` (installing by name pulls jinja2/httpx through the lockfile).
- **Harness sync** (`scripts/sync-harness.mjs`): local `../backend/harness` in dev, pinned commit
  from `harness.lock` in CI/Vercel. See ideology §18.
- **Same-origin API** via `next.config.ts` rewrites; httpOnly cookies; refresh cookie path
  `/api/auth`. `RequireSession` is a client gate (page routes can't see the refresh cookie);
  the backend enforces auth on every call.
- **Cold starts**: `lib/api/client.ts` retries 502/503/504/network errors with backoff;
  forms show "waking up the server" after 2.5 s.
- **Pixi scene is imperative** (`createRequestFlowScene`) and lazy-imported; its ticker runs
  only while a run animates, so nothing moves while the learner types.

## Measured (Phase 0 spike 2, Chrome, local)

|                                                            |                          |
| ---------------------------------------------------------- | ------------------------ |
| Cold boot: navigation → Python ready (CDN fetch)           | 4.8–6.9 s                |
| One practice run (3 requests, Python time)                 | ~40 ms                   |
| Download: Pyodide core ~6 MB gz + FastAPI stack ~2.2 MB gz | cached after first visit |

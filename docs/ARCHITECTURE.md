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
src/stores/*         Zustand: preferences, learning progress
src/content/*        static curriculum: districts, topics, lessons
```

## Learning flow

```
/map ─► /district/gatehouse ─► /learn/gatehouse-validation ─► /play/signup-gate?mode=practice ─► ?mode=checkpoint
          3 steps with locks      5 steps, quick check gates      runs in browser; all public       new variant; hidden
          (useLearning store)     each step; marks lessonDone     pass -> practicePassed            tests on server
```

Progress lives in `stores/learning.ts` (localStorage, keyed by user id) until the backend
progress API exists. The map derives district state from it (`progressFrom`): nothing is ever
pre-cleared; districts without content show "In production".

## Game run (practice)

```
GameScreen ─ useGamePlay ─ HarnessClient.run() ── postMessage ──► pyodide.worker.mjs
                                                                 splice(starter, snippet) (harness/splice.py)
                                                                 run(source, public_tests) (harness/runner.py, in-process ASGI)
   ◄── RunReport {ok, results[]} ──────────────────────────────────
   ├─► RequestFlowVisualizer.play(results)   Pixi: pass / bounce / crash animation
   └─► RequestLog + ScoreMeter
```

- The worker boots once per tab; `useHarness` starts it as soon as a game mounts.
- A run over 5 s (infinite loop) terminates and reboots the worker.
- The editor reads the latest doc from a ref so Ctrl/Cmd+Enter never runs stale code.

## Checkpoint

`POST /api/games/{slug}/grade {attempt_token, snippet}` → backend sandbox runs public + hidden
tests for the seed inside the signed token → `GradeResponse` → `ResultOverlay`. Requires login.

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

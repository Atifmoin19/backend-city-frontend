# Backend City — Frontend

Next.js app for **Backend City**, a gamified platform that teaches backend development by
letting learners edit small snippets inside a real FastAPI server and watch live requests
pass, bounce, or crash it. Practice runs entirely in the browser (Pyodide); checkpoints are
graded by the backend.

Backend repo: `backend-city-backend` · Product spec: [docs/PROJECT_IDEOLOGY.md](docs/PROJECT_IDEOLOGY.md)

## Stack (installed versions)

Next.js 16.3.6 (App Router, Turbopack) · React 19.2.8 · TypeScript 5.9 (strict) ·
Tailwind CSS 4.3 · Motion 13.4 · PixiJS 8.21 · three.js r186 (homepage only) · CodeMirror 6 · Pyodide 314.0.7 (CDN) ·
TanStack Query 5.103 · Zustand 5.0 · React Hook Form 7.88 + Zod 4.6 · lucide-react ·
ESLint 9 + Prettier 3.9 · Vitest 5 + Testing Library.

## Run locally

The backend must be running first (see backend README: `./scripts/dev.sh`, port 8000).

```bash
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000  (runs sync-harness first)
```

`/api/*` is rewritten to `BACKEND_URL`, so the browser only ever talks to `localhost:3000`
(first-party httpOnly cookies, no CORS).

## Scripts

| Script                            | What it does                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Next.js (both `dev` and `build` sync the harness first)                                     |
| `npm run sync-harness`            | Copy `../backend/harness` into `public/harness/` (or download the commit in `harness.lock`) |
| `npm run lint` / `lint:fix`       | ESLint                                                                                      |
| `npm run format` / `format:check` | Prettier                                                                                    |
| `npm run typecheck`               | `tsc --noEmit`                                                                              |
| `npm test` / `test:watch`         | Vitest                                                                                      |
| `npm run check`                   | lint + typecheck + format check + tests                                                     |

## Environment variables

| Variable                  | Purpose                                                                        |
| ------------------------- | ------------------------------------------------------------------------------ |
| `BACKEND_URL`             | Backend origin for the `/api/*` rewrite (server-side only)                     |
| `NEXT_PUBLIC_PYODIDE_URL` | Pyodide CDN base; must match backend `harness/requirements.txt`                |
| `HARNESS_LOCAL_PATH`      | Where the sync script finds the backend harness (default `../backend/harness`) |

## Screens

`/` landing · `/signup` `/login` · `/map` world map · `/district/[key]` topic steps ·
`/learn/[slug]` briefing · `/play/[slug]?mode=practice|checkpoint` game.

## Deployment (later, at a milestone)

**Vercel** (Hobby, non-commercial). Set `BACKEND_URL` to the Render URL. Before the first Vercel
build, push the backend and bump `harness.lock` to a pushed commit. Not deployed yet.

## Docs

[ARCHITECTURE](docs/ARCHITECTURE.md) · [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md) ·
[PROGRESS](docs/PROGRESS.md) · [CLAUDE.md](CLAUDE.md) · [PRODUCT.md](PRODUCT.md)

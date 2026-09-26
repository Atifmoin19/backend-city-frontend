# Full Stack City — Frontend

Next.js app for **Full Stack City** (formerly Backend City), a gamified platform that teaches
backend development (frontend and full stack tracks coming soon) by
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

`/` landing (3D city tour, request relay, FAQ) · `/signup` `/login` · `/welcome` orientation ·
`/map` world map · `/district/[key]` topic steps · `/learn/[slug]` briefing ·
`/play/[slug]?mode=practice|checkpoint` game (mission brief, editor, traffic view) ·
`/quiz/[slug]` Speed Round / Pick the Line · `/badges` XP, streak, badges ·
`/admin` content, `/admin/users`, `/admin/analytics`, `/admin/feedback`.

## Experience features

- **Themes**: Night (default) and Daybreak (light), plus Auto. Settings → City lighting. Set
  before first paint, so no flash.
- **Sound**: synthesized Web Audio cues (clicks, map, answers, runs, results, homepage chapters).
  On by default; toggle in Settings or the homepage "City sound" pill.
- **Performance mode** and reduced motion turn off heavy effects everywhere.
- **Preloader** on the homepage is driven by real 3D load milestones.
- **Fallbacks**: reduced motion shows one still per chapter; no WebGL shows the 2D skyline
  with a drawn cutaway of the Backend Tower.
- **Onboarding**: "Which side of the city?", optional placement check, then orientation.
- **Rewards**: XP / levels / streaks / badges (derived on the server), badge toasts, districts
  that light up as their steps are done.
- **Characters**: animated SVG (Byte, Bouncer, Glitch, Librarian, Packet) behind a
  Rive-ready `CharacterProps` contract.

## Deployment

Live at **https://backend-city-frontend-two.vercel.app** (Vercel Hobby). `BACKEND_URL` points
the `/api/*` rewrite at https://backend-city-api.onrender.com. Pushing `main` redeploys.
Full step-by-step for Neon + Render + Vercel: [docs/DEPLOY.md](docs/DEPLOY.md).

## Docs

[ARCHITECTURE](docs/ARCHITECTURE.md) · [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md) ·
[FULL_STACK_CITY](docs/FULL_STACK_CITY.md) · [DEPLOY](docs/DEPLOY.md) ·
[PROGRESS](docs/PROGRESS.md) · [CLAUDE.md](CLAUDE.md) · [PRODUCT.md](PRODUCT.md)

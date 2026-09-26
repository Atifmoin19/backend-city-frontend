# Progress Log — Frontend

Newest entry on top. Update at the end of every task.

## Status snapshot (2026-09-26, session 2)

**Live:** https://backend-city-frontend-two.vercel.app (Vercel) · API
https://backend-city-api.onrender.com (Render free, Docker, Singapore) · Postgres 17 on Neon.
Push to `main` auto-deploys both. **Session 2 work is on branch `feat/progress-content-admin`
in both repos, not released yet** (release steps: DEPLOY.md, "Releasing the progress /
content / admin update").

**Playable (after release):** Academy (briefing), Signal Tower (briefing + 2 practice +
checkpoint), Router Station (new briefing + 2 practice + checkpoint), Gatehouse (briefing +
2 practice + checkpoint). Progress is saved on the server. Admin panel at `/admin`.

### What's left (from ideology §21, in suggested order)

**Finish Phase 1 (MVP)**

1. **Auth emails**: verify email + forgot/reset password (EmailJS per §14.2).
2. **Admin**: create games/topics from the panel; the district page should read its game list
   from the API (`practice_games` / `checkpoint_game` are already in `/me/progress`).
3. **Content**: Academy practice games; a quiz-style game UI (Status Code Speed Round, Pick the
   Line) for mobile; placement quiz (§3).
4. ~~Phase 0 leftover: PGlite vs sql.js spike~~ done: Python `sqlite3` in the harness (backend
   ARCHITECTURE.md).

**Phase 2 — Engagement & AI**

- AI through Byte: tiered hints (today: static hint text), failure explainer, "Ask the
  Robot" concept chat, with daily limits and the never-the-answer guardrail (§7).
- XP, streaks, combos, badges (stars exist), city restoration visuals per topic.
- Levels 3–4: Data Vaults (SQL, ORM, N+1) and Citadel (auth, permissions).
- Admin analytics (drop-off funnel, hardest games), feedback inbox, audit log.
- Rive characters (Byte, Bouncer, Librarian, Glitch...). Sound + performance mode: done early.

**Phase 3 — Depth**: Levels 5–6 (Speedway caching, Factory queues), boss fights
(3 AM Incident), Break It Mode, weekly leaderboard, spaced repetition / daily review,
announcements, usage monitor.

**Phase 4 — Mastery & growth**: Levels 7–8 (Control Room, Skyline) + System Builder,
Capstone export, certificates + shareable profiles, community levels, other tracks
(Node/Express, a Frontend City: the backend is per-track already).

**Growth ideas (not in the spec)**: try-before-signup practice, shareable checkpoint result
card, daily challenge.

### Known issues

- Render free tier sleeps after 15 min idle unless the keep-alive Action runs.
- Pyodide first load is 5–7 s on a cold cache; later visits are cached.
- Audio starts only after the first click/key press (browser rule).
- Topic → game list is static in `src/content/topics.ts` (must match backend seed slugs).
- Open decisions (§22): final name, AI provider, monetization, i18n, OAuth, leaderboard privacy.

## 2026-09-26 — Session 4: Act 3, full stack pull-out

### Done

- Tour ends with two new chapters: **Full stack** (camera exits through the roof, the glass
  rebuilds bottom-up, risers and floor bands glow through it, light tubes arc from surrounding
  windows into the tower) and **Choose your side**, now composed over the scene.
- Phones swipe the three side cards; cards drop body text and chips below `sm`.
- Checked night + Daybreak, desktop + 390px phone.
- Onboarding step 1 "Which side of the city?" saves `learning_goal` (coming-soon sides also get
  Notify me) before orientation. Verified end to end: `/signup?goal=frontend` → preselected →
  goal + interest saved; backend pick continues to orientation.
- Copy pass: "City map" labels → "Backend District" (nav, menus, back links, onboarding).
- Academy: two optional warm-up games (Front Desk, Score Board) on the district page; the game
  screen's next button goes back to the map for practice-only topics.
- Request log: when the status is right but the JSON is wrong, a detail line shows what the
  response should contain and what the server sent.
- **City restoration** on the map: each open district lights the share of its windows equal to
  the steps done (briefings, practice, checkpoints), bottom-up; cleared districts are fully lit,
  untouched ones dark. The node's label reads "N% restored".
- **XP, levels, streaks, badges** (`features/rewards`, from `GET /me/stats` with the browser's
  timezone): header chip (level, XP, streak) linking to `/badges` (level bar, streak, all 11
  badges with earned dates), "Badges & XP" in the account menu, and a toast for badges earned
  since this browser last looked (first visit records the baseline silently). Stats refetch
  after lessons, practice, checkpoints and quiz rounds.
- **Quiz games** (`features/quiz`, content in `src/content/quizzes`): one runner for three
  kinds. Status Code Speed Round (Signal Tower: 60 s clock, instant feedback, combos), Pick
  the Line: Routes / The Gate (choose the missing line, explanation after each), and the
  placement check. Graded in the browser like lesson checks; rounds are saved to
  `/me/quiz-results`. Keys 1-4 + Enter. District pages list them under "Extra practice";
  `/quiz/[slug]` shows the learner's best in the rail.
- **Placement**: optional onboarding step after the side question. Eight questions (4 Python,
  4 HTTP) suggest a start (Academy / Signal Tower / Router Station), saved as
  `start_district`; "Next up" begins there. Nothing is unlocked or locked by it.
- Fallbacks: reduced motion = one still per chapter (fixed a packet pile-up on scroll); no WebGL =
  skyline + SVG cutaway of the tower; performance mode = lighter tower interior.

## 2026-09-26 — Session 3: Full Stack City homepage

### Done

- Rebrand to **Full Stack City**; the in-app map is the Backend District. Plan and status:
  docs/FULL_STACK_CITY.md.
- Homepage is a 14-chapter 3D tour: 5 Frontend District chapters across the city (coming soon),
  then the dive into the Backend Tower (facade cut away), steel frame and brick close-ups, and
  a floor-by-floor ride up a stairwell (lobby checkpoint, junction room, network room, vault,
  roof). Interior packets flow door → gate → riser → junction → handler.
- Choose your side section (Frontend / Backend / Full stack) with Notify me; signup keeps the
  chosen goal (`/signup?goal=`). Admin shows interest per track.
- Phone pass: chapter cards at the bottom, compact sections, briefing width bug fixed, header
  on one line. Daybreak interior glare fixed.

## 2026-09-26 — Session 2: server progress, new districts, admin

### Done

- **Progress on the server**: `features/progress/useLearning` (React Query on `/me/progress`)
  replaces the localStorage store. First load moves browser-kept onboarding + briefings to the
  account (`legacy.ts`); checkpoints are left behind on purpose (server-graded only).
  Onboarding is a user flag (`user.onboarded`), so login skips `/welcome` on any device.
- Topics now have **2 practice games + a checkpoint**: district page lists each step with
  locks; "Next practice" / "Take the checkpoint" CTAs; step trail and mission cards follow.
- **Router Station opened** with a new 5-step briefing (routes, path/query params, order);
  Signal Tower and Gatehouse briefings end with their new games.
- Checkpoint result: hint penalty line, retest cooldown time, recap nudge after 2 fails;
  cooldown errors shown in the editor.
- Request log shows `METHOD path?query {json}` and marks body checks (`+`).
- **Admin panel** (`/admin`, content editors + super admins): content tree with topic
  settings, game editor (fields + JSON sections, versions, test-run with every hidden case,
  publish), learner list/search, learner detail with topic progress, attempts and account
  actions. "Admin" link in the account menu for admins.
- `src/proxy.ts`: stamps the real client IP + `PROXY_SHARED_SECRET` on `/api/*` for rate limits.
- Verified in Chrome (Playwright) against the local stack: signup → server onboarding →
  practice in Pyodide saved → checkpoint graded with a hint (95%, 2★) → admin edit → test-run
  → publish → learners get v2. `npm run check` and `npm run build` pass.

## 2026-09-26 — Deployed + hardening

### Done

- First production deploy (Vercel + Render + Neon), guide in `docs/DEPLOY.md`.
- `sync-harness` ignores an empty `HARNESS_LOCAL_PATH` and falls back to the GitHub pin
  (Vercel build failed on it).
- Checkpoint shows a "Grading on the server…" notice while the slow free CPU grades.
- Secret scan of both repos' full history: only placeholders; nothing real committed.

## 2026-09-25 — Round 9: sound + stronger night palette

### Done

- **Sound** (`lib/sound/engine.ts`): Web Audio synth cues, no audio files. `SoundDelegate` unlocks audio on the first gesture and gives every button/link a soft click; `data-sound="<cue>"` picks a cue, `data-sound="none"` opts out. Cues: map select/step/open, answer correct/wrong, run whoosh, per-request pass/bounce/crash, hint sparkle, submit, win/lose, lesson complete, homepage chapter chords, relay packet. Sound is on by default (persist v1 migration flips the old muted default); hero has a "City sound" toggle.
- Night 3D city: synthwave sky gradient (indigo to magenta horizon) with violet fog, per-face shading, brighter rims, neon street uplight, more lit windows with warm apartment lights, district color glow.
- Night map: cobalt / teal / violet-clay diorama tokens, magenta + amber horizon glow; traffic stage gets a night sky gradient.

## 2026-09-25 — Round 8: golden-hour Daybreak scenes

### Done

- 3D city (Daybreak): directional face colors in the tower shader (warm sun side, blush front, violet shade, cream roofs), district color wash (Academy mint, Signal cyan, Gatehouse amber), cobalt sky-glass windows with neon signage in lit districts, AO at street level, navy rims, sand blocks + slate roads, positioned sky stops melting into warm fog, Neutral tone mapping. Night look untouched.
- Map (Daybreak): diorama tokens (`--bc-plate-*`, `--bc-tower-*`, `--bc-road`, `--bc-skyline`): cream plates on clay sides, cobalt open towers with warm windows, mint cleared, lavender WIP; towers have side + roof faces in both themes; saturated dawn sky.
- Traffic stage: `--bc-viz-*` tokens (cobalt server tower, sky gradient stage).

## 2026-09-25 — Round 7: Daybreak theme, real preloader, request relay

### Done

- **Light theme "Daybreak"**: `:root[data-theme="light"]` overrides every token (deeper inks so neons clear 4.5:1 on white, pearl/sky ground, coral dawn). Settings has a City lighting control (Night / Day / Auto). `THEME_BOOT_SCRIPT` (lib/themeBoot.ts) sets `data-theme` before first paint. Neon glows use channel vars (`rgb(var(--bc-cyan-rgb) / a)`).
- Canvas/WebGL follow the theme: 3D city has a `LOOKS.light` (sky gradient, fog, day shader uniforms, normal blending, low bloom); Pixi visualizer, map atmosphere and skyline read tokens via `cssVar` / `cssHex` and rebuild on theme change (`useResolvedTheme`). Editor syntax colors are tokens.
- **Preloader** (`landing/preloader/CityPreloader`): driven by real 3D milestones (chunk loaded, scene built, shaders compiled via `renderer.compile`, first frame presented). Light seam charges with progress, city gates open onto the scene. 20 s safety exit; reduced motion fades.
- **Request relay** replaces the static code cards in "You know this end": pick a request, the packet crosses to the gate, the exact rule line lights up, the status returns into `res.status`.
- Hero legibility: blue scrim + masked blur behind the copy, bottom wash on mobile.
- FAQ jitter fixed: answer used a margin that collapsed outside the animated height; now padding.

## 2026-09-25 — Round 6: game screen revamp

### Done

- Layout: left = mission brief + gate card + compact request table; right = tall editor with its own action bar (Run, Submit, Hint, Reset, boot status). Mobile order: brief → editor → gate → log (`display: contents` wrapper + grid areas).
- Mission brief on the brightest night surface (`--bc-brief*` tokens): objective heading, numbered rules that turn green on clear, neon mode stamp (Practice / Checkpoint / Cleared). A light paper version was tried and rejected by the owner.
- Traffic simulation moved into `TrafficModal`: opens on Run (button or Ctrl+Enter), full-size Pixi stage + request table, Esc / "Back to code", "Take the checkpoint" once practice clears. Always mounted (`inert` when closed) so the Pixi scene never restarts; page behind is `inert` while open.
- Header: one flat 56px row (back, title, text step trail, progress, account). Avatar no longer a gradient.
- Boot status is one fixed-height line in the editor action bar, so nothing shifts while Pyodide starts.
- Navy lifted one step (bg-0..3, line, editor).

## 2026-09-25 — Round 5 (owner feedback: buttons, mission clarity, headers)

### Done

- Buttons are lit sign plates: gradient face, bevel, tinted halo, hover sheen (`.plate-*` in globals.css, tokens `--bc-plate-*`). Ghost buttons are glass plates. Hero secondary CTA is a real ghost button.
- Game screen: `MissionBrief` states the win condition, numbered rules from the backend (`objective`, `rules` on the variant), and the three moves. Editor has a `main.py` tab bar naming the editable lines. Practice shows "x/3 requests correct" instead of a % meter. `StepTrail` (Briefing → Practice → Checkpoint) in the header; back button names the district.
- Headers: mystery icon buttons replaced. Signed in: account menu (avatar, email, map, labeled sound/performance switches, log out). Visitors: Log in + Sign up free + a labeled Settings menu. Stat chips say "districts cleared" / "stars earned".

## 2026-09-25 — Round 4 (owner feedback)

### Done

- Finishing a lesson-only briefing now shows a completion screen (recap, district cleared) with a
  **Next up** card for the real next mission; district pages show it once complete.
- Map: living backdrop (far skyline with twinkling windows, rising data particles, sweeping search
  beams, drifting fog) and a colored light pool under each district plate.
- Homepage: FAQ rebuilt as the city's API (request rows, `200 OK` answer cards, live `city.log`);
  finale rebuilt with animated skyline, reactor ring, both characters and a real-facts strip.
- Login / signup: split screen (living city + Bouncer gate card | focused form), field icons,
  show/hide password, strength meter, truthful small print.
- Byte and the Bouncer redrawn with lighting (key + rim light, glass visor, speculars, floor shadow).
- Fix: `SignHeading lit` never showed its gradient (the `text-text-1` utility overrode `.sign-text`).

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
- Rive characters, Recharts admin, admin panel. (Sound shipped in round 9 with Web Audio, no Howler.)
- Formal Impeccable finish review + documenter pass (not run this session; see known issues).

### Known issues

- Progress is per browser until the progress API exists.
- Pyodide first load is 5–7 s on a cold cache; later visits are cached.
- `harness.lock` points at an unpushed backend commit; Vercel builds need the backend pushed.
- Impeccable's finish-reviewer and documenter subagents aren't available in this setup; two
  screenshot rounds, the owner's review, and the mechanical detector (gradient text kept as
  pinned, decorative grids removed) stood in for them.

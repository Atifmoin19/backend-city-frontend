# Progress Log — Frontend

Newest entry on top. Update at the end of every task.

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
- Rive characters, sound (Howler), Recharts admin, admin panel.
- Formal Impeccable finish review + documenter pass (not run this session; see known issues).

### Known issues

- Progress is per browser until the progress API exists.
- Pyodide first load is 5–7 s on a cold cache; later visits are cached.
- `harness.lock` points at an unpushed backend commit; Vercel builds need the backend pushed.
- Impeccable's finish-reviewer and documenter subagents aren't available in this setup; two
  screenshot rounds, the owner's review, and the mechanical detector (gradient text kept as
  pinned, decorative grids removed) stood in for them.

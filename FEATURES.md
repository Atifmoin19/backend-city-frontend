# Full Stack City — Features & Release Notes

What learners and admins get in each release, newest first. Covers both repos (this frontend
and `backend-city-backend`); both carry the same version number.

**Versioning**

- **Minor** (v1.2.0 → v1.3.0): something major is added: a new chapter or district, new games
  or quizzes, a new page or feature.
- **Patch** (v1.3.0 → v1.3.1): something small: a bug fix, a new or changed validation rule, a
  UI tweak, copy changes.
- Docs-only changes don't get a version.

Current version: **v1.12.1**

---

## v1.12.1 — Game lists follow the admin panel (2026-09-26)

**Fixes**

- A game an admin hides no longer shows up as a step (that then failed to open). District
  pages, the map, "Next up" and the game screen's next button all use the live game list.
- A game an admin publishes appears in its topic without a site update.

## v1.12.0 — Password reset and email verification (2026-09-26)

**Learners**

- **Forgot password?** on the login page: get an email link (valid 1 hour, works once) and set
  a new password at `/reset-password`. Your progress, stars and badges stay; every other
  device is signed out.
- **Verify your email**: signup sends a link; a slim bar on signed-in screens shows until you
  verify, with **Resend** (older links stop working) and a close button.

**Validation**

- New passwords: 8 to 128 characters, typed twice.
- Reset and verification links are single use and expire (reset 1 hour, verify 24 hours).
- "Forgot password" answers the same for every email, so nobody can check who has an account;
  at most 5 email requests an hour per visitor.

**Setup**

- Emails go out through EmailJS once its keys are set on Render (steps in DEPLOY.md, "Account
  emails"). Until then the pages work but no email is sent.

## v1.11.0 — Daily challenge (2026-09-26)

**New game**

- **Daily challenge** (`/daily`): five questions drawn from every drill (status codes, routes,
  the gate), the same for everyone that day, new at midnight. Explanations after each answer.
- The first round each day earns **20 bonus XP** plus 2 per right answer and counts for your
  streak; replays are just practice.
- A **Daily challenge** card on the map shows whether today's is done.

**Gameplay**

- New badge: **Daily regular** (finish the daily challenge on five different days).

## v1.10.0 — Share your checkpoint result (2026-09-26)

**Learners**

- After passing a checkpoint, **Share your result** draws a card (game, district, your name,
  score and stars over the city skyline) in the social preview size.
- Download it, share it straight from a phone, or post to X / LinkedIn with a ready-made line
  and the site link.

## v1.9.0 — Try before you sign up (2026-09-26)

**Learners**

- Visitors can play the first practice game (Signal Codes) without an account: "Or try a game
  first, no account needed" under the homepage buttons.
- Clearing it as a guest keeps the win on the device for 2 hours with a "Sign up free to keep
  it" prompt; signing up (or logging in) saves it to the account automatically.

## v1.8.0 — Characters come alive (2026-09-26)

**UI**

- Byte and the Bouncer now blink; all character movement stops when reduced motion or
  performance mode is on.
- New characters: **Glitch** (the villain, a cracked cube with a jittering outline),
  **the Librarian** (keeper of the Data Vaults) and **Packet** (a request envelope that turns
  green, amber or red with its fate). They follow the Night and Daybreak themes.
- Glitch taunts you on the first orientation slide; the Librarian greets you on the Data
  Vaults map panel while it's under construction.

## v1.7.0 — Admin analytics, feedback, faster grading (2026-09-26)

**Admin**

- **Analytics** page: accounts, active learners (7 and 30 days), signups over 14 days, drop-off
  per topic (briefed → practised → tried checkpoint → passed), hardest games by pass rate,
  quiz stats.
- **Feedback** inbox with New / Seen / Done tabs.

**Learners**

- **Send feedback** from the account menu (bug, unclear lesson or game, idea, other). The page
  and game are attached automatically.

**Validation**

- Feedback: 3 to 2,000 characters, one of four kinds, at most 10 messages an hour per learner.

**Under the hood**

- Checkpoint grading runs two submissions at once, so one slow submission no longer makes the
  next learner wait.

## v1.6.0 — XP, streaks, badges, a city that lights up (2026-09-26)

**Gameplay**

- **XP and levels**: briefing 20 XP, practice game 30, checkpoint 100 + 25 per star, 2 per
  right quiz answer (first 3 rounds per quiz per day). Level 1 needs 100 XP, each next level
  50 more. Past work counts.
- **Streaks**: days in a row with any activity, in your own timezone.
- **11 badges** (First 200 OK, Well briefed, Warmed up, Lights on, No-Hint Hero, Night shift
  regular, Combo x5, Sharp eye, Found your start, Three-day streak, Week on the clock), each
  with the date earned.

**UI**

- Header chip shows level, XP and streak; `/badges` page with the level bar, streak and every
  badge; a pop-up when you earn a new one.
- **City restoration**: on the map, each district's windows light up as its briefing, practice
  and checkpoint are done.

## v1.5.0 — Quizzes and the placement check (2026-09-26)

**New games**

- **Status Code Speed Round** (Signal Tower): 60 seconds, pick the status code for each
  outcome, chain right answers for combos.
- **Pick the Line: Routes** (Router Station) and **Pick the Line: The Gate** (Gatehouse): choose
  the missing line of code, with an explanation after each answer. Phone-friendly.
- New questions and option order every round; answer with keys 1-4 and Enter.
- District pages list them under **Extra practice** with your best score.

**Onboarding**

- Optional **placement check** after the side question: 8 questions (Python and HTTP) suggest
  where to start (Academy, Signal Tower or Router Station). "Next up" starts there; nothing is
  locked or unlocked.

## v1.4.0 — Academy warm-ups (2026-09-26)

**New games** (The Academy, optional)

- **Front Desk**: read a JSON body as a dict; answer with f-strings, `len()` and `in`.
- **Score Board**: filter and rank a list with a comprehension and `sorted(key=...)`; return
  `None` when nobody passed.
- The Academy stays cleared for anyone who already finished its briefing.

**UI**

- When a request gets the right status but the wrong JSON, the request log now shows what the
  response should contain next to what your server sent.

## v1.3.1 — Flicker fixes (2026-09-26)

**Fixes**

- Homepage story cards no longer flicker when you stop scrolling at a chapter edge.
- The Backend Tower's glass roof no longer flickers.

## v1.3.0 — Full stack pull-out and "Which side of the city?" (2026-09-26)

**Homepage**

- Two new chapters at the end of the tour: **Full stack** (the camera leaves through the roof,
  the glass closes, glowing lines join the windows to the wiring inside) and **Choose your
  side**, now shown over the 3D city. Phones swipe the three cards.
- Fallbacks: reduced motion shows one still frame per chapter; browsers without WebGL get the
  2D skyline with a drawn cutaway of the tower; performance mode builds a lighter tower.

**Onboarding**

- New first step: **"Which side of the city?"** (Frontend, Backend, Full stack), preselected if
  you picked a side on the homepage. Frontend and Full stack add you to the Notify me list and
  offer the Backend District meanwhile.

**UI**

- The map is called **Backend District** everywhere (was "City map").

## v1.2.0 — Full Stack City (2026-09-26)

**Brand**

- Backend City is now **Full Stack City**: the city surface is the Frontend District (coming
  soon), the inside of its buildings is the Backend District (open).

**Homepage**

- A 14-chapter 3D tour: five Frontend District stops (HTML, CSS, JavaScript, components), then a
  dive into the Backend Tower, floor by floor (lobby checkpoint, junction room, network room,
  vault, roof).
- **Choose your side** with **Notify me** for the coming-soon sides; signup keeps your choice.

**Admin**

- Content page shows how many learners asked to be notified per track.

## v1.1.0 — Progress on the server, three districts, admin (2026-09-26)

**New chapters and games**

- **Router Station** opens: new briefing (routes, path and query parameters, route order).
- Every topic now has **2 practice games + a checkpoint**. New games: Signal Codes, Method
  Lanes, Tower Relay (checkpoint); Platform Paths, Query Filters, Route Dispatcher
  (checkpoint); Ticket Booth, Badge Check.

**Gameplay**

- Progress is saved on your account and follows you across devices.
- Hints cost 5 points each on a checkpoint and rule out 3 stars; optional retest cooldown; a
  recap nudge after two failed attempts.

**Admin**

- Admin panel: content tree, topic settings, game editor with versions, test-run against every
  hidden request, publish; learner list, search and detail; block, role and reset actions.

**Under the hood**

- Grading takes about 1 s instead of 7-11 s (pre-warmed sandbox).
- Security fix: learner code can no longer fake a checkpoint result.

## v1.0.1 — Hardening (2026-09-26)

**Fixes**

- Correct checkpoint answers no longer time out on the slow free server.
- "Grading on the server…" notice while a checkpoint is graded.
- API schema hidden in production.

## v1.0.0 — First release (2026-09-25)

- Sign up, log in, first-run orientation, world map.
- Briefings for the Academy (Python for JavaScript developers), Signal Tower (HTTP) and
  Gatehouse (validation), with quick checks.
- **Guard the Signup Gate**: write Pydantic rules in a real FastAPI server and watch live
  traffic pass, bounce (422) or crash; practice runs in the browser, the checkpoint is graded
  on the server with hidden requests and a fresh variant every retest.
- Mission brief with objective and numbered rules, traffic view, request log.
- 3D neon city homepage with a real-load preloader and a request relay demo.
- Night and Daybreak themes, synthesized UI sound, performance mode, reduced-motion support.

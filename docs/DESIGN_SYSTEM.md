# Design System — Backend City

Pinned by ideology §9. Tokens: `src/styles/tokens.css` (raw values) → `src/styles/globals.css`
(`@theme inline` maps them to Tailwind utilities like `bg-bg-2`, `text-cyan`, `shadow-glow-green`).
Components never use raw hex.

## Direction

**The city is a live status board.** Every light means something: a request in flight, a
request served, a request bounced, a server that crashed. Night-navy ground, four semantic neons,
wide sign-plate display type, thin cables carrying pulses. Glass only where a panel floats over
a moving scene. The code editor is always calm.

## Color

| Token                          | Value                             | Use                                           |
| ------------------------------ | --------------------------------- | --------------------------------------------- |
| `bg-0`                         | `#0b1124`                         | page ground, map void                         |
| `bg-1`                         | `#10182f`                         | base surfaces, inputs                         |
| `bg-2`                         | `#172242`                         | raised panels                                 |
| `bg-3`                         | `#203057`                         | hover, locked buildings                       |
| `editor`                       | `#121a33`                         | code surfaces (solid, calm)                   |
| `line` / `line-strong`         | `#2c3b69` / `#445890`             | hairlines, cables at rest, borders            |
| `text-1` / `text-2` / `text-3` | `#f2f5fd` / `#c5cee8` / `#9aa8cc` | primary / secondary (~10:1) / tertiary (~6:1) |

Semantic neons (**meaning is fixed**, never reuse for decoration):

| Token    | Value     | Meaning                                    |
| -------- | --------- | ------------------------------------------ |
| `cyan`   | `#3ee6ff` | requests, data flow, focus, primary action |
| `green`  | `#4dff9a` | success, 2xx, cleared                      |
| `amber`  | `#ffb547` | warning, 4xx, bounced, validation errors   |
| `red`    | `#ff4d6d` | error, 5xx, Glitch                         |
| `purple` | `#b27cff` | AI, Byte speaking, hints                   |

2026-09-25: surfaces and text were lifted after owner feedback that the first pass was too dark.

## Never color alone

Every state goes through `StatusLight` (icon + text; `iconOnly` keeps an sr-only label) or `Led`
next to visible text. Validation errors pair amber with an alert icon and a sentence.

## Typography

| Role        | Face                           | Notes                                                                 |
| ----------- | ------------------------------ | --------------------------------------------------------------------- |
| Display     | Unbounded 700 (`font-display`) | sign plates: headings, district names. Leading 1.04, tracking -0.02em |
| UI / body   | Sora (`font-sans`)             | body 16–18px, measure ≤ 70ch                                          |
| Code / data | JetBrains Mono (`font-mono`)   | code, status codes, request bodies                                    |

Gradient text (`.sign-text`, `SignHeading lit`) is brief-pinned: one display heading per screen,
never body copy. `SignHeading` applies leading last because `twMerge` drops `leading-*` before a
`text-[size]` class.

## Depth, glow, glass

- Glows: `shadow-glow-{cyan,green,amber,red,purple}` = 1px tinted ring + offset soft blur. Only on
  active/primary elements.
- Panels: `Panel surface="solid" | "glass" | "editor"`. Glass (`.glass`, 14px blur) only over a
  moving scene (map, visualizer HUD). Performance mode removes the blur.
- Street grid (`.city-grid`): only on map and simulation surfaces.

## Motion

| Token           | Value                        | Use                                       |
| --------------- | ---------------------------- | ----------------------------------------- |
| `--bc-ease-out` | `cubic-bezier(0.16,1,0.3,1)` | default (exponential out)                 |
| `--bc-dur-1..4` | 120 / 220 / 420 / 900 ms     | press · state swap · panel · scene moment |

Rules: one authored moment per screen (the skyline, the request flow); content visible by default;
the Pixi ticker runs only during a run; `useReducedMotion()` (OS setting, user override, or
performance mode) turns animations into final states; elements marked `data-ambient` are hidden
in performance mode.

## Components (`src/components`)

| Component                                      | Notes                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `ui/Button` (+ `buttonClasses` for links)      | variants primary · ghost · quiet · success · danger; sizes sm/md/lg; `loading`   |
| `ui/StatusLight`, `ui/Led`                     | status → icon + color + label (flow, pass, bounce, crash, ai, locked, busy)      |
| `ui/Panel`                                     | solid / glass / editor surfaces                                                  |
| `ui/SignHeading`                               | display type; `lit` = gradient                                                   |
| `ui/TextField`                                 | label, hint, error (amber + icon), aria wiring                                   |
| `ui/Kbd`, `ui/SettingsMenu`, `ui/SettingsRows` | shortcuts; labeled sound + performance switches (in account menu when signed in) |
| `layout/SiteHeader`, `Wordmark`, `SiteFooter`  | chrome                                                                           |

## Homepage 3D city

Towers are near-black navy with a thin rim on every edge (definition first, glow second). Lit
windows stay moderate: bloom threshold 0.45 so only windows, packets and the Gatehouse crown
glow. District light colors follow meaning: Academy green, Signal Tower / Gatehouse cyan,
construction neutral. One glass chapter panel per viewport; the camera frames the district on
the opposite side.

## Layout

- Signed-in screens: `AppShell` (sticky 64px top bar, nav, stat chips, account menu).
- Wide screens: max-w-7xl content with a main column + 19–22rem side rail. No lone narrow column.
- Map: full-bleed world + 25rem side HUD (mission, district drawer, guide); world scrolls
  horizontally below 60rem.
- District states on the map: open (cyan windows, beacon, glow), cleared (green windows),
  under construction (dashed towers, scaffolding, crane, neutral text; never amber).

## Characters

Contract: `CharacterProps { state: idle|happy|sad|thinking|worried|celebrating; size; label }`
(`components/characters/types.ts`). Placeholder SVG + Motion today (`Byte`, `Bouncer`); a Rive
component can implement the same props (state → state-machine input). Resolve by content key with
`<Character name="bouncer" />`. Byte speaks for AI and hints (purple bubble); district characters
speak game dialogue (neutral bubble).

## Editor

CodeMirror 6 with `calmTheme`: solid `editor` surface, desaturated syntax colors (neons stay
semantic), cyan caret and selection, editable region = cyan rail + faint wash, locked lines dimmed
and read-only (`lockedRegion`). Ctrl+Enter and Cmd+Enter run.

## Direction contract

Lives as a comment at the top of `src/app/layout.tsx` (JSX comments don't reach built HTML, so
this file is the auditable copy): THESIS status board; OWN-WORLD above; FIRST VIEWPORT full-bleed
skyline, headline bottom-left, primary CTA "Start your first shift", live light legend.

## Game screen

- Mission brief is the brightest surface (`--bc-brief`, `shadow-brief`); never a light/paper card.
- The traffic simulation lives in `TrafficModal` and opens on Run; the editor is the largest region.
- Status lines that appear while loading must have fixed height (no layout shift).

---
name: OpenRank
description: A local light table for building ranked countdown shorts, where the preview is the render.
colors:
  room: "#eceef2"
  surface: "#ffffff"
  sunk: "#f5f7fa"
  line: "#dfe3ea"
  line-strong: "#c8cfdb"
  ink: "#14161c"
  muted: "#596070"
  faint: "#858c9c"
  rank: "#e0930f"
  rank-deep: "#b4740a"
  rank-wash: "#fdf4e3"
  rank-edge: "#f0dcb4"
  commit: "#c31840"
  commit-deep: "#a1102f"
  commit-press: "#8c0d28"
  commit-wash: "#fdecef"
  commit-edge: "#f3c6cf"
  commit-ink: "#8f1030"
  on-signal: "#ffffff"
  press: "#eceef3"
  letterbox: "#0e0f13"
  trim-in: "#0f8a5f"
  focus: "#5230d9"
typography:
  wordmark:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  numeral:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  heading:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.005em"
  body:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  data:
    fontFamily: "'Space Mono', ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  small:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "'Space Mono', ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  stage: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "20px"
components:
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "18px 20px"
  button-primary:
    backgroundColor: "{colors.commit}"
    textColor: "{colors.on-signal}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 11px"
  button-primary-commit:
    backgroundColor: "{colors.commit}"
    textColor: "{colors.on-signal}"
    typography: "{typography.heading}"
    rounded: "{rounded.md}"
    padding: "13px"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
  input:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 11px"
  rank-medal:
    backgroundColor: "{colors.rank}"
    textColor: "{colors.ink}"
    typography: "{typography.numeral}"
    rounded: "{rounded.md}"
    height: "44px"
    width: "44px"
  order-position:
    backgroundColor: "{colors.rank-wash}"
    textColor: "{colors.rank-deep}"
    typography: "{typography.data}"
    rounded: "6px"
    height: "24px"
    width: "24px"
  download-link:
    backgroundColor: "{colors.rank}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 15px"
---

# Design System: OpenRank

## 1. Overview

**Creative North Star: "The Light Table"**

A cool, calibrated worksurface in daylight. One person sits at it, cuts clips, and inspects the result — and the 9:16 preview sits on that surface like a slide on a light box: the single dark, saturated object in an otherwise quiet room. Everything else is white worksurface, hairline rule, and an exact number set in mono. The interface reads as an instrument for measuring and trimming, not as a piece of software with opinions about itself.

The system's governing tension: **the product this tool makes is loud, and the tool itself is not.** Poster faces — Anton, Bangers, Archivo Black, Luckiest Guy — exist in this project only as *choices the operator applies to the video*. They never appear in the interface. That division is the whole idea: display type in the chrome would put the tool in competition with the thing it produces.

This rejects the generic dark SaaS dashboard it started as, and equally rejects the obvious light alternative: white cards plus a blue primary button, which is precisely what viblo.ai looks like. Colour here is restrained to two signals with real jobs — amber for rank, deep crimson for commit — and nothing is coloured for decoration.

**Key Characteristics:**
- Cool light neutrals; never cream, sand, or paper-warm
- One UI family (Space Grotesk); monospace reserved strictly for measured values
- No display faces anywhere in the interface
- Exactly two signal colours, each with one job
- The preview is the only dark object on screen

## 2. Colors

A cool white room lit by two signals: one that means rank, one that means commit.

### Primary
- **Rank Amber** (`#e0930f`): Rank and the finished artifact. It fills rank medals (with ink text on top), tints running-order chips, and fills the download control once a render exists. It is never used as text on a light surface, where it would fail contrast; it is a fill colour.
- **Rank Amber Deep** (`#b4740a`): The readable amber. Used for the `RANK` kicker, order-position digits, and the wordmark's second half — anywhere amber must be *text*.
- **Rank Wash** (`#fdf4e3`) / **Rank Edge** (`#f0dcb4`): Recessed amber surfaces and their borders.

### Secondary
- **Commit Crimson** (`#c31840`): The one colour that means "this control does work." Import, render, delete. Carries white text at 6.5:1. Deepens to `#a1102f` on hover and `#8c0d28` on press.
- **Commit Wash** (`#fdecef`) / **Commit Edge** (`#f3c6cf`) / **Commit Ink** (`#8f1030`): The error surface, its border, and its readable text.

### Tertiary
- **Trim In** (`#0f8a5f`): The trim start handle only. Reads as "in" against crimson's "out".
- **Focus Violet** (`#5230d9`): Keyboard focus rings, and nothing else ever. Deliberately outside both signals so a focus ring can never be mistaken for rank or action.

### Neutral
- **Room** (`#eceef2`): The page. A cool light gray — the light table itself.
- **Surface** (`#ffffff`): Work surfaces. Every panel.
- **Sunk** (`#f5f7fa`): Input wells and recessed rows, one step *down* from the surface so fields read as receptive.
- **Line** (`#dfe3ea`) / **Line Strong** (`#c8cfdb`): Hairlines. Structural separation only.
- **Ink** (`#14161c`): Primary text, 16.9:1 on white.
- **Muted** (`#596070`): Secondary text and units, 7.4:1 on white.
- **Faint** (`#858c9c`): Tertiary marks only — tick labels, disabled numerals. Never body copy.
- **Letterbox** (`#0e0f13`): Behind video elements, matching the player's own bars.

### Named Rules

**The Two Signals Rule.** Amber means rank. Crimson means commit. A colour that means both means nothing. If a new element needs emphasis and is neither a ranking artifact nor a committing control, it gets weight, size, or position — not a third accent.

**The Cool Floor Rule.** Every neutral in this system is cool. No cream, sand, bone, parchment, or warm-tinted near-white; that band is the saturated default of the moment and it also misleads the eye when judging colour in the video beside it.

**The Amber-Is-A-Fill Rule.** `#e0930f` never appears as text on a light surface. When amber must be read as type, it is `#b4740a`.

## 3. Typography

**UI Font:** Space Grotesk (with system-ui, sans-serif)
**Data Font:** Space Mono (with ui-monospace, monospace)

**Character:** One proportional grotesque carries the entire interface; a true monospace carries every measured value. The pairing works on a real contrast axis — proportional against monospaced — rather than on two sans-serifs that almost match. Space Grotesk has enough character in its numerals and its `g` to feel designed rather than defaulted, while staying quiet enough to disappear into a task.

The scale is fixed in rem, not fluid. Product UI is viewed at consistent DPI; a heading that shrinks inside a sidebar looks worse, not better.

### Hierarchy
- **Wordmark** (700, 1.25rem, tracking -0.015em): The brand only.
- **Numeral** (700, 1.375rem, tabular): Rank medals. The signature element.
- **Heading** (600, 0.9375rem): Panel and section headings, sentence case.
- **Body** (400, 0.875rem, line-height 1.5): All interface text and controls. Prose caps at 65–75ch.
- **Data** (Space Mono, 0.8125rem): Durations, percentages, hex values, dimensions, counts.
- **Small** (400, 0.75rem): Helper text under controls.
- **Label** (Space Mono, 0.6875rem, tracking 0.1em, uppercase): Field-group labels only.

### Named Rules

**The Mono Numeral Rule.** Every number the operator reads or types is set in Space Mono — trim seconds, percentages, hex codes, frame dimensions, order positions. A number in the UI face is a bug. Mono is how the interface says "this is a measured value, not prose."

**The No-Display-Type Rule.** No display or poster face appears anywhere in the interface — not in headings, not in buttons, not in the wordmark. Anton, Bangers, Archivo Black and the rest are *content*, offered to the operator as choices for the video. Putting them in the chrome breaks the division the whole product rests on.

**The Sentence Case Rule.** Headings are sentence case. Tracked uppercase is reserved for mono field labels, which name a group of controls; it is never applied as a decorative rhythm above every section.

## 4. Elevation

Layered and lifted, but quietly. White surfaces sit above a cool gray room; the step in tone does most of the structural work, and a 1px hairline finishes each edge. Shadow is then reserved for two jobs: a barely-there resting shadow that keeps panels from looking pasted onto the page, and a slightly deeper lift on hover for clip entries, which are the only draggable, reorderable objects in the interface. Inputs move the other way — they are *sunk* below the surface rather than raised.

### Shadow Vocabulary
- **Surface rest** (`0 1px 2px rgba(20,22,28,0.05)`): Every panel. Enough to separate white-on-gray, not enough to notice.
- **Entry lift** (`0 1px 2px rgba(20,22,28,0.06), 0 8px 20px -12px rgba(20,22,28,0.25)`): Clip entries on hover.
- **Slide frame** (`0 0 0 1px var(--line-strong), 0 18px 44px -20px rgba(20,22,28,0.45)`): The preview. A hard ring plus a deep soft cast, so the dark 9:16 frame reads as a physical slide resting on the table.

### Named Rules

**The Bezel-Not-Border Rule.** The preview frame is built entirely from `box-shadow` drawn outside the box. This is a hard technical constraint, not a preference — see Components.

**The Sunk-Input Rule.** Controls that accept input are tinted *below* the surface (`#f5f7fa`), never raised. Raised inputs on a light theme read as buttons.

## 5. Components

### Buttons
- **Shape:** 8px, rising to 10px for the commit button.
- **Quiet (default):** White fill, hairline border, ink text. The default for everything that is not committing work — move, reorder, toggle, reset. Hover tints to `sunk`; press to `press`.
- **Primary:** Commit Crimson with white text at 8px 11px. Import and other work-starting actions.
- **Commit:** Full width, 13px padding, 0.9375rem, 10px radius. Exactly one per screen: the render control.
- **Danger:** Quiet button with crimson *text*, tinting to Commit Wash on hover. Destruction is marked, not celebrated with a red fill.
- **States:** Every button ships default, hover, active, disabled and a violet focus ring. No half-sets.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** White on the gray room, 1px `line` border, `surface rest` shadow.
- **Internal Padding:** 18px 20px.
- **Clip entries** warm their border to `line-strong` and take the `entry lift` on hover, because they are the reorderable objects.
- **Nesting is forbidden.** A panel never contains another panel. Sub-groups use a `<details>` disclosure with a hairline top rule.

### Inputs / Fields
- **Style:** Sunk fill (`#f5f7fa`), 1px hairline, 8px radius, 8px 11px padding.
- **Numeric inputs** are always mono. Not optional.
- **Focus:** Violet ring, 2px, offset 2px.
- **Disabled:** 55% opacity with `not-allowed`.
- **Labels:** Mono uppercase 0.6875rem at 0.1em tracking, above the control.
- **Every numeric field is a `NumberField`** (`src/components/NumberField.tsx`) — a `−` / value / `+` group sharing one shell, one border, one focus ring. Never a bare `<input type="number">`: a controlled one clamps on each keystroke, which makes every value between the bounds unreachable by typing. Typing is a draft; clamping happens on blur or Enter. Under `pointer: coarse` the steppers grow to 44px, because a phone gives a number input no spinner of its own.

### Icons
One set, drawn on a 16-unit grid at 1.5 stroke weight, rendered at 14px in the chrome and 13px on the preview stage. Every icon is `currentColor` and carries no fill except where the shape is genuinely solid (play, pause), so it inherits whatever the control it sits in already resolved — muted, crimson on the destructive button, white over video. Live in `src/components/Icon.tsx`; a new control reuses a name from there or adds one to it, and never reaches for a Unicode glyph.

### The Rank Medal (signature component)
The one memorable object: a 44px amber square, 10px radius, carrying a tabular ink numeral. It anchors every clip entry and states that entry's position in the ranking. Its ghost variant — dashed hairline, faint numeral, no fill — marks the not-yet-filled "add a clip" slot, so an empty position reads as a slot rather than as a rank that already exists.

### The Preview Stage (signature component)
A 9:16 slide, max 344px wide, 14px radius, framed by the `slide frame` shadow. It composites the exact output: background, video at the operator's height percentage, title, rank column, captions.

**It must never be given a `border`, `padding`, or `transform`.** The export pipeline maps 1080×1920 output coordinates from this element's bounding box, and measures the live geometry of `.stage-title`, `.stage-numbers`, `.stage-number`, and `.stage-number-caption` to rasterize overlays. A 1px border here shifts every exported overlay by roughly 3px at full resolution. Frame it from the outside only.

Everything inside `.stage` sits on the operator's **video background**, not on the UI surface. Its text is light-on-dark by necessity and must never inherit the light theme's ink colours.

### Navigation
There is none, and none should be added. One operator, one screen, one workflow: a sticky header carrying the wordmark and the single destructive reset.

## 6. Do's and Don'ts

### Do:
- **Do** set every number the operator reads or types in Space Mono, per The Mono Numeral Rule.
- **Do** keep amber for rank and crimson for commit; reach for weight or position when something else needs emphasis.
- **Do** use `#b4740a` when amber must be read as text, never `#e0930f`.
- **Do** frame the preview stage from outside with `box-shadow` only, so export coordinate mapping stays exact.
- **Do** give every control the full state set — default, hover, active, disabled, focus — and a visible violet focus ring.
- **Do** keep transitions in the 150–250ms band, and only for state changes.

### Don't:
- **Don't** put a display or poster face in the interface. They belong to the video output. This is the product's central division.
- **Don't** build a **generic dark SaaS dashboard** — the near-black-plus-one-blue-accent shape this project started as.
- **Don't** recreate **viblo.ai**: white cards with a blue primary button, templated and credit-metered. A light theme makes this the easiest mistake to make.
- **Don't** import **professional NLE** density: multi-track timelines and stacked panel furniture for a job that should take minutes.
- **Don't** let it become a **toy meme generator**: gimmicks, novelty faces, or cartoon chrome undercut that this is a production tool.
- **Don't** use warm near-whites — cream, sand, bone, parchment. Every neutral here is cool.
- **Don't** add orchestrated page-load animation. Motion conveys state; it does not introduce the page.
- **Don't** use a `border-left`/`border-right` over 1px as a coloured accent stripe.
- **Don't** apply `background-clip: text` gradients, or decorative blur and glass.
- **Don't** nest a panel inside a panel.
- **Don't** add a tracked uppercase eyebrow above every section.
- **Don't** use emoji or Unicode symbol glyphs (🔀, ▸, ⌫, ↑) as interface icons. They render at a different weight, colour, and baseline on every machine, so they cannot be part of a design system. Draw the icon.

### Named Rules

**The Earned Numeral Rule.** Numbered markers are normally AI scaffolding, and in this one product they are not: the clips genuinely are an ordered ranking and the running order genuinely is a countdown. Rank numerals are load-bearing content and must never be stripped as decoration. That licence does not extend anywhere else — do not number panels, steps, or sections that are not a real sequence.

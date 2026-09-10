# frontend.md — muhammedajmal.com

**Implementation specification for the front end.** It does *not* replace DESIGN; the governing
register stays closed at four (see the Document register note below).
Repo: `a-muhammed-ajmal/consulting` · branch `main` · Next.js 16 (App Router) + Tailwind v4.

**Direction: C — Signal Stack.** Banner hero with rotating spoke arc and ambient orbs, tinted-header cards,
chip marquee, sweeping-shine CTA, tint-heavy section banding, glass panels on dark bands.

**Colour and typography are unchanged.** Every token below is read from `src/app/globals.css` at
`main@b4f70e9`. What is new is layout, component structure, interaction and motion — the functional
vocabulary lifted from the Ossisto component library and re-expressed in these existing tokens.

> **Document register.** `CLAUDE.md` closes the governing register at four documents and DESIGN is
> `.claude/skills/frontend-design/SKILL.md`. This file is therefore **not** a fifth governing document.
> It is an implementation specification: everything in §1 restates DESIGN and is authoritative only
> because it matches it. Items marked **[DESIGN CHANGE]** conflict with DESIGN as written and must be
> merged into the DESIGN skill *before* they ship. Nothing here overrides ANCHOR, PRODUCT, WEB, or DESIGN.

---

## 1. Foundations

### 1.1 Colour

| Token | Value | Use |
| --- | --- | --- |
Use the **semantic aliases**, never the numbered scales, in component code. Tailwind v4 generates the
utility from the `@theme` key, so `--color-brand` is `bg-brand` / `text-brand` / `border-brand`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-brand` | `#0066FF` | Primary fills, CTAs, focus, active state, numerals |
| `--color-brand-hover` | `#0039CC` | Primary button hover fill (8.6:1) |
| `--color-brand-ink` | `#003399` | Blue **text** on white (10.9:1), links, gradient start |
| `--color-brand-tint` | `#E6F0FF` | Alternating section band, card headers, selected rows |
| `--color-brand-soft` | `#DBEAFE` | Icon tiles, chips, chart fills |
| `--color-accent` | `#FFCC00` | **Fill only** (1.51:1) — dark-band text, dots, orbs, borders |
| `--color-accent-ink` | `#CC6600` | Amber **text** on a light surface (3.8:1 — large-text/UI only) |
| `--color-accent-soft` | `#FFF8E6` | Amber wash panels |
| `--color-ink` | `#000033` | Body text (20.0:1); also the dark band surface |
| `--color-muted` | `#475569` | Secondary text — the lightest legal text on light (7.6:1) |
| `--color-muted-invert` | `#CBD5E1` | Secondary text on `--color-ink` (13.5:1) |
| `--color-line` | `#E2E8F0` | Hairlines, card borders, input borders |
| `--color-line-strong` | `#CBD5E1` | Emphasised divider |
| `--color-canvas` / `--color-surface` | `#FFFFFF` | Page and card surface |
| `--color-canvas-light` | `#F8FAFC` | Inset wells, admin shell |
| `--color-canvas-dark` | `#000033` | Dark band surface (`bg-canvas-dark`) |
| `--color-success` / `--color-warning` / `--color-danger` | `#0B6B43` / `#9A5B08` / `#C0281D` | Status text, each with a `-soft` wash |

**Gradient.** One: `.brand-gradient-text` — `linear-gradient(100deg, electric-700, electric-500)`.
Both ends clear 4.5:1, so it is safe at any size. Used for the accented clause of an H1 and for
progress-bar fills. Do not author new gradients.

**Amber rule (from DESIGN, unchanged).** `#FFCC00` is 1.51:1 on white and is **fill only**. Amber text
on a light surface uses `--color-accent-ink` `#CC6600` (3.8:1 — large-text/UI only, below AA-normal). Amber is legal as: `.eyebrow` text inside
`.bg-canvas-dark` (handled automatically in `@layer base`), a status dot, a glass-panel label, an
`.orb-amber` at 20% opacity, or a border highlight.

**Tint band note.** `#CCE0FF` used in the Signal Stack prototypes is **not a token**. Tinted-surface
borders use `--color-line` on `--color-brand-tint`, or `--color-brand-soft` where a stronger edge is
wanted. **[DESIGN CHANGE]** if a dedicated tint border is genuinely required.

**Dark band budget.** Maximum two `--color-ink` bands per route: one mid-page proof band (optional)
and one closing CTA. Home may use both; every other route uses one.

### 1.2 Typography

**Two faces, not one.** Headings and display type take **Plus Jakarta Sans** (`--font-heading`,
`--font-display`). Body, UI and small text take **Lexend** (`--font-body`, `--font-sans`), **capped at
weight 500**. `--font-mono` is Plus Jakarta Sans with `tabular-nums` — a numeral treatment, not a
different typeface. Both are supplied by `next/font/google` in `layout.tsx` and self-hosted; never add
a `<link>` or `@import` for either. No italics.

> The Signal Stack prototypes used Plus Jakarta Sans throughout and weights up to 800. That was a
> prototype shortcut. Production is the two-face pairing above, and **body weight never exceeds 500**.

**Never hardcode a px font-size.** Every size is a step token, which is how the mobile ceilings apply
for free. Write `text-[length:var(--step-4)]`.

| Step | < 768px | ≥ 768px | Role |
| --- | --- | --- | --- |
| `--step-5` | **24px** | 48px | H1 |
| `--step-4` | 22px | 32px | H2 / section title |
| `--step-3` | 20px | 24px | H3 |
| `--step-2` | 18px | 20px | H4 |
| `--step-1` | 16px | 18px | Card title, H5 |
| `--step-0` | **14px** | 16px | Body, lists, descriptions |
| `--step--1` | 12px | 13px | Micro-copy, labels, eyebrows, `text-xs` |

**Mobile ceilings are hard and stricter than the prototypes:** H1–H4 must not exceed **24px**
(the steps sit *under* that ceiling — 18 / 20 / 22 / 24px — not at it) and body
must not exceed **14px** below 768px. Long-form article body is the one sanctioned exception (16px on
mobile, WEB §8, via `.article-longform`). Inputs are a second: `input, select, textarea` are pinned to
16px to stop iOS zoom — 16px fields next to 14px body on mobile is expected, not a bug.

Heading tracking comes from `globals.css`: H1/H2 `letter-spacing: .005em`, H3/H4 `0`. The negative
tracking in the prototypes is **not** the house style — do not reintroduce it. `h1–h6` get
`text-wrap: balance`, `p` gets `text-wrap: pretty`.

`.eyebrow` is a **body-font** utility: Lexend, weight 500, `--step--1`, uppercase, line-height 1.4,
**no letter-spacing**, colour `--color-accent-ink` on light and `--color-accent` inside `.bg-canvas-dark`.
The 800-weight `.14em` eyebrow in the prototypes is superseded by this.

Measure: long-form is `--measure: 68ch`, declared on `.article-longform` in `globals.css` — the one
measure token that exists. Body, H2 and H1 measures are call-site utilities (`max-w-2xl` on the
existing `PageHero` lead); there is no `54ch` / `24ch` / `20ch` token to reference.

### 1.3 Space, radius, elevation

Space scale is `--space-1..9`: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`px. Radius is
`--radius-1` `8px` · `--radius-2` `12px` · `--radius-3` `16px` · `--radius-pill` `999px`.
There is no 14px or 18px radius — the prototypes' values round to `--radius-2` and `--radius-3`.

Section padding: `--space-9` block (`--space-8` below 768px), `--space-4`→`--space-6` inline —
which is what `<Section>` already emits as `py-16 md:py-24` / `px-6`.
Container width comes from `<Section width>`: `prose` 768px · `narrow` 1024px · `default` 1152px ·
`wide` 1280px. There is no `1120px` container; do not introduce one.

| Token | Value | Use |
| --- | --- | --- |
| `--shadow-1` | `0 1px 2px rgba(0,0,51,.06)` | Resting card, input |
| `--shadow-2` | `0 4px 12px rgba(0,0,51,.08), 0 2px 4px rgba(0,0,51,.04)` | Card hover, glass panel |
| `--shadow-3` | `0 10px 28px rgba(0,0,51,.12), 0 4px 8px rgba(0,0,51,.06)` | Floating panel |
| `--shadow-glow-electric` | `0 8px 24px rgba(0,102,255,.22), 0 2px 6px rgba(0,102,255,.12)` | Primary CTA hover |
| `--shadow-glow-amber` | `0 8px 24px rgba(255,204,0,.28), 0 2px 6px rgba(212,158,0,.16)` | Secondary CTA hover |

The deep offset-negative-spread ramp in the Signal Stack prototypes
(`0 26px 54px -22px …`) is **not in the theme**. Shipping it is a **[DESIGN CHANGE]** — see §2.1 `Card`.

### 1.4 Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-1` | `120ms` | Colour, opacity |
| `--dur-2` | `200ms` | **The mandated hover duration** — `transition-all duration-200` |
| `--dur-3` | `400ms` | Progress bar, accordion, carousel |
| `--dur-4` | `650ms` | Entrance reveal |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Everything entering or settling |
| `--ease-in` | `cubic-bezier(.5, 0, .75, 0)` | Exits only |

There is **no spring easing token**. The `cubic-bezier(.34,1.56,.64,1)` tile bounce from the Ossisto
library is a **[DESIGN CHANGE]** — until DESIGN adopts it, icon tiles scale on `--ease-out`.

**Reveals are native CSS scroll-driven**, not JavaScript and not fixed delays. Use the existing
classes: `.reveal` (staggered entrance, `nth-child` 100ms apart, capped at 5), `.stage-reveal`
(`animation-timeline: view()`, `entry 10% cover 30%`), `.heading-reveal` (`entry 5% cover 25%`),
`.reading-progress` (article scroll bar). All are double-guarded behind
`@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`.

Ambient loops: orb drift `16–25s`, hero spoke arc `46s`, counter-ring `28s`, marquee `28–34s`,
CTA shine `3.4s`, status dot blink `2.4s` — all `linear` or `ease-in-out`, infinite, decorative,
`aria-hidden`. **New keyframes go in `globals.css`, never inline.**

Transform and opacity only. Never animate `height`, `top`, `width` — accordions use
`grid-template-rows: 0fr → 1fr`. The global `prefers-reduced-motion` block in `globals.css` already
collapses every animation and transition to `.01ms`; ambient loops resolve to their rest frame.

### 1.5 Focus and a11y

Focus is already global: `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px }`.
Do not add a second ring or override it; on dark bands add `outline-color: #fff` only.
Hit targets ≥44px — use the existing `.tap-target` utility on every icon-only control.
Decorative orbs, arcs, rings and marquees carry `aria-hidden="true"` and sit in a positioned,
`overflow-hidden` parent. Marquee content is duplicated for the loop — the duplicate set is `aria-hidden`.

---

## 2. Component library

Nine primitives, eleven composites. Nothing else ships without being added here first.

### 2.1 Primitives

**`Button`** — **already shipped at `src/components/ui/Button.tsx`. Do not re-author it.**
`variant: primary | secondary | quiet | accent | danger`, plus `fullWidth`. There is no `size` prop:
the base class carries `min-h-11` (the 44px floor), and 44px is the whole control height for buttons.
All variants already carry `transition-all duration-200 ease-out`, `rounded-xl` (`--radius-2`),
`font-body text-[length:var(--step-0)] font-medium` (Lexend at 500 — the body cap applies to button
labels), the `focus-visible` outline, disabled styling, and the mandated `-0.5` (2px) hover lift.
Primary: `bg-brand text-white shadow-1`; hover `bg-brand-hover` + `--shadow-glow-electric`.
The house gesture — **2px, not 6px**.
Secondary: `border-brand text-brand-ink`; hover fills blue.
Quiet: `border-line bg-white text-ink`; hover blue border + `text-brand-ink`.
Accent: `bg-accent text-canvas-dark`; hover `bg-accent-hover` + `--shadow-glow-amber`. Amber pairs
with **dark slate text, never white** — this is the AA-safe amber button and the established
dark-band CTA.
Danger: `bg-danger text-white`, destructive confirm only.

> **Corrected.** An earlier draft of this section listed `primary | secondary | ghost | dark-glass`
> with a `size` prop. That vocabulary came from the prototypes, not from the shipped component, and
> disagreed with both `Button.tsx` and DESIGN `references/components.md`. The five variants above are
> the real ones. The prototypes' **ghost** maps onto the existing **`quiet`** — do not add a `ghost`
> variant. **`dark-glass` is not needed**: every dark band on the site already uses `variant="accent"`,
> and `Button` merges `className` through `cn()`, so `.glass-panel` composes at the call site if a
> frosted button is ever genuinely wanted.

**Shine sweep** — an `::after` 38%-wide white-to-transparent gradient translating `-110% → 110%` over
`3.4s` on the primary CTA. **[DESIGN CHANGE]** — not in DESIGN today. If adopted: keyframes in
`globals.css`, one instance per viewport, primary-only, inside the existing reduced-motion guard.

**`Eyebrow`** — use the existing `.eyebrow` class as-is. Lexend, weight 500, `--step--1`, uppercase,
no tracking, `--color-accent-ink` on light and `--color-accent` inside `.bg-canvas-dark` (automatic).
Optional leading 7px `--color-accent` dot, blinking `2.4s`, when it flags a free/live offer.

**`Card` → use the shipped `<Surface>`.** There is no separate `Card` component and none is to be
created. `src/components/ui/Surface.tsx` already emits `rounded-2xl p-6` with
`tone: default | muted | accent | glass` and `interactive`. `tone="default"` is
`border-line bg-white shadow-1` — the card described here.
The **tinted header** (the Signal Stack default — a `--color-brand-tint` strip with a
`1px --color-line` bottom edge holding a numeral tile and the title, body below on white) ships as a
new opt-in prop on `Surface`, defaulting off so every existing call site renders unchanged.
The **plain** head — icon tile, title and body in one padded stack — is `Surface` as it stands today.
Hover uses the existing `.card-interactive`: `translateY(-2px)`, `--shadow-2`, border → `--color-brand`,
`200ms --ease-out`. One compound gesture — title and body never move.

> **[DESIGN CHANGE] — `card-interactive-raised`.** The richer Ossisto hover the brief asks for
> (`translateY(-6px)`, `0 26px 54px -22px rgba(0,0,51,.32)`, tile `scale(1.06) rotate(-3deg)` on a
> spring curve) needs three things DESIGN does not have: a 6px lift, a deep shadow token, and a spring
> ease. Land it as an opt-in `.card-interactive-raised` class in `globals.css` **plus** a DESIGN skill
> update in the same commit — restricted to marketing card grids, never admin or forms. Until then
> every card ships `.card-interactive`.

**`IconTile`** — 26/34/44px, radius `--radius-1`/`--radius-2`. Numeral variant: `--color-brand` fill,
white, `.font-mono` for `tabular-nums`. Glyph variant: `--color-brand-soft` fill, `--color-brand-ink`
glyph. Scales on `--ease-out` at `--dur-2` (spring is a [DESIGN CHANGE], above).

**`Chip`** — `--radius-pill`, `--color-canvas-light` fill, `--color-line` border, `--step--1`
weight 500 `--color-muted`. Hover: `--color-brand-tint` fill, `--color-brand` border,
`--color-brand-ink` text.

**`Input` / `Select` / `Textarea`** — 44px min (textarea 92px), `--radius-2`, `--color-line` border,
**16px text pinned globally** (iOS zoom), placeholder `--color-muted`. Focus: the global
`:focus-visible` outline plus border `--color-brand`. Error: border `--color-danger`, message at
`--step--1` in `--color-danger` below the field, `aria-describedby` wired, `aria-invalid` set.
On dark bands: `rgba(255,255,255,.16)` fill, `rgba(255,255,255,.32)` border, white text.

**`GlassPanel` → use `<Surface tone="glass">`.** No new component. That tone already applies the
existing `.glass-panel` class: `rgba(255,255,255,.70)`,
`blur(12px) saturate(140%)`, inset `--color-canvas-border` ring + `--shadow-2`, with an opaque
`@supports not` fallback already in place. Dark-band variant overrides to `rgba(255,255,255,.07)` /
`rgba(255,255,255,.2)`; label in `--color-accent`.

**`Orb`** — the existing `.orb` / `.orb-electric` / `.orb-amber` classes: `blur(64px)`,
`--color-electric-100` at 30% and `--color-amber-100` at 20%. `aria-hidden`, `pointer-events:none`,
in a positioned `overflow-hidden` parent. Two per band maximum, opposite corners.
Drift animation (`translate ≤26px`, `scale ≤1.08`, `16–25s ease-in-out infinite`) is a
**[DESIGN CHANGE]** — today's orbs are static. Keyframes go in `globals.css`.

**`SpokeArc`** — the hero's rotating figure, and a **[DESIGN CHANGE]**: a conic-gradient ring of 8
spokes at `rgba(0,102,255,.22)`, radial-masked to an annulus, `rotate 46s linear infinite`, plus a
concentric `1px dashed rgba(0,102,255,.28)` ring counter-rotating at `28s`. `aria-hidden`,
`pointer-events:none`, hero-only, opacity ≤.6 behind text and `.35` below 640px.

### 2.2 Composites

**`PageHero`** — **already shipped at `src/components/ui/PageHero.tsx`. Extend it; do not replace it.**
It takes `eyebrow` / `title` / `lead` / `actions` / `note` / `aside`, plus `tone`
(`white | light | tint`, default `white`) and `accent` (`brand | amber`). It renders through
`<Section width="wide" orbs className="py-16 md:py-24">`, so the orbs, banding, clipping and padding
are already handled. It is deliberately asymmetric — 7/5 with an `aside`, 8-of-12 without — and
offers no centred variant on purpose.

Two Signal Stack additions, both **opt-in and defaulting off** so every existing call site renders
unchanged:
- **`SpokeArc`** — the rotating hero figure, behind the copy. Off by default. **[DESIGN CHANGE]**.
- **Signal row** — an optional 3-up row of `<Surface tone="glass">` cards beneath the actions. This is
  a *new slot*, not the existing `aside`; a route may use either, and the Diagnostic entry uses
  `aside` for the empty `IndexScale`.

The full-bleed `--color-brand-tint` band is `tone="tint"`, which `<Section>` already emits with its
own `border-y border-line`. Padding stays the symmetric `py-16 md:py-24` the component ships with —
the asymmetric `--space-9` top / `--space-8` bottom in an earlier draft of this section was taken
from the prototypes and is not what the component does.

**`TrustMarquee`** — **[DESIGN CHANGE]**. White strip, `1px --color-line` bottom.
Duplicated chip track, `translateX(0 → -50%)` over `28–34s linear`, 8% edge mask both sides,
`animation-play-state: paused` on hover, duplicate set `aria-hidden`. Home and Diagnostic only.

**`CardGrid`** — 4-up desktop / 2-up tablet / 1-up mobile, `gap: --space-5`, Cards with tinted headers,
entrance via the existing `.reveal` (100ms stagger, capped at 5) or `.stage-reveal` for
scroll-driven sections.

**`StageRail`** — the five-stage commercial journey. **Reuse the existing `.stage-rail` /
`.stage-item` / `.stage-card` / `.stage-marker` CSS** — mobile collapses to a 3px
`--color-brand` left accent per card; ≥768px switches to a 64px-indented rail with a 2px
`--color-line` connector and 44px markers that fill with `--color-brand` as they cross the
viewport (`stage-marker-fill`, scroll-driven). Do **not** re-author this. The horizontal
scroll-snap variant from the prototype is an optional Home-only presentation layer over the
same data, and a **[DESIGN CHANGE]**.

**`SectionNav`** — reuse `.article-toc` (sticky, `top: 96px`, `≥1024px` only; hidden below that).
Active item: 2px `--color-brand` left border, `--color-brand-tint` background,
`--color-brand-ink` text. Below 1024px it collapses to a horizontal `Chip` row.
Services and Insights article.

**`Accordion`** — single-open. `+` glyph in a 44px `.tap-target` disc rotating to 45° and inverting to
`--color-brand` fill when open; body reveals via `grid-template-rows: 0fr → 1fr` over
`--dur-3 --ease-out`; open row background `--color-canvas-light`.
`<button>` with `aria-expanded` / `aria-controls`; heading text inside the button.

**`Carousel`** — 3-up track, one card per step, `translate3d` over `--dur-3 --ease-out`.
Circular 44px `.tap-target` arrow buttons and pill dots — active dot widens `6px → 22px`.
Keyboard: arrow keys when focused; `aria-live="polite"` position announcement. Never auto-advances.

**`QuestionStepper` → restyle `src/components/fdi/FdiDiagnosticFlow.tsx` in place. Do not create a new
component.** Its copy is asserted directly from PRODUCT by `src/lib/site-copy.test.ts`, so a second
component would fork governed copy. The diagnostic engine. Behaviour is governed by **PRODUCT**; this covers
presentation only. Header row `Question n of 12` + area label; 4px `.brand-gradient-text` gradient
progress fill animating `width` over `--dur-3`; question at `--step-3`; options as a real
`role="radiogroup"` with `<input type="radio">` — selected row gets `--color-brand-tint` fill,
`--color-brand` border, and a filled dot. The question set is `src/lib/fdi/questions/fdi-questions-1.1.ts` and scoring is
`src/lib/fdi/score.ts` + `bands.ts` — **read them, do not restate them**.
**Not** `src/lib/questions.ts` / `src/lib/scoring.ts`: AGENTS.md marks both RETIRED (the ten-question
diagnostic). `scoring.ts` survives only to export `DIMENSION_META` for the admin historic-lead view,
and `questions.ts` has no importer but `scoring.ts`. Binding the stepper to either would ship the
retired instrument. PRODUCT A4 governs — twelve questions, four per component, FDI-1.1.
**One question per screen, auto-advance 450ms after selection**, with an always-available Back.
Progress persistence and session handling already exist in `src/lib/fdi/` and `src/lib/fdi-server/`.

**`IndexScale`** — the Founder Dependency Index readout. Band names, thresholds and wording come from
**PRODUCT** and the canonical FDI routes — do not invent or restate them here. Presentation: a 10px
track with quartile ticks and `0 / 50 / 100` labels at `--step--1` in `--color-muted`.
Renders empty only on the Business Health Check entry state and renders a real
value only on a completed result page. It never appears on the Home page and
never displays a sample reading.

**`CTABand`** — `bg-canvas-dark`, 2 Orbs, `--space-9` block padding, 7/5 split:
`.eyebrow` (auto-amber on dark) + H2 (white, `24ch`) + body (`--color-muted-invert`) + primary Button
on the left, `GlassPanel` on the right. Closes every route.

**`Footer`** — `--color-canvas-light`, `1px --color-line` top, 2fr + 3×1fr columns, hairline legal row.

---

## 3. Page specifications

Order is fixed. Each route is a stack of the composites above — no bespoke sections.

> **The register is WEB's, not this file's.** WEB §4 is the route authority and lists twelve:
> `/` · `/about` · `/services` · `/diagnostic` · `/results` · `/contact` · `/insights` ·
> `/insights/[slug]` · `/insights/category/[slug]` · `/privacy` · `/unsubscribe` · `/admin`.
> An earlier draft of §3 was written from the live site and the prototypes rather than from WEB: it
> omitted `/insights/category/[slug]` and `/unsubscribe`, and added a 404 route WEB does not carry.
> Corrected below. §3.4 "Diagnostic flow" is a **state of `/diagnostic`**, not a route of its own —
> `/diagnostic/fdi` and `/results/fdi` are 308 noindex aliases (WEB §4), not pages to design.
> The registered noindex 404 and error fallbacks are supporting surfaces, not
> public marketing routes.

### 3.1 Home — `src/app/page.tsx`, `src/components/home/`
`PageHero` (signal row = the three operating areas; operating-architecture aside) →
`TrustMarquee` (pattern chips) → Growth Formula rail → **The Founder Trap** `CardGrid` 4-up →
Business Health Check preview without a score meter → five-stage `StageRail` → operating-scope
list (Strategy, Systems, People, Applied AI) → Strategic Growth Architecture → dark measurement
band → target profile → `Accordion` → `CTABand` → `Footer`. ANCHOR §6 has exactly four areas;
"Data" and "Accountability" are not additional operating-scope areas.

### 3.2 Services / How It Works
Route per **WEB**. `PageHero` (no signal row) → `SectionNav` + vertical `StageRail`: each of the five
stages gets a full block — what it is, what you get, what it is not, who it suits →
engagement-boundary `Accordion` → `CTABand`. Stage names and claims come from ANCHOR.

### 3.3 Diagnostic (entry)
`PageHero` with the empty `IndexScale` and its bands as the aside — no signal row, no marquee. Then:
what it measures (3-up `CardGrid`, one per operating area) → how it works (3-step rail) → what you get
(report breakdown + honest-limits dark panel) → `Accordion` → `CTABand`. Every factual claim about
length, cost, privacy and email behaviour is PRODUCT's — pull it, don't paraphrase it.

### 3.4 Diagnostic flow — `src/app/diagnostic/`, `src/components/fdi/`
Chrome stripped to logo + progress + exit. `QuestionStepper` only, one question per screen,
auto-advance. Exit confirms before discarding. No marquee, no fixed CTA, no orbs, no SpokeArc —
this screen is quiet on purpose. Question content and scoring are PRODUCT's, in
`src/lib/fdi/` (FDI-1.1) with session handling in `src/lib/fdi-server/` — **not** the retired
`src/lib/questions.ts` / `src/lib/scoring.ts`.

### 3.5 Diagnostic result — `src/app/results/`
**The only place `IndexScale` renders a value.** Index + band name, per-area breakdown (three bars),
the pattern in plain words, **one** next step, then the boundary note. All wording and thresholds are
PRODUCT's. **No email-a-copy form.** PRODUCT step 5 sends the report email at submit time
(`email_sent` is set only after Resend accepts), so a form here would offer a second copy of
something already sent. The closing band books a call — offered, never required.

### 3.6 Insights index — `src/app/insights/`
`PageHero` compact → filter `Chip` row → article `CardGrid` 3-up with tinted headers
(area tag, title, 2-line dek, read time) → pagination → `CTABand`. Article data from
`src/lib/articles.ts`.

### 3.7 Insights article — `src/app/insights/[slug]/`
`.reading-progress` bar → `PageHero` compact (eyebrow = area, H1 = title, meta row from
`src/lib/readingTime.ts`) → `.article-toc` + `.article-longform` prose column (`68ch`) →
pull-quote and key-takeaway blocks reuse `.glass-panel` on a tint inset → related 3-up `CardGrid`
→ `CTABand`. Prose sizes come from `--step-*`; H2 `--step-4`, H3 `--step-3`, list markers
`--color-brand`. Mobile body is the sanctioned 16px exception.

### 3.8 About
`PageHero` (signal row = operating principles) → positioning block → **how I work** `StageRail`
→ credentials/scope block → boundaries `Accordion` → `CTABand`.
No invented metrics, client names, or testimonials — any such claim is marked `[TO CONFIRM]`
until evidenced.

### 3.9 Contact — `src/components/contact/`
`PageHero` compact → 7/5 split: form (name, email, company, stage of interest, message — `Input`
primitives, inline validation, success and error states) and a `Card` with response-time expectation
and what to send. Calendly and WhatsApp handoffs already exist in `src/lib/calendly.ts` and
`src/lib/whatsapp.ts` — reuse them. → `CTABand` offering the Diagnostic as the lighter step.

### 3.10 Privacy
`PageHero` compact (`orbs={false}`) → `.article-toc` + a plain prose column at `68ch`, last-updated
date above the body. **Not `.article-longform`** — that class carries the 16px mobile body exception
and its `li` selector matches any descendant, so applying it here would extend the exception to a
second route. DESIGN §1 closes it to `/insights/[slug]` alone. No orbs, no SpokeArc, no marquee, one dark `CTABand` at most.

### 3.11 404 / error fallbacks
WEB registers both as noindex fallbacks. `not-found.tsx` uses the standard `PageHero` shell with
Home and Business Health Check routes. `error.tsx` uses the standard shell with retry and Home
controls. Neither captures data, presents an offer, or renders a fixed CTA.

### 3.11a Category index — `/insights/category/[slug]`
In WEB §4, missing from the earlier draft. Same shell as §3.6, scoped to one category: `PageHero`
compact (eyebrow = "Category", H1 = category name) → article `CardGrid` 3-up → `CTABand`.
Category data from `src/lib/articles.ts`.

### 3.11b Unsubscribe — `/unsubscribe`
In WEB §4, missing from the earlier draft. A single confirmation state, no marketing furniture:
`PageHero` compact → one `<Surface>` confirming the outcome → `CTABand` at most.
It reads `?status=` and already renders; treat this as a restyle, not a rebuild.

### 3.12 Newsletter / lead capture
Reusable inline block, not a route: `--color-brand-tint` panel, `--radius-3`, `.eyebrow` + one-line
promise + email `Input` + primary Button + frequency and unsubscribe note at `--step--1` in
`--color-muted`. States: idle, submitting (label swap + spinner), success (panel replaced by a
confirmation row), error (inline message). Appears at most once per route, never inside `CTABand`.
Email delivery already exists in `src/lib/email/`.

### 3.13 Admin screens — `src/app/admin/`
Utility, not marketing. Ambient motion off, orbs off, shine off, marquee off, SpokeArc off;
`--dur-2` transitions only. `--color-canvas-light` shell, white `Card` panels, `--shadow-1`,
`--step--1`/`--step-0` type, `.font-mono` on every figure. Left nav 220px reusing the `SectionNav`
active treatment. Tables: 44px rows, hairline dividers, sticky header, right-aligned numerals.
Diagnostic submissions list → detail view showing the same `IndexScale` and breakdown as the public
result page. Auth via `src/lib/adminAuth.ts`.

---

## 4. Responsive

Breakpoints are Tailwind's plus the two the CSS already keys on: **768px** (type scale, stage rail)
and **1024px** (sticky TOC). Grids collapse 4→2→1, 3→1, 5→vertical rail.
Hero drops the signal row to a 1-up stack below 640px and reduces SpokeArc opacity to `.35`.
`SectionNav` becomes a `Chip` row below 1024px.
Section padding floors at `--space-8` / `--space-4`.
**The 24px heading / 14px body mobile ceilings in §1.2 are enforced by the step tokens** — they hold
automatically as long as no px font-size is hardcoded.

## 5. Rules

1. **Rule Zero applies:** verify against the code, never assume. Every token in §1 is quoted from
   `globals.css` — if it has since changed, `globals.css` wins and this file is wrong.
2. Governing documents outrank this one: ANCHOR (locked) → PRODUCT → WEB → DESIGN. Copy, claims,
   routes, band names and thresholds come from them, never from here.
3. Use semantic colour aliases, never the numbered scales. Amber is fill-only; amber text on light
   is `--color-accent-ink`.
4. Never hardcode a px font-size — use `--step-*`. Body and button labels cap at weight 500.
5. Two dark bands per route maximum; one for every route except Home.
6. One shine, one marquee, two orbs per viewport. Ambient motion is decorative, `aria-hidden`, and
   inside the existing reduced-motion guard. New keyframes live in `globals.css`, never inline.
7. Card hover is one compound gesture. `.card-interactive` (2px) is the default; the 6px raised
   variant ships only with its DESIGN update.
8. `IndexScale` renders empty everywhere except a completed result. No sample readings.
9. Transform and opacity only. No layout-property animation.
10. Every interactive element relies on the global `:focus-visible` outline and has a ≥44px target.
11. Reuse the existing CSS utilities — `.reveal`, `.stage-rail`, `.article-toc`, `.glass-panel`,
    `.orb`, `.hover-lift`, `.card-interactive`, `.eyebrow`, `.tap-target`, `.brand-gradient-text`.
    Re-authoring any of them is a defect.
12. Every **[DESIGN CHANGE]** merges into `.claude/skills/frontend-design/SKILL.md` in the same
    commit that ships it, with a `docs/design-changelog.md` entry.
13. No claim, figure, logo, or testimonial ships without evidence.
14. Before shipping: `npm run lint`, `npm run test:coverage`, `npm run build`, `npm run audit:type`,
    then `.claude/commands/ship.md`. Note `src/lib/website-specification.test.ts` and
    `src/lib/site-copy.test.ts` assert against the spec — expect to update them alongside.

---

## 6. Change register

Everything in this document is either **already in DESIGN** (implement directly) or a
**[DESIGN CHANGE]** (update the DESIGN skill first). The full change list:

| # | Change | Scope |
| --- | --- | --- |
| 1 | `SpokeArc` — rotating hero arc + counter-ring | New `globals.css` keyframes + component |
| 2 | Orb drift animation (orbs are static today) | `globals.css` keyframes |
| 3 | CTA shine sweep | `globals.css` keyframes + Button variant |
| 4 | `TrustMarquee` | New component + keyframes |
| 5 | `.card-interactive-raised` — 6px lift, deep shadow, spring tile | New shadow + ease token |
| 6 | Horizontal scroll-snap `StageRail` variant | Presentation variant, Home only |
| 7 | Tint-surface border token (if `#CCE0FF` is genuinely needed) | New `@theme` key |

Items 1–4 are additive and low-risk. Item 5 touches the house interaction — land it last,
behind an opt-in class, or drop it. Nothing in §1 requires a change.

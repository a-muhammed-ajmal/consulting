---
name: frontend-design
description: Design system for muhammedajmal.com — Electric Blue & Amber on slate, Plus Jakarta Sans for headings and Lexend for body, strict mobile type ceilings, Next.js 16 and Tailwind v4.
version: 1.0.0
tags: [frontend, design-system, css, tailwind, typography]
triggers:
  - "creating a user interface"
  - "designing a page or section"
  - "building HTML/CSS templates"
  - "styling frontend components"
  - "modifying CSS or TSX files for layout"
  - "customizing typography or colors"
---

# Frontend Design

Document ID: DESIGN · Version 1.0

Governs the visual design of muhammedajmal.com. Governed by ANCHOR and WEB. Where this document and either of those disagree, they govern.

`src/app/globals.css` is the implementation truth. This document describes it. Where they disagree, `globals.css` is correct and this document is corrected to match.

The purpose is a distinct, professional identity — not generic AI output, which reads as Inter with purple gradients on rounded cards.

---

## 1. Typography

**Two faces, three roles.** Plus Jakarta Sans carries headings, display type, and `font-mono`. Lexend carries body copy, UI, controls, form text, small text, and numeric body text. There is no third face. `font-mono` means tabular figures, not a family change.

No Lexend-rendered text exceeds weight 500. Above 500 the loaded Lexend set renders faux-bold, and display weight is Plus Jakarta Sans's job.

Both load through `next/font/google` in `layout.tsx`, never a `<link>` tag or a CSS `@import`. They expose `--font-plus-jakarta-sans` and `--font-lexend`; the `@theme` block maps `--font-heading` and `--font-display` onto the first, `--font-body` and `--font-sans` onto the second.

### Type scale

Sizes live once, in the `--step-N` scale on `:root`, re-declared at 768px. Components write `text-[length:var(--step-N)]` and never hardcode a pixel size.

| Token | < 768px | ≥ 768px | Role |
| :---- | :---- | :---- | :---- |
| `--step--1` | 12px | 13px | Micro-copy, labels, eyebrows |
| `--step-0` | 14px | 16px | Body, list items, form descriptions |
| `--step-1` | 16px | 18px | Card titles, h5 |
| `--step-2` | 18px | 20px | h4 |
| `--step-3` | 20px | 24px | h3 |
| `--step-4` | 22px | 32px | h2, section titles |
| `--step-5` | 24px | 48px | h1 |

Below 768px every heading lands at or under 24px and body at or under 14px. Above it, the scale opens into a real display hierarchy.

Enforcing the ceilings in the scale means every call site inherits them. This is the only place they are defined.

### Inputs stay at 16px

`input`, `select`, and `textarea` are pinned to `font-size: 16px` at every width. Below 16px, iOS Safari zooms the viewport on focus, which breaks the diagnostic, lead capture, and contact forms.

On mobile this puts 16px inputs beside 14px body copy. Expected, not a bug.

### The one type exception

Article body on `/insights/[slug]` renders at 16px on mobile. It is the site's only sustained-reading surface, and 14px is below the norm for long-form.

```css
@media (max-width: 767px) {
  .article-longform > p,
  .article-longform li {
    font-size: 1rem; /* 16px — approved exception, WEB §8 */
  }
}
```

**The audit exception.** `npm run audit:type` asserts a mobile body ceiling and
would fail on the rule above, so the exception is recorded in the audit itself.

File: `scripts/audit-type-scale.mjs`

| Line | Exact change |
| :---- | :---- |
| 47 | `const ARTICLE_BODY_CEILING = 16;` declared beside `BODY_CEILING = 14` |
| 154 | `info()` records `longform: !!el.closest('.article-longform')` on every measured element |
| 316 | the prose assertion picks its ceiling per element rather than flat: `const ceiling = b.longform ? ARTICLE_BODY_CEILING : BODY_CEILING;` |

The flag is set from a `.article-longform` ancestor, so a `<p>` or `<li>` on any
other route still meets the 14px ceiling. The heading ceiling, the 320px overflow
check, and the font-family check are untouched.

No other route may claim this exception.

---

## 2. Color

### Two layers, on purpose

The numbered scales are the raw palette. The semantic aliases are what components reference. A rung and an alias may hold different values — that is the design, not a conflict.

Reach for the alias (`bg-brand`, `text-ink`, `border-line`) in components. Reach for the numbered scale (`bg-electric-100`, `text-amber-700`) only when you need a rung the aliases do not name.

### Electric Blue

| Token | Hex | Note |
| :---- | :---- | :---- |
| `--color-electric-50` | `#EFF6FF` | |
| `--color-electric-100` | `#DBEAFE` | `.orb-electric` fill |
| `--color-electric-500` | `#0066FF` | Brand primary — 4.8:1 on white |
| `--color-electric-600` | `#0046D5` | |
| `--color-electric-700` | `#003399` | 10.9:1 on white |
| `--color-electric-900` | `#1E3A8A` | |
| `--color-brand` | `#0066FF` | Primary fills, CTAs, focus |
| `--color-brand-hover` | `#0039CC` | CTA hover — 8.6:1 on white |
| `--color-brand-ink` | `#003399` | Blue text on white — 10.9:1 |
| `--color-brand-tint` | `#E6F0FF` | Light wash, alternating band |
| `--color-brand-soft` | `#DBEAFE` | Icon tiles, chips, chart fills |

### Amber

| Token | Hex | Note |
| :---- | :---- | :---- |
| `--color-amber-50` | `#FFFBEB` | |
| `--color-amber-100` | `#FEF3C7` | `.orb-amber` fill |
| `--color-amber-500` | `#FFCC00` | 1.51:1 on white — **FILL ONLY** |
| `--color-amber-600` | `#D97706` | ~3.4:1 on white — **fails AA for normal text** |
| `--color-amber-700` | `#CC6600` | Amber text on light — 3.8:1 |
| `--color-accent` | `#FFCC00` | |
| `--color-accent-hover` | `#D49E00` | |
| `--color-accent-ink` | `#CC6600` | 3.8:1 on white |
| `--color-accent-soft` | `#FFF8E6` | |

Amber's legitimate homes are fills on dark surfaces, borders, and eyebrow text on a dark band. `accent-ink` (3.8:1) is the closest amber gets to text on a light surface, but it now clears only the AA large-text/UI threshold (3:1), not AA normal text (4.5:1) — reserve it for headings, labels, and UI text at 18px+/bold 14px+, never body copy.

### Neutrals

| Token | Hex |
| :---- | :---- |
| `--color-canvas` / `--color-surface` | `#FFFFFF` — page and card ground. Two names, one value |
| `--color-canvas-light` | `#F8FAFC` — Slate 50, neutral band |
| `--color-canvas-dark` | `#000033` — Slate 900, the dark band |
| `--color-ink` | `#000033` — 20.0:1 on white |
| `--color-ink-soft` | `#1E293B` — Slate 800 |
| `--color-muted` | `#475569` — 7.6:1, the lightest legal text |
| `--color-muted-invert` | `#CBD5E1` — 13.5:1 against `#000033`. Secondary text on a dark band, the inverse partner for `--color-muted` |
| `--color-line` / `--color-canvas-border` | `#E2E8F0` — Slate 200. Two names, one value; a palette move must change both |
| `--color-line-strong` | `#CBD5E1` — Slate 300, the heavier divider |
| `--color-focus` | `#0066FF` — the global `:focus-visible` outline |

### Status

Meaning only. A status color is never reached for as a brand accent — that would be the third accent hue the palette forbids. Each carries a `-soft` background tint.

| Token | Hex | `-soft` |
| :---- | :---- | :---- |
| `--color-success` | `#0B6B43` | `#E7F6EE` |
| `--color-warning` | `#9A5B08` | `#FFF8E6` |
| `--color-danger` | `#C0281D` | `#FDECEC` |

`--color-warning` is amber's accessible text partner. It is not `--color-accent`, and `--color-accent` is not a warning color.

### Dark bands

On `tone="dark"`, text tokens invert. Headings take `text-white`, secondary copy takes `text-muted-invert`, and the eyebrow resolves to `accent` on its own — `.eyebrow` inside `.bg-canvas-dark` takes amber without a per-use class. That is amber's one legitimate home as a text color.

`text-muted` and `text-ink` must never appear on a dark band. They land around 2.4:1.

A white card sitting on a dark band keeps its normal light-ground tokens.

Dark bands are a closing-CTA device, roughly one per page. Not a section type to reach for freely.

---

## 3. Implementation

Next.js 16 and Tailwind CSS v4. Two constraints that fail silently when broken:

**There is no `tailwind.config.js`.** Tailwind v4 reads its theme from `@theme {}` inside `globals.css`. Adding a config file has no effect at all. Every `--color-*` key declared there generates the matching utility.

**Fonts load through `next/font/google`.** It self-hosts the files, eliminating the round-trip and the flash of unstyled text.

### Existing utilities

Use these rather than rebuilding the recipe inline. All declared in `globals.css`.

| Class | Effect |
| :---- | :---- |
| `.glass-panel` | Translucent white, backdrop blur, hairline border |
| `.orb` + `.orb-electric` / `.orb-amber` | Ambient blurred background radials |
| `.hover-lift` | 2px upward shift plus electric glow, 200ms |
| `.hover-lift-amber` | Swaps only the glow to amber — `box-shadow: var(--shadow-glow-amber)`. Pair with `.hover-lift`; it supplies no lift or transition of its own |
| `.card-interactive` | Card hover: lift, shadow step, electric border. **The house gesture — 2px** |
| `.card-interactive-raised` | Opt-in variant: 6px lift, `--shadow-raised`, and a spring tile via `.icon-tile-spring`. **Not the house gesture.** Marketing card grids only — never admin, never forms, never a control |
| `.reveal` | Staggered entrance, 100ms apart |
| `.stage-reveal` / `.heading-reveal` | Scroll-driven reveal |
| `.animate-fade-in` | Legacy fade-in — 16px slide in from the right over 0.3s. Predates the token scale and uses neither `--dur-*` nor `--ease-*`. Prefer `.reveal`; do not extend this one |
| `.brand-gradient-text` | Gradient, electric-700 to electric-500 |
| `.eyebrow` | Uppercase 500-weight label, no letter spacing — sets accent color: `accent-ink` on light, `accent` on dark bands |
| `.tap-target` | 44px minimum — every icon-only control |
| `.stage-rail` / `.stage-item` / `.stage-marker` / `.stage-card` | Process and timeline composition |
| `.article-longform` / `.article-toc` / `.reading-progress` | Insights article chrome |
| `.marquee` / `.marquee-track` | Looping chip track — the set is rendered twice and translated -50% so the loop has no seam. 8% edge mask; pauses on hover. Duplicate set must carry `aria-hidden` |
| `.orb-drift` / `.orb-drift-slow` | Ambient orb movement. Transform only, guarded explicitly as well as globally — an infinite loop is what a motion-sensitive reader most wants stopped |
| `.cta-shine` | Sweeping highlight on a primary CTA. **One instance per viewport, primary only.** Sheen derives from `--color-canvas` |
| `.stage-rail-snap` | Horizontal scroll-snap presentation of `.stage-rail`, ≥768px. **Home only** — the vertical rail stays the default everywhere else |
| `.spoke-arc` / `.spoke-ring` | Hero-only decorative figure — eight rotating spokes masked to an annulus, plus a dashed counter-rotating ring. Colours derive from `--color-brand` via `color-mix`. Ambient loops (46s / 28s) sit outside the `--dur-*` interaction scale on purpose |

Shadows are real utilities: `shadow-1` hairline, `shadow-2` card, `shadow-3` modal, plus `shadow-glow-electric` and `shadow-glow-amber`. Use those names, not `shadow-lg`.

`--shadow-raised` exists for `.card-interactive-raised` alone. It is **not** a fourth step on the 1/2/3 ramp and must not be reached for as one.

### Tokens

```
--space-1 .25rem  --space-2 .5rem   --space-3 .75rem  --space-4 1rem
--space-5 1.5rem  --space-6 2rem    --space-7 3rem    --space-8 4rem   --space-9 6rem

--radius-1 .5rem   --radius-2 .75rem   --radius-3 1rem   --radius-pill 999px

--dur-1 120ms  --dur-2 200ms  --dur-3 400ms  --dur-4 650ms
--ease-out cubic-bezier(0.16, 1, 0.3, 1)   --ease-in cubic-bezier(0.5, 0, 0.75, 0)
--ease-spring cubic-bezier(0.34, 1.56, 0.64, 1)   /* overshoots — decorative only */
```

`--dur-2` is 200ms to match the hover transition standard. In practice: `rounded-lg` for inputs and chips, `rounded-xl` for buttons, `rounded-2xl` for cards. The `prefers-reduced-motion` guard is already global.

---

## 4. Shared primitives

Eight exist in `src/components/ui/`, across seven files — `SectionHeader` is a named export of `Surface.tsx`, not its own file. Use them instead of re-deriving the recipe.

**`<Section>`** — the full-bleed band every section is built from. `tone` of white · light · tint · dark; `width` of prose · narrow · default · wide; `orbs` for ambient radials; `compact` for utility bands; `divided` when a white band follows another white band. It owns the padding, banding, clipping, and orb placement. Do not hand-roll `px-6 py-16 md:py-24` on a new section.

**`<PageHero>`** — the page opener. Takes `eyebrow` / `title` / `lead` / `actions` / `note` / `aside`, plus `tone` and `accent`. Deliberately asymmetric: 7/5 with an aside, 8-of-12 without. It offers no centered variant on purpose — a centered hero on every page is what makes a site read as one template. Two opt-in extras, both off by default: `spokeArc` for the decorative hero figure, and `signals` for a 3-up row of glass cards under the actions — a separate slot from `aside`, not a replacement for it.

**`<Button>`** — variants `primary` · `secondary` · `quiet` · `accent` · `danger`, plus `fullWidth`. Renders a `next/link` for `href`, a plain anchor for `href` + `external`, a `<button>` otherwise. Focus ring, disabled state, the 200ms hover lift, and the 44px floor are built in.

**`<Surface>`** — card container; `tone` of default · muted · accent · glass, and `interactive` to add `.card-interactive`. `raised` upgrades `interactive` to the 6px variant — marketing card grids only. Optional `header` renders a tinted header strip — a `--color-brand-tint` band with a hairline bottom edge above a white body. Supplying it moves the padding off the card onto the two regions and clips the corners; omitting it renders exactly as before. There is no separate `Card` component and none is to be created.

**`<SectionHeader>`** — `eyebrow` / `title` / `description`, with `align`.

**`<Input>` / `<Select>` / `<Textarea>` / `<Label>` / `<FieldError>`** — form controls, in `Field.tsx`.
44px floor (textarea 92px), `--radius-1`, `--color-line` border going `--color-brand` on focus,
`--color-danger` when `invalid` (which also sets `aria-invalid`). They deliberately set **no**
font-size: `globals.css` pins `input, select, textarea` to 16px *unlayered*, which outranks any
Tailwind utility and is what stops iOS zooming on focus. They rely on the global `:focus-visible`
outline and add no ring of their own.

**`<IconTile>`** — the square that heads a card or rail item. `variant` of numeral · glyph,
`size` of sm(26) · md(34) · lg(44). Numeral takes the solid `--color-brand` fill with `.font-mono`
for tabular figures; glyph takes `--color-brand-soft` with a `--color-brand-ink` mark. Decorative by
default.

**`<Chip>`** — a pill. Static by default (`--color-canvas-light`, `--color-line`, `--step--1` at 500).
Passing `href` or `onClick` makes it a real control and adds the 44px floor — a filter row is a tap
target, a marquee label is not.

For the canonical hero and navigation pattern, read `src/components/ui/PageHero.tsx` and `src/components/layout/Navigation.tsx`. Those files are the reference, not a sample in this document.

Components use PascalCase filenames, named exports, explicit prop interfaces, and `cn()` from `src/lib/utils.ts`. Prefer server components; keep `"use client"` boundaries small.

Control heights: `<Button>` is 44px. `min-h-[48px]` and `min-h-[52px]` appear on some admin and diagnostic forms. Those three are the whole ladder — reuse one, do not introduce a fourth. A `<Textarea>` is not a control height: it floors at 92px because it is a typing surface, not a target.

---

### Composites

Built on the primitives, in `src/components/ui/` unless noted. Compose these rather than
re-deriving a section.

| Component | Notes |
| :---- | :---- |
| `<CardGrid>` / `<CardGridItem>` | 4/3/2-up collapsing to 1-up. `.reveal` stagger is capped at five children by `globals.css`; `scrollReveal` switches to `.stage-reveal` for sections below the fold |
| `<StageRail>` | Supplies the markup `.stage-rail` expects. Re-authors none of that CSS |
| `<SectionNav>` | `.article-toc` above 1024px, a `<Chip>` row below it. The navigation changes shape rather than disappearing |
| `<Accordion>` | Single-open. Animates `grid-template-rows: 0fr → 1fr` — the one sanctioned layout-property animation, because `height` cannot transition from `auto` |
| `<Carousel>` | Stepped 3-up, `translate3d`. Never auto-advances |
| `<CTABand>` | The closing dark band. `.eyebrow` resolves to amber inside `.bg-canvas-dark` unaided |
| `<TrustMarquee>` | Home and Diagnostic only |
| `<IndexScale>` / `<IndexBandList>` | `src/components/fdi/`. Reads bands from the active FDI config — never restates them. See §7 |

## 5. Layout and motion

- **Asymmetric grids.** Break the monotony of equal-width cards. Left-heavy heroes, side-by-side splits.
- **Glass accents.** Thin borders with backdrop blur on panels.
- **Staggered entrance.** Subtle delays on staggered lists.
- **Hover micro-interactions.** Buttons shift upward with a glow alteration, bound to 200ms.

---

## 6. Anti-patterns

❌ **A third typeface.** The pairing is closed at two: Plus Jakarta Sans for headings and display, Lexend for body and UI. Not Inter, not a system sans, not a display face for one section.

❌ **Lexend above weight 500.** It renders faux-bold at the loaded weights and reads as a heading. Display weight belongs to Plus Jakarta Sans — reach for `var(--font-heading)` instead.

❌ **AI-slop defaults.** Inter as a heading face. Soft purple gradients behind generic floating cards.

❌ **Violating the mobile ceilings.** No heading above 24px, no body above 14px below 768px. The one exception is `.article-longform`, §1.

❌ **`text-amber-600`.** `#D97706` lands near 3.4:1 on white and fails AA for normal text. For amber text on a light surface use `text-accent-ink`.

❌ **`#FFCC00` as text on white or light gray.** 1.51:1. Fills and borders only.

❌ **Muting text with opacity** (`text-ink/60`). Use `text-muted`.

❌ **Raw hex in JSX.** Use token classes. Two exceptions where CSS custom properties are genuinely unavailable at render: `icon.tsx` / `apple-icon.tsx` / `opengraph-image.tsx` (Satori) and `src/lib/email/templates/` (rendered outside the app's CSS). Values there must still match the tokens.

❌ **A `tailwind.config.js`.** Tailwind v4 ignores it entirely.

❌ **A fourth control height.**

❌ **`.card-interactive-raised` outside a marketing card grid.** It overshoots and lifts 6px. On a
control, a form, or an admin panel it reads as a bug. The house gesture is `.card-interactive`.

❌ **`--ease-spring` on anything but a small decorative element.** It passes 1 and settles back;
on a panel or a control that is a wobble, not a spring.

---

## 7. Content integrity

Never invent testimonials, client names or logos, revenue figures, metrics, certifications, awards, partnerships, case-study results, customer counts, or geographic claims.

This includes charts and score displays. **A dial showing a plausible number is an invented metric.**

Where a page needs evidence that has not been supplied, write `[TO CONFIRM]`. Never write a realistic-looking placeholder that could be mistaken for a real business claim.

### Founder Dependency Index — the only permitted bands

| Range | Band |
| :---- | :---- |
| 0–24 | Low Founder Dependency |
| 25–49 | Moderate Founder Dependency |
| 50–74 | High Founder Dependency |
| 75–100 | Very High Founder Dependency |

Four rules bind any display of this index:

1. **A high index is the adverse result.** 80 is the worst outcome, not the best. Band names must never read as praise.
2. Display as a value out of 100. Never a percentage. No `%` symbol anywhere near it.
3. Never a standalone Low, Moderate, or High. Always the full band name.
4. Never render a sample score, a filled meter, or a demo reading. Show the empty scale or nothing.

Full definitions in PRODUCT §A6.

### Voice

Executive, analytical, practical. Bold and distinctive, not generic. Avoid "revolutionize," "unlock your potential," "next-generation," "seamless," "supercharge."

---

## 8. Verification checklist

Before declaring any frontend work complete:

- [ ] Plus Jakarta Sans and Lexend both load via `next/font/google` in `layout.tsx` — no `<link>`, no `@import`.
- [ ] Headings and display map to `var(--font-heading)`; body, UI, and small text map to `var(--font-body)`. No third family in any `font-family` declaration.
- [ ] No body-role text above weight 500. `npm run audit:type` asserts this per element.
- [ ] `npm run audit:type` passes. It drives a real browser over every route at 375 / 320 / 1920px, asserts the heading and body ceilings, and fails on horizontal overflow at 320px. Run it rather than eyeballing — font sizes are inherited, so a `<p>` handed a card-title step is invisible to code review.
- [ ] Primary actions use `#0066FF`.
- [ ] No `text-amber-600` and no `#FFCC00` text on a light surface.
- [ ] Hover movement bound to 200ms.
- [ ] All text meets 4.5:1. State is never signalled by color alone.
- [ ] One `h1` per page; heading levels not skipped.
- [ ] Icon-only buttons carry `.tap-target` and an accessible name. Keyboard reaches every interactive element with a visible focus ring.
- [ ] No horizontal overflow at 320px; usable at 200% zoom.
- [ ] Loading, empty, and error states exist wherever data can be absent.
- [ ] No invented business evidence. No sample Founder Dependency Index reading. Unknowns marked `[TO CONFIRM]`.
- [ ] No new dependency without a functional reason.

---

## 9. Deeper references

Load only when the trigger applies.

| Read | When |
| :---- | :---- |
| `references/accessibility.md` | Running an accessibility pass, or a review flags a11y |
| `references/aesthetics.md` | Asked to make UI look better, less generic, or more polished |
| `references/components.md` | Creating a new component file and unsure of internal structure |
| `references/mobile.md` | The task is specifically mobile layout, touch, or bottom-sheet behavior |
| `references/performance.md` | Core Web Vitals, bundle size, or layout shift |

For an exact token declaration, read `globals.css`. It is the only source of truth.

---

END OF FRONTEND DESIGN

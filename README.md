# Muhammed Ajmal Consulting

The public website and Business Health Check for a business operations and
growth consulting practice serving founder-led UAE SMEs, based in Dubai.

The site's commercial journey is a free founder-dependency self-report that
returns a **Founder Dependency Index** out of 100 across three operating
areas, then routes qualified visitors to a Business Clarity Audit
conversation. Scoring, findings, and the report email are deterministic —
no model sits between an answer and a result.

---

## Governance

Product behaviour is governed by four documents. Cross-reference them by
**Document ID**, never by filename. The register is closed at four — new
governing content is added to an existing document, never to a new one.

| ID | File | Governs |
| :---- | :---- | :---- |
| ANCHOR | `docs/ANCHOR.md` | Positioning, clients, sectors, commercial path, the four frameworks, claims. **Locked — never edit.** |
| PRODUCT | `docs/PRODUCT.md` | Business Health Check, the instrument, Business Clarity Audit |
| WEB | `docs/WEBSITE.md` | Public routes, navigation, pages, publishing |
| DESIGN | `.claude/skills/frontend-design/SKILL.md` | Colors, typography, components, accessibility |

Engineering rules live in `AGENTS.md`. `CLAUDE.md` is a pointer file.
`.claude/commands/ship.md` is the release procedure. `AGENT-RULES.md` is
how an agent works with all of the above.

`src/lib/website-specification.test.ts` scans the whole governance surface
on every CI run and fails on prohibited language.

---

## Stack

| Layer | Choice |
| :---- | :---- |
| Framework | Next.js 16.3.4 — App Router, React 19 |
| Language | TypeScript 5, strict |
| Styling | Tailwind CSS v4 — no config file; theme lives in `@theme {}` inside `globals.css` |
| Database / Auth | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| Email | Resend + `@react-email/components` |
| Forms | `react-hook-form` + `zod` |
| Icons | `lucide-react` |
| Motion | Native CSS only — no animation library |
| Design audit | `playwright-core`, driving an installed Chrome |

Typography is a two-face pairing loaded through `next/font/google`:
Plus Jakarta Sans for headings and display, Lexend for body, UI, and
small text, with body-role weight capped at 500. Mobile ceilings are
strict: below 768px no heading exceeds 24px and no body copy exceeds
14px. The one approved exception is article body on `/insights/[slug]`,
which opens to 16px — see DESIGN §1.

---

## Setup

```bash
npm ci
```

Copy `.env.example` to `.env.local` and fill it in. The Calendly URL is
required; the WhatsApp number is optional and hides the secondary message
route when omitted.

```bash
npm run dev
```

---

## Validation

Run all four before shipping. `/ship` runs them in this order.

| Command | Checks |
| :---- | :---- |
| `npm run lint` | ESLint |
| `npm run test:coverage` | Jest with coverage. The FDI scoring engine, band logic, and rounding are held at 100% |
| `npm run build` | Production build |
| `npm run audit:type` | Drives a real browser over every route at 375 / 320 / 1920px and asserts the rendered type ceilings, the font family, and no horizontal overflow at 320px |

`audit:type` is the only check that can catch an inherited font size, so run
it rather than reading the CSS.

---

## Project stats

| Metric | Count |
| :---- | :---- |
| Tests | 419 passing (43 suites), 78.31% statement coverage |
| DB tables | 8 |
| Migrations | 7 |
| Routes | 19 page routes, 9 API route handlers |

---

## The instrument

`FDI-1.1` is the sole active version for new sessions, with question set
`FDI-QS-1.1` and qualification configuration `FDI-QF-2.1`. Every session
stamps five version keys and resolves through the versions stamped on it.

`FDI-1.0` is historic-only and remains resolvable. Six completed sessions
carry that stamp and were delivered by email. Its configuration, question
set, golden fixture, and reproducibility test are kept in
`src/lib/fdi/` and must never be migrated, rescored, or deleted — a
committed golden fixture fails CI if any stored score would change.

Full definitions in PRODUCT.

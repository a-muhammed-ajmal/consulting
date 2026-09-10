<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

@.claude/skills/frontend-design/SKILL.md

---

# Project Constitution

## Project
A B2B consulting website and business diagnostic tool for Ajmal's consulting practice. It generates leads via an interactive quiz, captures emails, and manages prospects through an admin dashboard.

## Tech Stack
| Layer | Library / Version |
|---|---|
| Framework | Next.js **16.3.4** — App Router, React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS **v4** (`@import "tailwindcss"` — no `tailwind.config.js`) |
| Database / Auth | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| Email | Resend + `@react-email/components` |
| Forms | `react-hook-form` + `zod` |
| Animations | Native CSS only — `animation-timeline` scroll-driven effects in `globals.css`. No animation library. |
| Icons | `lucide-react` |
| Class merging | `clsx` + `tailwind-merge` |
| Design audit | `playwright-core` (dev only) — drives an installed Chrome for `npm run audit:type` |

## Architecture
```
src/
  app/              # Next.js App Router — one folder per route
    api/            # Route handlers (route.ts convention)
    admin/          # Protected admin dashboard
    insights/       # Blog/article pages
    diagnostic/     # Quiz flow
    page.tsx        # Home
  components/
    ui/             # Section, PageHero, Button, Surface + SectionHeader
    layout/         # Navigation, Footer
    quiz/           # QuestionCard, OptionButton, ProgressBar
    contact/        # ContactForm, CalendlyWidget
    lead/           # LeadCaptureForm
    newsletter/     # NewsletterForm
    insights/       # ArticleToc
  lib/
    supabase/       # server.ts (createAdminClient) — server-only, service-role
    email/templates/# React Email templates (DiagnosticReport, ContactNotification)
    fdi/            # ACTIVE instrument — config, questions, scoring, bands, findings
    scoring.ts      # RETIRED (ten-question diagnostic). Survives only for
                    #   DIMENSION_META in the admin historic-lead view
    questions.ts    # RETIRED (ten-question diagnostic). No importer remains
    articles.ts     # Insights content registry (source of truth for articles)
    metadata.ts     # Per-page metadata helper
    jsonLd.ts       # Structured-data builders
    rateLimit.ts    # IP + email rate limiting
    readingTime.ts  # Read-time from word count
    env.ts          # Public env (required Calendly, optional WhatsApp, site URL)
    adminAuth.ts    # Admin session helpers
  types/
    index.ts        # Shared TypeScript types
```

## Coding Standards
- **Components**: PascalCase filenames, named exports, no default exports for components
- **API routes**: `route.ts` with named exports (`GET`, `POST`, etc.)
- **Supabase client**: use `createAdminClient()` from `src/lib/supabase/server.ts` in Route Handlers and Server Components. There is no browser client — every table is RLS-enabled with all privileges revoked from `anon`/`authenticated`, so a client-side read would return nothing anyway
- **Forms**: always `react-hook-form` + `zod` schema — no uncontrolled inputs
- **Classes**: `cn()` helper (clsx + tailwind-merge) for conditional Tailwind classes
- **No raw hex in JSX**: all colors via CSS custom properties defined in `globals.css`

## Design System
DESIGN (`.claude/skills/frontend-design/SKILL.md`) is the single specification for colors,
typography, spacing, components, and accessibility. `src/app/globals.css` is the
implementation truth; DESIGN documents it. This file does not restate token values, the
type scale, or the utility class list — duplication is what let three wrong font names
survive months of review.

**"Electric Blue & Amber"** — vibrant electric blue on slate neutrals with a fill-only
amber accent, two typefaces — Plus Jakarta Sans for headings and display, Lexend for
body, controls, and numeric text — on a responsive type scale with hard mobile
ceilings.

Do not revert to any previous visual identity. Several were retired deliberately. DESIGN
is the only current specification.

The mobile ceilings are enforced by `npm run audit:type`, which measures the rendered
pages in a real browser rather than trusting the CSS — font sizes are inherited, so this
is the one design rule that code review cannot verify. It runs in CI and in `/ship`.

## Pages
Route list and page purposes are governed by WEB. Do not restate them here.

## Key Constraints
- Tailwind v4 has **no config file** — custom tokens go in `globals.css` inside `@theme {}`
- Supabase: `createAdminClient()` uses the service-role key (bypasses RLS) — Route Handlers and Server Components only. `server.ts` imports `server-only`, so a client-side import fails the build rather than shipping a broken client
- Email templates are React components rendered via `@react-email/render` before sending through Resend
- Admin auth is cookie-based (not Supabase Auth) — see `src/lib/adminAuth.ts`
- `NEXT_PUBLIC_WHATSAPP_NUMBER` is optional and public by design. When set to the business E.164 number, it exposes a prefilled Business Clarity Audit WhatsApp link; omit it to hide the secondary message route.

## Rule Zero — verify, never assume

This rule outranks every other instruction, in this file or any other.

- Check whether a file exists. Do not assume it does.
- Read a file before editing it. Do not assume its contents.
- Diff a file before replacing it. Do not assume it matches.
- Run a command. Do not assume its result.

Anything said in any earlier message, in this conversation or any other,
is a claim to verify, not a fact to rely on. A file discussed before may
since have been edited, moved, or deleted. Verify before every action,
not once per session.

An instruction to move, edit, or delete a file that no longer exists is
NOT an error. Report "already absent" and continue.

Given a list of paths, verify every one before acting on any of them.

A task is complete only when you ran it and saw the output. Paste real
command output. Never summarize a run you did not perform. If you cannot
verify something, report "unverified" and stop. Absence of evidence is
not evidence.

Before deleting or overwriting any file, print enough of its contents
that the user can see what is being removed.

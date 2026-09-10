---
name: review
description: Security, performance, type-safety and project-convention review of the current git diff
---

# /review — Code Review

Review `git diff HEAD` (or staged changes) across these dimensions. Output a structured findings table.

## Dimensions

### 1. Security

- Is `SUPABASE_SERVICE_ROLE_KEY`, `FDI_SESSION_SIGNING_SECRET`, `RESEND_API_KEY`, or `ADMIN_PASSWORD` referenced in a Client Component (`"use client"`) or otherwise reachable from the browser?
- Is `createAdminClient()` (bypasses RLS) used only in Route Handlers and Server Components — never imported into a Client Component?
- Is user input validated at API route boundaries (`src/app/api/**/route.ts`) with a `zod` schema before it touches Supabase or Resend?
- Are the public API routes (`/api/submit`, `/api/contact`, `/api/newsletter`) covered by `src/lib/rateLimit.ts`?
- Is admin-only functionality gated by `src/lib/adminAuth.ts`'s cookie check, not just hidden by routing?
- Any `any` type used as an escape hatch that could mask a validation gap?

### 2. TypeScript correctness

- Any `any` types introduced? (Forbidden — `tsconfig.json` runs `strict`.)
- Are shared types from `src/types/index.ts` (or `src/lib/fdi/types.ts` for the diagnostic engine) used correctly rather than re-declared inline?
- All new functions fully typed (no implicit `any` params)?

### 3. Performance

- N+1 queries (sequential Supabase calls inside a loop)?
- Missing `useCallback`/`useMemo` on values used in `useEffect` dependency arrays?
- A Client Component boundary (`"use client"`) larger than it needs to be — could the interactive part be isolated to a leaf component?
- Large synchronous imports that should be dynamic?

### 4. Project conventions

- Raw hex color in JSX outside the two documented exceptions (`icon.tsx`/`apple-icon.tsx`/`opengraph-image.tsx` and `src/lib/email/templates/`)? See the `frontend-design` skill.
- Any font outside the pairing behind `font-heading` / `font-body` / `font-mono`? Plus Jakarta Sans carries headings, display and `font-mono`; Lexend carries body, UI, and small text. A third family is a finding, and so is any body-role text above weight 500. See DESIGN §1.
- Below 768px: any heading (h1–h4) above 24px, or body prose (`<p>`, `<li>`) above 14px? A hardcoded `px` font-size that escapes the `--step-N` scale is a finding on its own. Text muted with opacity instead of `text-muted`?
- `text-white` on anything other than a `bg-brand`/`bg-danger`/`bg-success`/`bg-ink`/`bg-canvas-dark` fill? Amber (`bg-accent`, `bg-amber-500`) is 1.65:1 against white — it takes `text-canvas-dark`/`text-ink`, never `text-white`, and amber may never be the text colour on a light surface (use `text-accent-ink`).
- Forms built without `react-hook-form` + `zod` (uncontrolled inputs)?
- Component files not PascalCase, or using a default export instead of a named one?
- API routes not using the `route.ts` + named `GET`/`POST` convention?

### 5. Test coverage

- New `src/lib/**` code covered by tests? (Co-located `*.test.ts` next to the source file, following the existing pattern.)
- Does the change touch `src/lib/fdi/score.ts`, `bands.ts`, or `rounding.ts`? Those are held to 100% statements/branches/functions/lines in `jest.config.ts` — a gap there blocks the build, not just a warning.
- Does a new Supabase migration ship with an RLS policy and, ideally, a test asserting on the migration content (see `supabase/migrations/fdi_phase3_sessions.test.ts` for the pattern)?

## Output format

| # | Severity | Dimension | Finding | File:Line | Fix |
|---|----------|-----------|---------|-----------|-----|
| 1 | 🔴 High | Security | Service-role key referenced in client component | foo.tsx:12 | Move to a Route Handler |
| 2 | 🟡 Medium | Performance | N+1 query inside a loop | admin/leads/page.tsx:88 | Batch the query outside the loop |
| 3 | 🟢 Low | Convention | Raw `#0066FF` in JSX instead of `bg-brand` | services/page.tsx:40 | Use the Tailwind token class |

Severity scale:
- 🔴 **High** — must fix before merge (security, data loss, broken RLS, service-role key exposure)
- 🟡 **Medium** — should fix (performance, correctness, coverage gaps on the 100%-held FDI files)
- 🟢 **Low** — nice to have (convention, style)

End with: **Overall: PASS** (no 🔴 findings) or **FAIL** (has 🔴 findings — do not merge).

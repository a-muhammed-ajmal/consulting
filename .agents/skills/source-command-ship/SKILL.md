---
name: "source-command-ship"
description: "Migrated source command `ship`"
---

# source-command-ship

Use this skill when the user asks to run the migrated source command `ship`.

## Command Template

### `/ship` Rules

Run every step in order.

If a step fails and the fix is obvious from the error (missing import, type error, unused variable, lint warning) — fix it and re-run that step. Do not ask. Only fix what the error explicitly says to fix.
If a step fails and fixing it requires any assumption or user decision — stop. Report exactly what failed and exactly what the user must do. Do not proceed.
When all steps pass — update files, commit, push.

#### Steps:

**1. Lint**
Run: `npm run lint`. On failure:
Run `npx eslint --fix` on the affected files, then re-run `npm run lint`.
If errors remain after auto-fix: stop. List every error with file path, line number, and error message. Wait for user.

**2. Test coverage**
Run: `npm run test:coverage`. Capture the exact test count (e.g., "298 passed, 22 suites") and exact statement coverage % from the output — these go verbatim into the report and into `README.md`'s Project stats table.
`jest.config.ts` holds `src/lib/fdi/score.ts`, `bands.ts`, and `rounding.ts` to 100% coverage — a gap in one of those three files fails this step. There is no blanket global threshold; a drop in overall coverage outside those files does not fail the step.
On failure:
If the failure is a broken import, missing mock, or type mismatch, the error explicitly describes it: fix it and re-run.
If fixing requires understanding business logic or behavior: stop. Report which test failed, the exact error, and what the user must decide.

**3. Build**
Run: `npm run build`. On failure:
If it is a TypeScript type error, missing import, or lint issue, the error explicitly describes it: fix it and re-run.
If it requires any assumption about intent or architecture: stop. Report the exact error. Wait for user.

**4. Type audit**
Run: `npm run audit:type`. Capture the exact route count. On failure, fix only explicit implementation errors; otherwise stop and report.

**5–8. Update project docs (conditional)**

* **PRODUCT (`docs/PRODUCT.md`) and WEB (`docs/WEBSITE.md`):** If the shipped work changes product behaviour, requirements, features, edge cases, or acceptance criteria, update the owning document — by Document ID, never by filename. Otherwise leave both unchanged.
* **`AGENTS.md`:** Keep Codex project instructions current. Update it when the shipped work changes the instructions or validation workflow.
* **`AGENTS.md`:** If shipped work changes architecture facts, stack, routes, tokens, or development patterns, flag it for user approval — do not edit unprompted.
* **`README.md`:** Update the "Project stats" table (Tests / DB tables / Migrations / Routes). Update only the Tests row with the exact count and coverage % from step 2 — e.g., `298 passing (22 suites), 58.17% statement coverage`. Touch nothing else in the table unless the shipped work actually added a migration or a DB table, in which case update that row too with the real count.

**9. Commit**
First verify identity — run `git config user.email`. It MUST be exactly `ajmalconsults@gmail.com`. Do not guess or assume. If it is not set to this exact email, or if you cannot verify it, stop and ask the user. Never commit under a different identity.
Run: `git add -A`.
Run:

```bash
git commit \
  -m "chore: ship — [count] tests, [coverage]% — [YYYY-MM-DD]" \
  -m "[short description of what actually shipped]

Co-Authored-By: Codex <noreply@anthropic.com>"

```

Use the actual test count and coverage % captured in step 2, today's date, and briefly describe the changes in the second block.

**10. Push**
Always push directly to the main branch (`a-muhammed-ajmal/consulting`). Do not create any other branches.
Run: `git push -u origin main`.
On failure: stop. Report the exact error and what the user must do to resolve it.

#### Report

Output only this at the end:

```text
Lint:       PASS / FAIL
Tests:      [count] passing, [coverage]% — PASS / FAIL
Build:      PASS / FAIL
Type scale: [n] routes, ceilings hold — PASS / FAIL
README.md:  updated / unchanged
spec.md:    updated / unchanged
AGENTS.md:  updated / unchanged
AGENTS.md:  unchanged / flagged for approval
Commit:     [hash] [message]
Push:       SUCCESS / FAILED

USER ACTION REQUIRED: If nothing: None.
If there are Supabase migrations to run, list them like this:
Go to Supabase Dashboard → SQL Editor, or run `supabase db push`. Run this SQL (from `supabase/migrations/<file>.sql`):
-- full contents of the new migration file

```

**SQL block must be copy-pasteable exactly as shown. Never summarize or describe the SQL — always output the full statement.**

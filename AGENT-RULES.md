# Agent Rules

**The standing operating rules for the governance documents of Muhammed Ajmal Consulting.**

Read this before touching any file in `docs/` or `.claude/`.

These are standing rules, not a procedure to run. The one-time migration that
installed this governance layer completed on 2026-08-24; its phase-by-phase
section was removed once done and remains in git history from `e0ff4ce`
forward. Everything below applies to every session, indefinitely.

---

## 0. Rule Zero — verify, never assume

Defined once in `AGENTS.md`. It outranks every other instruction in every file.

### Approval

The approval model is defined in one place: **`SYSTEM-MAP.md` at the root of the `a-muhammed-ajmal/muhammed-ajmal-consulting` repository.** This file does not define a second one.

In summary, and subordinate to the map:

- Without a defined approved change, an agent may read, inspect, research, analyze, verify and recommend.
- When Ajmal approves a clearly defined change, that approval covers every internal write required to make that change consistent. State the scope before execution, then perform, verify and report. Do not stop for a fresh approval merely because the same approved change touches several dependent internal files.
- **Advance confirmation is still required, every time, for:** deployment, publishing, any external send, destructive actions, deletion, financial or legal commitments, credential, account or security changes, and anything a platform or safety rule requires to be confirmed in advance.

The file-specific protections below are additional requirements. Satisfying the approval model does not remove them, and they are not a competing approval model — they are controls on particular documents.

---

## 1. The four documents

The register — the four Document IDs, their files, and what each governs — is
defined in ANCHOR §15. Read it there. It is not restated here.

Cross-reference by Document ID. Never by filename.

The register is closed at four. New governing content is added to an existing document, never to a new one.

---

## 1b. The engineering layer

Four more files govern engineering, not product. They are not part of the closed register and must not duplicate it.

| File | Keeps | Must not contain |
| :---- | :---- | :---- |
| `AGENTS.md` | Tech stack, architecture map, coding standards, key constraints, validation commands | Design tokens, type scale, utility class list, FDI rules, page purposes |
| `CLAUDE.md` | A short pointer to `AGENTS.md` and to the four documents by Document ID | Anything substantive |
| `.claude/commands/ship.md` | Release procedure | Product behavior |
| `spec.md` | **Deleted 2026-08-24.** Its content is in PRODUCT and WEB. Do not recreate it. | — |

Where an engineering file describes product behavior, it points to the Document ID instead. Duplication is what allowed three wrong font names and one prohibited phrase to survive months of review.

**Two defects in `AGENTS.md` were fixed on 2026-08-24. Neither may return:**

- The architecture map must label `lib/scoring.ts` and `lib/questions.ts` as **retired** — both belong to the ten-question diagnostic. Verified: `scoring.ts` survives only for `DIMENSION_META` in the admin historic-lead view, and nothing imports `questions.ts` at all. `lib/fdi/` is the active path.
- The Design System section must stay a pointer to DESIGN plus a one-line identity statement. It must never again reproduce the token table, the type scale, or the utility class list.

---

## 2. Authority order

When two sources disagree, the higher one wins:

1. Explicit owner direction for the current release
2. ANCHOR
3. WEB
4. PRODUCT
5. DESIGN
6. The deployed codebase

For system ownership, routing and completion control — which system owns which information — the System Map in the business repository is the authority, above every file here.

Two standing exceptions where the codebase is truth and the document is corrected to match it:

- `globals.css` for design token values
- The active instrument configuration for question wording, option wording, scores, and findings

---

## 3. ANCHOR is locked

No agent may edit, reformat, reorder, summarize, or delete any part of `docs/ANCHOR.md`. Reading and citing it is always permitted.

An edit requires all four of these:

1. The user names the file explicitly. Not "the docs," not "the governance layer."
2. The user states the exact change, section by section.
3. The agent quotes the current text back before changing it.
4. The user confirms after seeing that quote.

This four-step requirement is specific to this file and stands on its own. It is not satisfied by a general approved change elsewhere.

**A request to "align the documents," "fix inconsistencies," or "update everything" is never authorization to change ANCHOR.** Where another file disagrees with it, the other file is what changes.

Finding that the code, the site, or another document contradicts ANCHOR is not grounds for an edit. It is grounds for changing the code, the site, or the other document.

---

## 4. The other three

PRODUCT, WEB, and DESIGN are editable, with three conditions:

- Name the document and the section before editing.
- State what changes and why.
- Never edit one to resolve a conflict with ANCHOR. ANCHOR wins.

Three blocks inside these documents are frozen and reproduced word for word:

- The limitation paragraph in PRODUCT §A10
- The four band definitions, wherever they appear
- The mandatory scope line in PRODUCT §A1

---

## 5. What an agent must never do

- **Never invent a Founder Dependency Index band, range, or label.** The only four are in PRODUCT §A6. A high index is the adverse result; band names never read as praise.
- **Never render a sample score, filled meter, or demo reading.** A plausible number is an invented metric.
- **Never write `%` near the index.** It is a value out of 100.
- **Never edit, migrate, rescore, or delete a historic instrument version or its sessions.** Six completed FDI-1.0 sessions exist and were emailed.
- **Never infer live data from migrations, fixtures, or test files.** Counts come from live rows or they do not exist.
- **Never use a credential from `.env.local` to open an outbound connection** without explicit authorization for that specific call.
- **Never resolve a documentation conflict silently.** Report it and stop.

---

## 6. On finding a conflict

1. Stop. Do not edit.
2. Report: which two sources, the exact text of each, and file paths with line numbers.
3. State which one the authority order in §2 makes correct.
4. Wait for a decision before any change.

This applies even when the correct answer looks obvious.

---

## 7. Settled — do not re-open

Four items were open when this layer was installed. All four closed on 2026-08-24, with evidence.

**PRODUCT §A4 — verified byte-identical.** All 12 question prompts and all 48 options, text and score alike, match `src/lib/fdi/questions/fdi-questions-1.1.ts` exactly. The five em dashes in OV1-A, OV1-B, OV1-C, OV1-D and OV4-A are U+2014, and the apostrophe in EC1-C `people's` is U+0027, not U+2019. Nothing differed; the document needed no correction. Re-verify after any paste into that section — an editor with autocorrect enabled will silently break both.

**PRODUCT §A8 — verified byte-identical.** All 24 findings statements, 12 high-dependency and 12 low-dependency, match the `RULES` table in `src/lib/fdi/observations.ts` exactly.

**DESIGN §1 — filled.** The audit exception now records `scripts/audit-type-scale.mjs` and the three lines changed there.

**The unverified release check — it exists, and it passes.** `src/lib/fdi/config.test.ts`, describe block *FDI-1.1 approved Business Health Check wording*, asserts the exact text of every question and every option and locks both the config and the question set behind SHA-256 digests. Run 2026-08-24: 337 tests across 29 suites, all passing.

---

## 8. The guard

`src/lib/website-specification.test.ts` scans the governance surface on every CI run and fails on prohibited language. The build once scanned only part of the layer, which is why prohibited language survived in a document for weeks.

**Scope.** Every file under `docs/` and `.claude/`, plus `CLAUDE.md` and `AGENTS.md` at the repository root. Generated and vendored trees are skipped: `node_modules`, `.cache`, `learnings`, `.next`, `coverage`. 63 files as of 2026-08-25. **This file, `AGENT-RULES.md`, is not in scope** — the root list is exactly `CLAUDE.md` and `AGENTS.md`, so a font name written here is never scanned. Verified against `ROOT_FILES` in the guard.

**Fails on:**

- `predictable growth`
- `Critical 0-39`, `Developing 40-69`, `Progressing 70-100` — hyphen and en-dash forms both
- `Figtree`, `Segoe UI`, `Roboto Slab` — the retired faces. `Lexend` was removed from this list on 2026-08-25, when it became the body face.
- a **third typeface named in prose** — any face outside the approved pair, on a line carrying no refusal wording
- a **third typeface bound in a `font-family` declaration** — every family a stack names must be an approved face, a generic CSS fallback, or token indirection such as `var(--font-body)`
- `Strategic Growth Architect` where not followed by `ure`
- `%` within 40 characters of `Founder Dependency Index`

**The approved pair.** Plus Jakarta Sans for headings and display; Lexend for body, UI, and small text. Nothing else. `font-mono` is Plus Jakarta Sans with tabular figures, not a third family.

**Two exemptions. Both narrow, both load-bearing, both verified to be no wider than they need to be.**

1. **Prohibition statements.** A line that quotes a banned term inside straight double quotes *and* declares it prohibited is the rule, not a breach of it. ANCHOR §12 reads `"Predictable growth" is prohibited language.` and ANCHOR is a locked file — without this exemption the guard would fail on a document no agent is permitted to edit. Exactly two files rely on it: `docs/ANCHOR.md` and `docs/PRODUCT.md`. A retired typeface reintroduced in ordinary prose still fails.

2. **Refusal wording — `third-face` only.** A line that names a third face in order to reject it is the rule, not a breach of it; the documents must be able to say "not Inter". A line matching the third-face rule is exempt when it carries refusal wording — `never`, `not`, `no`, `avoid`, `instead of`, `rather than`, `retired`, `prohibited`, `forbidden`, or ❌. This applies to `third-face` alone. A RETIRED face reintroduced in ordinary prose still fails, refusal wording or not.

**No path is exempt from the typeface rules.** `.design-sync/` was deleted on 2026-08-25 — it was a one-time Claude Design sync, no longer used, and its font pipeline was the only thing that ever held a path-based exemption. Nothing replaces it. A retired face anywhere on the governance surface now fails, with no file-level escape hatch.

**Sanctioned hardcoded font stacks.** Five files carry a `font-family` outside `globals.css` and `layout.tsx`. These five, and no others:

- `src/app/apple-icon.tsx`
- `src/app/icon.tsx`
- `src/app/opengraph-image.tsx` — the three Satori routes, which need an embedded font buffer, not a CSS variable
- `src/lib/email/templates/ContactNotification.tsx`
- `src/lib/email/templates/FdiReport.tsx` — email clients support neither CSS variables nor `next/font`

**The `AGENTS.md` do-not-revert line — resolved.** It was reworded to name no font, so no by-name line exemption is needed. It now reads: *"Do not revert to any previous visual identity. Several were retired deliberately. DESIGN is the only current specification."*

---

END OF AGENT RULES

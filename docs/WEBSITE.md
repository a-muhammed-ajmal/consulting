# Website

**The public website specification for Muhammed Ajmal Consulting.**

Document ID: WEB · Version 1.0

## 1. Governing authority

Apply sources in this order when content, product, or presentation
decisions conflict:

1.  Explicit approved owner direction for the current release.

2.  ANCHOR — positioning, commercial path, framework register, claims
    governance.

3.  WEB — this document, for the public website.

4.  PRODUCT — the Business Health Check instrument and the Business
    Clarity Audit.

5.  DESIGN — colors, typography, components, accessibility.

6.  The deployed codebase — implementation facts, technical patterns,
    verified configuration.

No document inside the repository, no published page, and no historic
result may override a higher authority.

The internal delivery sequence defined in ANCHOR is not a public
framework and never appears in public copy.

## 2. Purpose and positioning

Muhammed Ajmal is a Business Operations & Growth Consultant based in
Dubai, United Arab Emirates.

The site helps founder-led UAE SMEs understand founder dependency, start
with a focused self-report, and move through one evidence-led commercial
path when there is a real operating need.

Positioning statement: *Muhammed Ajmal Consulting helps founder-led UAE
SMEs build successful, scalable businesses by reducing founder
dependency through stronger systems, clearer ownership, useful
visibility, and consistent execution.*

The public promise is the mechanism, not a guaranteed result. The site
must not promise revenue, profit, percentage improvement, guaranteed
growth, or that growth can be made predictable.

Applied AI is an enabler used after the underlying work is understood.
It is never the lead offer and never a substitute for process design.

The primary audience is founder-led UAE businesses that can approve
operating changes through a founder decision-maker and sit broadly
within the practice's revenue, team, and operating-age profile.
Target-profile language is a qualification guide, never a public
guarantee or an exclusionary claim.

## 3. Public intellectual property

The site may present exactly four frameworks, defined in ANCHOR §10:

- **Founder Trap** — the observable pattern in which too much work,
  knowledge, and growth rely on the founder.

- **Founder Dependency Index** — the 0–100 measure of reported founder
  dependency returned through the Business Health Check.

- **Growth Formula** — Vision → Strategy → Systems → People → Execution
  → Accountability.

- **Strategic Growth Architecture** — Founder → Team → Systems →
  Automation → Data → Scale.

The Business Health Check and every paid offer are offers, not
frameworks. Strategy, systems, people, and applied AI are areas of work,
not framework names.

## 4. Route register

| **Route**                   | **Purpose**                                                        |
|-----------------------------|--------------------------------------------------------------------|
| /                           | Home                                                               |
| /about                      | Muhammed Ajmal and the delivery approach                           |
| /services                   | The single commercial path                                         |
| /diagnostic                 | The Business Health Check                                          |
| /results                    | The browser-private result for a completed Business Health Check   |
| /contact                    | Inquiry form and Operating Conversation booking                    |
| /insights                   | Articles index                                                     |
| /insights/\[slug\]          | Individual article                                                 |
| /insights/category/\[slug\] | Category-filtered index                                            |
| /privacy                    | Privacy policy                                                     |
| /unsubscribe                | Newsletter unsubscribe confirmation                                |
| /admin                      | Protected internal administration — not a public marketing surface |

Two aliases exist and return HTTP 308:

| **Alias**       | **Canonical** |
|-----------------|---------------|
| `/diagnostic/fdi` | `/diagnostic` |
| `/results/fdi` | `/results` |

Alias layouts are noindex. They are not alternate public pages. Public
components link to the canonical route directly.

One fallback exists and is not a route:

| **Fallback**  | **Serves**                                                     |
|---------------|----------------------------------------------------------------|
| `not-found.tsx` | Any unmatched path — HTTP 404 |
| `error.tsx` | An unhandled render error in a public route segment — HTTP 500 |

The fallback is noindex, absent from the sitemap, and absent from navigation. It is not a landing surface: it carries no offer, no lead capture, and no claim. It returns the visitor to a registered route.

The public site exposes no /api/submit route, no feature-flag fallback,
and no AI-generated report path. Protected administrative access to
stored lead data remains available.

## 5. Navigation, footer, and calls to action

Main navigation contains exactly: Founder Trap (/#founder-trap), How It
Works (/services), Insights (/insights), About (/about), Contact
(/contact).

The single primary navigation CTA label is exactly **Start the Business Health Check →** and its destination is /diagnostic. The visual button
may render the arrow glyph; its accessible name retains the complete
label. Desktop and mobile use identical wording. The `/results` route is
the deliberate exception: once a founder is already viewing a completed
result, the navigation CTA is hidden on both desktop and mobile so the
result handoff is not interrupted.

The site renders no fixed or sticky CTA bar at any viewport width. Calls
to action stay inside the normal document flow on desktop, tablet, and
mobile.

The footer repeats the core navigation, Privacy, the Business Health
Check CTA, and this descriptor: *Business Operations & Growth Consulting
for founder-led UAE SMEs, based in Dubai, United Arab Emirates.*

The footer newsletter is factual and opt-in. It must not imply a
delivery frequency or content volume that has not been approved. A new
subscriber receives a transactional confirmation email with the subject
**You are subscribed** and a working unsubscribe link. A genuinely new
subscriber also triggers a one-line owner notification with the subject
**New newsletter subscriber**. Reactivating a previously unsubscribed
address sends the subscriber confirmation again. Re-submitting an address
that is already actively subscribed succeeds without sending either email
again.

The post-result CTA is exactly **Discuss a Business Clarity Audit** and
links to the configured Calendly booking URL. Where a business WhatsApp
number is configured, **Message on WhatsApp** may appear as a secondary
prefilled inquiry link.

Neither result CTA sends a completed founder to /contact, restarts the
check, or requires an AI report.

**Operating Conversation.** The configured Calendly event is named
**Operating Conversation**. It is a short pre-Audit conversation that may
lead to the Business Clarity Audit; it is not the Audit itself and does
not diagnose root cause or determine the binding constraint. Its public
description directs founders to complete the Business Health Check first
and states that the conversation discusses reported symptoms and context,
not diagnosis. The public booking control uses the configured event at
`https://calendly.com/muhammed-ajmal-consulting/operating-conversation`.

## 6. The commercial path on the site

The public path is a required sequence, not a menu. Stage definitions
live in ANCHOR §8.

1.  **Business Health Check** — a free founder-dependency self-report
    returning the Founder Dependency Index.

2.  **Business Clarity Audit** — an operating audit testing reported
    patterns against operating evidence.

3.  **Focused Improvement Sprint** — a tightly scoped improvement
    addressing the binding constraint.

4.  **Business System Build** — the broader operating-system build where
    evidence supports it.

5.  **Growth Partner Retainer** — ongoing operating support once
    foundations are in place.

The Business Clarity Audit is not a statutory, financial, tax,
compliance, or legal audit. It examines operating evidence: records,
workflows, dashboards, decision samples, SOPs, roles, and rework.

## 7. The Business Health Check on the site

The Business Health Check is the customer-facing entry offer. It is a
focused founder-dependency self-report, not a broad financial, tax,
legal, compliance, or whole-business assessment.

It asks 12 questions, four each across Decision Speed, Execution
Consistency, and Operational Visibility. It returns a Founder Dependency
Index out of 100, one 0–100 component score per operating area,
deterministic findings drawn from the respondent's answers, and a direct
next step.

The instrument, question wording, scoring, bands, findings,
qualification, and report email are defined in PRODUCT. This document
does not restate them.

Two rules bind the public presentation:

- Scores display on the 0–100 scale. Never as a percentage, and never
  with a % symbol near the index.

- A high index is the adverse result. Band labels must never read as
  praise.

Required limitation, reproduced word for word wherever a result appears:

> This result is based on founder self-report. It identifies where
> dependency appears. It does not prove why it exists, the operational
> root cause, the single binding constraint, or what intervention will
> fix it.

The results page is reached directly at /results after a successful
submission. It reads the deterministic report stored in the current
browser session. Where no valid browser report is present, it directs
the visitor to start a new Business Health Check. It never reconstructs
a report from a different session.

## 8. Page requirements

### Home — /

Reading order: hero · Growth Formula · Founder Trap · Business Health
Check and Founder Dependency Index · five-stage commercial path ·
operating scope · Strategic Growth Architecture · target profile ·
closing Business Health Check CTA.

Required hero: build a business that grows beyond the founder. Support
copy explains the systems, ownership, visibility, and consistent
execution that reduce founder dependency. Primary CTA starts the
Business Health Check; secondary CTA explains how the practice works.

The Business Health Check presentation names its three operating areas
and its self-report boundary. The target-profile revenue line uses the
full wording **AED 1,000,000 to AED 10,000,000**; abbreviations such as
AED 1M–10M are not used.

Primary sector language names trading and distribution, real estate and
property services, and specialty contracting and technical services.
These acquisition sectors do not replace or redefine the separate
qualification taxonomy governed by PRODUCT.

Do not render score-like graphics, fabricated readings, unsupported band
names, or a home-page index meter. The previous empty 0–50–100 scale and
its "awaiting your answers" caption are not permitted.

### Services — /services

Explains one evidence-led progression. Shows self-report → evidence →
root cause and priority assessment, then the five stages in order.

Explains that the Business Health Check suggests where to examine and
the Business Clarity Audit tests operating evidence. Public questions and
labels use **Business Health Check**, never the internal label
"diagnostic". Ends with the Business Health Check CTA.

### Diagnostic — /diagnostic

The only public diagnostic page. States the 12-question scope,
progress-saving behavior, the self-report boundary, the privacy link,
and the limitation before contact information is collected.

Name, email, company, and phone are required. Optional business details
never change the result.

Test mode is protected by authenticated admin access and is visibly
marked as a test record.

### Results — /results

A browser-private report. Shows the overall score, band label, three
component scores, deterministic observations, concentration, any
severe-component alert, the limitation, and the Business Clarity Audit
CTA.

The email report uses the same deterministic content and the same CTA
route.

### Contact — /contact

The page provides two contact mechanisms: a working inquiry form and a
booking control for the Operating Conversation. The page does not present
a menu of standalone consulting services and does not advertise a free
consultation stage.

The inquiry form uses US English and the heading **Send an inquiry**. The
submit button is **Send Inquiry**. The inquiry-type field contains exactly
four neutral reasons for contact:

- Following up on my Business Health Check result
- A question about the Business Clarity Audit
- A specific operating question
- Something else

The target-profile revenue wording is **AED 1,000,000 to AED 10,000,000**.

On submission, the inquiry must be stored before the internal notification
is attempted. The notification uses the visitor's submitted email as the
Reply-To address and displays the readable inquiry label rather than an
internal stored code. The notification body includes a direct mail link to
the visitor. Notification delivery outcome is recorded separately from the
inquiry itself: `email_sent` is true only after Resend accepts the
notification; `email_error` records the rejection message when sending
fails. A notification failure does not delete the stored inquiry and does
not ask the visitor to resubmit an inquiry that was already captured.

The booking section is headed **Book a conversation** and opens the
configured Operating Conversation event. It does not claim that the
conversation is free consulting, an Audit, a diagnostic, or a strategy
session.

### About — /about

Establishes the consultant's operating approach: management knowledge,
systems thinking, execution, and applied AI.

Invents no qualifications, testimonials, client results, logos,
certifications, or geographic claims beyond approved factual identity
and location.

### Insights — /insights, article, and category routes

Insights teach operating problems and mechanisms before selling an
offer.

Article metadata, dates, author identity, categories, summaries, read
times, and calls to action are factual and come from the article
registry. Do not invent article counts, readership, business results, or
authority signals.

**Approved type exception.** Article body copy on /insights/\[slug\]
renders at 16px on mobile rather than the 14px site ceiling. This is the
only sustained-reading surface on the site and the exception is
deliberate. The token change and its audit exception are defined in
DESIGN. No other route may claim this exception.

### Privacy — /privacy and unsubscribe — /unsubscribe

Privacy content describes the actual data collected, deterministic
diagnostic use, processors, cross-border processing, retention, contact
channel, and rights. Review it whenever processors, retention, consent,
or data practices change.

The implemented application-retention schedule is: incomplete FDI attempts,
30 days; completed FDI sessions, contact inquiries, and historic diagnostic
leads, 24 months from submission; unsubscribed newsletter rows, 30 days;
expired admin sessions, immediately eligible for deletion; rate-limit rows,
two days. Supabase, Resend, Vercel, Cloudflare, and Calendly are disclosed as
service providers according to their actual roles in the deployed flow.

The policy names Federal Decree-Law No. 45 of 2021. It does not cite an
executive regulation unless that instrument has been verified from an
authoritative UAE source.

The unsubscribe route is factual, handles valid, invalid, and error
states, and is noindex. A valid unsubscribe sets the subscriber's
`unsubscribed_at` state. Invalid tokens resolve to the invalid state rather
than changing subscriber data. Newsletter database write errors are
checked explicitly; a failed write returns a failure response and the
subscriber UI must not display a successful subscription.

### Not found and error fallback

Factual and brief. States that the page does not exist, offers Home and
the Business Health Check as the two ways forward, and may list
registered routes as likely destinations. The error boundary states that
something failed and offers a retry.

Neither surface invents a reason, apologises at length, captures an
email, or presents an offer. Both use the standard page shell so a
visitor who lands there is still on the site.

### Administration — /admin and protected subroutes

Password- and cookie-protected internal tools provide access to current
Founder Dependency Index sessions, stored inquiries, and historic lead
records. They are not public marketing pages, are noindex, do not appear in
the sitemap, and are not linked from public navigation.

The browser holds the random admin bearer token only in a secure,
HTTP-only, same-site cookie. The database stores its SHA-256 digest, and
sign-out revokes that digest before clearing the cookie. Login rate limiting
fails closed if its database guard is unavailable. Failed admin data queries
render an explicit error state and are never presented as an empty pipeline.

The protected inquiries surface shows stored contact inquiries and their
notification-delivery state. Failed notifications are surfaced before
successful or unrecorded historic rows so follow-up risk is visible.

Historic lead records created under superseded diagnostic logic may be
retained, but they must be clearly treated as legacy data. Historic
percentage "health" values and historic constraint labels are not Founder
Dependency Index results and must never be interpreted under the current
Business Health Check rules. Current FDI sessions use the current PRODUCT
terminology and version stamps.

Internal diagnostic labels and database fields used in administration are
not public copy.

## 9. Design

DESIGN is the single specification for colors, typography, spacing,
components, and accessibility. globals.css is the implementation truth;
DESIGN documents it.

This document does not repeat hex values, font sizes, or token names.
Where a page requirement above depends on a visual rule, it names the
rule and points here.

Two site-level requirements sit above any component choice:

- Plus Jakarta Sans and Lexend are the entire web-font budget — Plus
  Jakarta Sans for headings and display, Lexend for body, UI, and small
  text. No third face.

- Every page maintains one h1, semantic heading order, visible keyboard
  focus, 44px minimum icon-control targets, no horizontal overflow at
  320px, usability at 200% zoom, reduced-motion support, accessible
  error states, and 4.5:1 text contrast.

## 10. Technical and content standards

The site uses Next.js App Router, TypeScript strict mode, React,
Tailwind CSS v4 tokens in globals.css, Supabase server-side access,
Resend email delivery, React Hook Form with Zod validation, native CSS
motion, and Lucide icons.

Prefer server components. Keep client boundaries small. Public browser
code never receives Supabase service-role credentials.

Every route receives the configured Content Security Policy, clickjacking,
MIME-sniffing, referrer, permissions, DNS-prefetch, and transport-security
headers. The policy permits only the origins required by the site and its
configured Calendly, Vercel Analytics, and Cloudflare Web Analytics
integrations.

FDI session tokens are signed with `FDI_SESSION_SIGNING_SECRET` when it is
configured. The existing service-role-key fallback preserves issued-token
compatibility while deployments adopt the dedicated secret.

The production Calendly destination is provided through
`NEXT_PUBLIC_CALENDLY_LINK`. Because `NEXT_PUBLIC_` values are embedded in
the client bundle at build time, changing this booking value requires a
new deployment before visitors receive it.

Newsletter persistence uses Supabase upsert semantics and must inspect the
returned error object before reporting success. Contact persistence must
likewise inspect database results. Transactional email delivery through
Resend is treated as a separate operation from successful database
persistence; send failures are recorded rather than silently discarded.

Database migrations must target the production website project explicitly.
Do not infer the production project from whichever Supabase connector is
currently attached to an agent session.

Use US English spelling and date order — for example, August 21, 2026.

Do not publish raw implementation terms, inactive route names, database
field names, or version labels in customer-facing copy unless the
version context is specifically required.

Use truthful JSON-LD for Person, ProfessionalService, the service path,
FAQ, and articles where relevant. Do not publish aggregate ratings,
reviews, customer counts, prices, employee counts, certifications,
testimonials, client logos, or performance statistics unless approved
and verifiable.

## 11. Publishing checklist

Run before every release.

- All public diagnostic links use /diagnostic; the completed flow uses
  /results.

  /diagnostic/fdi and /results/fdi return HTTP 308 to canonical routes.

  New sessions stamp the active instrument version set defined in
  PRODUCT.

  No historic session record has changed.

  Scoring, findings, qualification, report email, and email_sent
  behavior remain deterministic.

  A completed session resolves the question, scoring, band, and
  qualification versions stamped on that session. An FDI-1.0 result is
  never rescored as FDI-1.1.

  /contact presents a working inquiry form with the four approved inquiry
  reasons and a working booking control for Operating Conversation.

  A stored inquiry remains stored if the owner notification fails;
  `email_sent` and `email_error` record the send outcome, Reply-To resolves
  to the visitor, and the readable inquiry label appears in the
  notification.

  A fresh newsletter subscription stores successfully, sends the
  subscriber confirmation and owner notification, and includes a working
  unsubscribe link. An already-active resubmission sends no duplicate
  emails. A forced database-write failure does not display subscription
  success.

  The Business Clarity Audit CTA opens the configured Operating
  Conversation event. WhatsApp appears only when a valid configuration is
  present.

  The primary navigation CTA is absent on `/results` on both desktop and
  mobile.

  No fixed or sticky CTA bar appears on any route or viewport.

  `/admin` and protected admin subroutes remain authenticated, noindex,
  absent from the sitemap, and absent from public navigation.

  No AI-generated report path, no public /api/submit, no feature-flag
  fallback.

  No invented index meter, band name, or performance claim.

  npm run audit:type passes — responsive type scale, mobile overflow,
  and global font-family checks, including the /insights/\[slug\]
  exception.

  Lint, coverage, production build, browser type audit, route checks,
  and a production-style result-delivery check all pass.

  Release verification uses the canonical live production URLs directly.
  Search-engine snippets and cached crawls may lag behind deployment and
  are not treated as proof that the current live page is wrong. Where a
  stale indexed copy remains after a verified release, request reindexing
  rather than rebuilding a compliant live page.

## 12. Current implementation status

As of September 11, 2026, the release includes the public website, contact
and newsletter flows, Operating Conversation booking, protected
administration, canonical redirects, deterministic Business Health Check,
site-wide security headers, hashed and revocable admin sessions, and an
application-data retention job. The release has passed the publishing checks
above, every committed migration is applied to the consulting production
project, and the scheduled retention job is active.

Completed website work is not reopened as planning work unless a new
verified defect, approved owner change, processor/data-practice change, or
registered product change requires it.

END OF WEBSITE

/*
 * Operational privacy notice. Keep the provider list, retention schedule, and
 * contact channel synchronized with the deployed service. Legal rights remain
 * qualified by applicable law rather than overstated as unconditional promises.
 */
import Link from 'next/link';
import { ArticleToc, type TocItem } from '@/components/insights/ArticleToc';
import { PageHero } from '@/components/ui/PageHero';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How Muhammed Ajmal Consulting collects, uses, retains, and protects personal data under applicable UAE data protection requirements.',
  path: '/privacy',
});

const LAST_UPDATED = '10 September 2026';
const PRIVACY_EMAIL = 'privacy@muhammedajmal.com';

const dataCollected: { item: string; detail: string }[] = [
  { item: 'Name', detail: 'To address you and personalise your diagnostic report.' },
  { item: 'Email address', detail: 'To send your report, respond to inquiries, and — if you opt in — send newsletters.' },
  { item: 'Mobile number', detail: 'To follow up on your inquiry or diagnostic result.' },
  { item: 'Company name', detail: 'To contextualise your diagnostic and any conversation that follows.' },
  { item: 'Business details', detail: 'Optional. Sector, number of employees, revenue band (a range, not an exact figure), and how long the business has operated. Skipping them does not affect your result.' },
  { item: 'Business Health Check answers', detail: 'Your responses to the 12 self-report questions, used only to calculate your Founder Dependency Index and deterministic findings.' },
];

const processors: { name: string; role: string; location: string }[] = [
  { name: 'Supabase', role: 'Database hosting — stores your submissions.', location: 'Servers outside the UAE' },
  { name: 'Resend', role: 'Email delivery — sends your report and our replies.', location: 'Servers outside the UAE' },
  { name: 'Vercel', role: 'Website hosting, infrastructure, and site-usage analytics.', location: 'Servers outside the UAE' },
  { name: 'Cloudflare', role: 'DNS, network security, content delivery, and related request logs.', location: 'Global network, including locations outside the UAE' },
  { name: 'Calendly', role: 'Consultation scheduling, if you choose to book a call.', location: 'Servers outside the UAE' },
];

const rights: string[] = [
  'Ask how your personal data is processed.',
  'Request access to the personal data we hold about you.',
  'Request correction of inaccurate or incomplete data.',
  'Request erasure where the applicable conditions are met.',
  'Request restriction or cessation of processing where applicable.',
  'Request data portability where applicable.',
  'Withdraw consent where consent is the basis for processing, without affecting earlier lawful processing.',
];

/** Slug for the in-page anchor. Derived from the heading so the two cannot drift. */
function headingId(heading: string) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 id={headingId(heading)} className="scroll-mt-24 font-heading font-extrabold text-[length:var(--step-3)] text-ink pt-2">{heading}</h2>
      {children}
    </section>
  );
}

/* Mirrors the section order below. A heading added there must be added here. */
const TOC_HEADINGS = [
  'What data we collect',
  'Why we collect it',
  'Our lawful basis',
  'Third parties who process your data',
  'Cross-border transfer',
  'How long we keep it',
  'Your rights under the PDPL',
  'How to exercise your rights',
  'Changes to this policy',
];

const toc: TocItem[] = TOC_HEADINGS.map((heading) => ({ id: headingId(heading), label: heading }));

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lead={`Last updated: ${LAST_UPDATED}`}
        orbs={false}
      />

      {/* No orbs, no spoke arc, no marquee on this route (frontend.md §3.10). */}
      <section className="relative overflow-hidden border-y border-line bg-canvas-light px-6 py-12 md:py-16">
        <div className="relative z-10 mx-auto flex max-w-6xl gap-12 lg:items-start">
          {/*
            Deliberately NOT .article-longform. That class carries the 16px
            mobile body exception, and its `li` selector matches any descendant
            — applying it here would silently extend the exception to Privacy.
            DESIGN §1: no other route may claim it. The measure is set directly.
          */}
          <div className="min-w-0 max-w-[68ch] flex-1 space-y-8 font-body text-ink leading-relaxed">

          <div className="bg-white border-l-4 border-brand rounded-r-lg p-5 shadow-1">
            <p className="text-[length:var(--step-0)] text-muted">
              This policy explains how Muhammed Ajmal Consulting (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles your
              personal data. We handle personal data under applicable UAE data-protection requirements,
              including Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data.
            </p>
          </div>

          <Section heading="What data we collect">
            <p>When you use the diagnostic, contact form, or newsletter, we may collect:</p>
            <ul className="space-y-2">
              {dataCollected.map((d) => (
                <li key={d.item} className="flex gap-3">
                  <span className="text-brand-ink font-medium mt-0.5 flex-shrink-0">•</span>
                  <span><strong className="text-ink">{d.item}.</strong> {d.detail}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section heading="Why we collect it">
            <p>
              We use your data to generate and send your diagnostic report, to respond to inquiries you
              send us, and — only if you opt in — to send occasional insights by email. We do not sell
              your data, and we do not share it for advertising.
            </p>
          </Section>

          <Section heading="Our lawful basis">
            <p>
              For the diagnostic and the newsletter, our basis is your <strong className="text-ink">consent</strong>,
              given when you submit your details. For contact inquiries, we process your data to take the
              steps you have asked us to take — namely, to respond to you. You can withdraw consent at
              any time using the contact details below.
            </p>
          </Section>

          <Section heading="Third parties who process your data">
            <p>We rely on a small number of trusted service providers to run this service:</p>
            <div className="space-y-2">
              {processors.map((p) => (
                <div key={p.name} className="bg-white border border-line rounded-lg p-4">
                  <p className="font-heading font-bold text-ink text-[length:var(--step-0)]">{p.name}</p>
                  <p className="text-[length:var(--step-0)] text-muted">{p.role}</p>
                  <p className="text-xs text-muted mt-1">{p.location}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section heading="Cross-border transfer">
            <p>
              Some service providers above process or store data outside the UAE. When an international
              transfer occurs, we use the provider and handle the transfer subject to applicable UAE
              data-protection requirements and the safeguards available for that service.
            </p>
          </Section>

          <Section heading="How long we keep it">
            <p>
              Incomplete diagnostic attempts are deleted after 30 days. Completed diagnostic records,
              contact inquiries, and historic lead records are deleted 24 months after submission.
              Active newsletter subscriptions are retained until you unsubscribe; unsubscribed records are
              deleted after 30 days. Expired admin sessions and temporary rate-limit records are also removed
              automatically. You may ask us to delete eligible personal data sooner.
            </p>
          </Section>

          <Section heading="Your rights under the PDPL">
            <p>Subject to the conditions and exceptions in applicable UAE law, you may have the right to:</p>
            <ul className="space-y-2">
              {rights.map((r) => (
                <li key={r} className="flex gap-3">
                  <span className="text-brand-ink font-medium mt-0.5 flex-shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section heading="How to exercise your rights">
            <p>
              To exercise any of these rights — including access, correction, or deletion — email us at{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-brand-ink underline hover:text-brand-ink transition-colors">
                {PRIVACY_EMAIL}
              </a>{' '}
              or use the{' '}
              <Link href="/contact" className="text-brand-ink underline hover:text-brand-ink transition-colors">
                contact form
              </Link>
              . If you subscribed to the newsletter, every email also contains a one-click unsubscribe link.
              We will respond within a reasonable time and in line with the PDPL.
            </p>
          </Section>

          <Section heading="Changes to this policy">
            <p>
              We may update this policy from time to time. When we do, we will revise the &ldquo;Last
              updated&rdquo; date at the top of this page.
            </p>
          </Section>

          </div>
          <ArticleToc items={toc} />
        </div>
      </section>
    </>
  );
}

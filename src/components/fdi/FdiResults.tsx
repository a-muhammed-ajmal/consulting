'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { track } from '@vercel/analytics';
import { Button } from '@/components/ui/Button';
import { CALENDLY_LINK, WHATSAPP_AUDIT_LINK } from '@/lib/env';
import type { FounderFdiReport } from '@/lib/fdi/public-report';
import { IndexScale } from '@/components/fdi/IndexScale';

/** Ambient radials. Decorative, and always inside a clipping parent. */
function Orbs() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="orb orb-electric absolute -right-32 -top-40 h-[28rem] w-[28rem]" />
      <div className="orb orb-amber absolute -bottom-40 -left-32 h-96 w-96" />
    </div>
  );
}

export function FdiResults() {
  const [report, setReport] = useState<FounderFdiReport | null | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = sessionStorage.getItem('fdiFounderReport');
        setReport(stored ? JSON.parse(stored) as FounderFdiReport : null);
      } catch {
        setReport(null);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (report === undefined) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas-light px-5">
        <Orbs />
        <p role="status" className="relative z-10 font-body text-[length:var(--step-0)] text-muted">
          Loading your result…
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas-light px-5">
        <Orbs />
        <section className="glass-panel relative z-10 max-w-lg rounded-2xl p-8">
          <h1 className="font-heading text-[length:var(--step-4)] font-extrabold text-ink">
            Your result is not available in this browser.
          </h1>
          <p className="mt-3 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
            Complete the Business Health Check again to view a new result.
          </p>
          <div className="mt-6">
            <Button href="/diagnostic">
              Start the Business Health Check
              {/* WEB §5 fixes the label including the arrow. The icon is decorative,
                  so the glyph is restated here for the accessible name only. */}
              <span className="sr-only"> →</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const concentration = report.concentration.labels.join(' and ');
  const alerts = report.alerts.flatMap((tier) =>
    tier.components.map((component) => component.label),
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas-light px-4 py-10 md:py-14">
      <Orbs />
      <section className="relative z-10 mx-auto max-w-4xl space-y-5">

        {/* The index itself, on the page's one glass panel. */}
        {/* The ONE surface on the site where IndexScale carries a reading. It is
            handed the UNROUNDED composite so its band resolves exactly as the
            engine's did - bands read the unrounded value (PRODUCT SSA6). */}
        <header className="glass-panel rounded-2xl p-7 md:p-10">
          <p className="eyebrow text-brand-ink">Founder Dependency Index</p>
          <h1 className="mt-3 font-heading text-[length:var(--step-5)] font-extrabold text-ink">
            {report.index.display}
            <span className="font-heading text-[length:var(--step-3)] text-muted"> / {report.index.scaleMax}</span>
          </h1>
          <p className="mt-2 font-heading text-[length:var(--step-1)] font-bold text-brand-ink">
            {report.index.band.label}
          </p>
          <div className="mt-6 max-w-xl">
            <IndexScale value={report.index.unrounded} display={report.index.display} />
          </div>
          <p className="mt-5 max-w-2xl font-body text-[length:var(--step-0)] leading-relaxed text-muted">
            This result describes self-reported operating patterns. It is not a diagnosis of root cause.
          </p>
        </header>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-1 md:p-8">
          <h2 className="font-heading text-[length:var(--step-3)] font-extrabold text-ink">Component scores</h2>
          {/* Three bars, one per component. Each is a value out of 100, never a
              percentage - the bar is a length, the figure beside it is the score. */}
          <dl className="mt-5 space-y-5">
            {report.components.map((component) => (
              <div key={component.key}>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-body text-[length:var(--step-0)] text-ink">{component.label}</dt>
                  <dd className="font-mono shrink-0 font-heading text-[length:var(--step-1)] font-extrabold text-ink">
                    {component.display}
                    <span className="font-body text-[length:var(--step--1)] font-medium text-muted"> / 100</span>
                  </dd>
                </div>
                <div className="mt-2 h-[10px] overflow-hidden rounded-full bg-canvas-light" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-[400ms] ease-out"
                    style={{ width: `${component.display}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
            Dependency appears most concentrated in <strong className="text-ink">{concentration}</strong>.
          </p>
          {alerts.length > 0 && (
            <p className="mt-3 rounded-xl border-l-4 border-accent bg-accent-soft px-4 py-3 font-body text-[length:var(--step-0)] leading-relaxed text-accent-ink">
              <strong>Severe component alert:</strong> {alerts.join(', ')}.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-1 md:p-8">
          <h2 className="font-heading text-[length:var(--step-3)] font-extrabold text-ink">
            What the answers indicate
          </h2>
          <ul className="mt-5 space-y-3">
            {report.observations.map((finding) => (
              <li
                key={finding}
                className="relative pl-5 font-body text-[length:var(--step-0)] leading-relaxed text-ink before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-brand before:content-['']"
              >
                {finding}
              </li>
            ))}
          </ul>
        </section>

        {/* The public conversion action uses the validated booking URL so completing
            the Check never loops a founder back to the start. */}
        <section className="relative overflow-hidden rounded-2xl bg-canvas-dark p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="orb orb-amber absolute -right-16 -top-24 h-64 w-64 opacity-25" />
          </div>
          <div className="relative z-10">
            {/* PRODUCT §A10 orders the limitation between the findings and the next
                step, and the report email does the same. It qualifies the result the
                founder just read, so it has to precede the offer, not trail it. */}
            <p className="mb-6 font-body text-xs italic leading-relaxed text-muted-invert">
              {report.limitation}
            </p>
            <h2 className="font-heading text-[length:var(--step-3)] font-extrabold text-white">
              Next step: Business Clarity Audit
            </h2>
            <p className="mt-3 max-w-2xl font-body text-[length:var(--step-0)] leading-relaxed text-muted-invert">
              A Business Clarity Audit tests these self-reported patterns against operating evidence — records, workflows, dashboards, decision samples, and SOPs — and identifies where closer investigation is useful.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                href={CALENDLY_LINK}
                external
                variant="accent"
                onClick={() => track('calendly_click', { from: 'fdi_results' })}
              >
                Discuss a Business Clarity Audit
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              {WHATSAPP_AUDIT_LINK && (
                <Button
                  href={WHATSAPP_AUDIT_LINK}
                  external
                  variant="secondary"
                  className="border-white/40 text-white hover:border-white hover:bg-white hover:text-ink"
                  onClick={() => track('whatsapp_click', { from: 'fdi_results' })}
                >
                  Message on WhatsApp
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

import Image from "next/image";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CTABand } from "@/components/ui/CTABand";
import { StageRail } from "@/components/ui/StageRail";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";
import { AUTHOR_HEADSHOT, pageMetadata } from "@/lib/metadata";
import { jsonLdScript, personAndServiceJsonLd } from "@/lib/jsonLd";

export const metadata = pageMetadata({
  title: "About Muhammed Ajmal | Business Operations & Growth Consultant",
  absoluteTitle: true,
  description: "Muhammed Ajmal is a Dubai-based Business Operations & Growth Consultant helping founder-led UAE SMEs build stronger systems, ownership, visibility, and execution.",
  path: "/about",
});

const credentials = [
  "Google AI Professional Certificate 2026 — Credential: SCSUP9BBKX10",
  "AI for Brainstorming and Planning — Google (2026)",
  "Business Development Foundations — LinkedIn (2024)",
  "Mastering Project Management — LinkedIn (2024)",
  "Basics of Business Consulting — Alison (2024)",
  "Advanced Diploma in Digital Marketing — Digimark Academy (2022)",
];

const principles = [
  ["Simple", "Use operating structures people can understand and apply."],
  ["Practical", "Prioritize changes that fit the reality of the business."],
  ["Sustainable", "Build systems the team can maintain after implementation."],
];

/* ANCHOR §5 — core capability. Each is common alone; the combination inside a
   live UAE SME is not. */
const howIWork = [
  { marker: "01", title: "Business management", body: "Judgment about strategy, people, money, operations." },
  { marker: "02", title: "Systems thinking", body: "The business as connected parts, not isolated problems." },
  { marker: "03", title: "Execution", body: "The engagement ends with a working system, not a document." },
  { marker: "04", title: "Applied AI", body: "Automation added after the process is understood." },
];

/* Governed boundary statements. Nothing here introduces a claim the practice
   has not already committed to. */
const boundaries = [
  {
    question: "Do you cover motivation and mindset?",
    answer: "No. The work is structural: systems, ownership, decision rights, visibility, and consistent execution.",
  },
  {
    question: "Can you just set up the AI automation?",
    answer: "Only after the process is defined. Applied AI is added once the underlying work is understood, so it improves capacity, speed, or visibility rather than automating a process that is not yet working.",
  },
  {
    question: "Does an engagement end with a report?",
    answer: "No. The engagement ends with a working system, not a document.",
  },
];

/** Descending stagger, so the three principles read as a step rather than a row.
 *  Collapses to a flat stack below `md`, where the columns no longer sit side by side. */
const PRINCIPLE_OFFSET = ["", "md:mt-8", "md:mt-16"];

/** The headshot, with the amber corner rule that marks it as the page's one portrait. */
function Headshot() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -left-3 -top-3 h-24 w-24 rounded-tl-3xl border-l-2 border-t-2 border-accent" aria-hidden="true" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-brand-tint shadow-3">
        <Image
          src={AUTHOR_HEADSHOT.src}
          alt={AUTHOR_HEADSHOT.alt}
          fill
          priority
          sizes="(min-width: 1024px) 32vw, 100vw"
          className="object-cover"
        />
        <div className="glass-panel absolute inset-x-4 bottom-4 rounded-2xl p-4">
          <p className="font-heading text-[length:var(--step-0)] font-bold text-ink">Muhammed Ajmal</p>
          <p className="mt-1 font-body text-xs text-brand-ink">Business Operations &amp; Growth Consultant</p>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(personAndServiceJsonLd()) }} />

      <PageHero
        eyebrow="About Muhammed Ajmal"
        title="Business Operations & Growth Consultant"
        lead="Dubai, United Arab Emirates. Helping founder-led UAE SMEs move important operating responsibility into clear roles, usable systems, and visible management information."
        actions={
          <Button href="/diagnostic">
            Start the Business Health Check
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
        aside={<Headshot />}
        signals={principles.map(([title, body]) => (
          <div key={title}>
            <h2 className="font-heading text-[length:var(--step-1)] font-bold text-ink">{title}</h2>
            <p className="mt-1 font-body text-[length:var(--step--1)] leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      />

      <Section tone="tint" width="wide" orbs>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-3">Approach</p>
            <h2 className="heading-reveal font-heading text-[length:var(--step-4)] font-extrabold leading-tight text-ink">
              Management knowledge, systems thinking, execution, and applied AI.
            </h2>
          </div>
          <div className="space-y-5 font-body text-[length:var(--step-0)] leading-relaxed text-muted lg:col-span-7">
            <p>Muhammed helps founder-led UAE SMEs move important operating responsibility into clear roles, usable systems, and visible management information.</p>
            <p>The work is grounded in business management, systems thinking, and practical execution. Applied AI is used as an enabling capability—where it improves capacity, speed, or visibility—not as a product in itself.</p>
            <p>The focus is to reduce founder dependency by improving decision speed, execution consistency, and operational visibility.</p>
          </div>
        </div>
      </Section>

      <Section width="default">
        <SectionHeader
          eyebrow="Delivery principle"
          title="Simple · Practical · Sustainable"
        />
        {/* Staggered offsets rather than three equal columns — the row of identical
            cards is the single strongest "template" signal on a page like this. */}
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {principles.map(([title, body], index) => (
            <li
              key={title}
              className={cn(
                "stage-reveal card-interactive rounded-2xl border border-line bg-white p-6 shadow-1",
                PRINCIPLE_OFFSET[index],
              )}
            >
              <span className="font-mono text-xs text-accent-ink">0{index + 1}</span>
              <h3 className="mt-4 font-heading text-[length:var(--step-1)] font-bold text-ink">{title}</h3>
              <p className="mt-3 font-body text-[length:var(--step-0)] leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="tint" width="narrow" orbs>
        <SectionHeader eyebrow="How I work" title="Four capabilities, applied in order." />
        <StageRail className="mt-12" stages={howIWork} />
      </Section>

      <Section tone="light" width="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-3">Professional credentials</p>
            <h2 className="heading-reveal font-heading text-[length:var(--step-4)] font-extrabold text-ink">
              Current learning and professional development
            </h2>
            <a
              href="https://www.linkedin.com/in/muhammed-ajmal-consultant/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-body text-[length:var(--step-0)] font-medium text-brand-ink underline transition-colors hover:text-brand"
            >
              View credential record
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <ul className="grid gap-3 lg:col-span-7">
            {credentials.map((credential) => (
              <li
                key={credential}
                className="stage-reveal flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3.5 font-body text-[length:var(--step-0)] leading-relaxed text-ink"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent" aria-hidden="true">
                  <Check className="h-3 w-3 text-canvas-dark" strokeWidth={3} />
                </span>
                {credential}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section width="narrow" divided>
        <SectionHeader eyebrow="Boundaries" title="What this work is, and what it is not." />
        <Accordion className="mt-10" items={boundaries.map(({ question, answer }) => ({ question, answer }))} />
      </Section>

      <CTABand
        eyebrow="Start with clarity"
        title="See where your business still depends on you."
        body="The Business Health Check is a free founder-dependency self-report returning your Founder Dependency Index."
        actions={
          <Button href="/diagnostic" variant="accent">
            Start the Business Health Check
            {/* WEB §5 fixes the label including the arrow. The icon is decorative,
                so the glyph is restated here for the accessible name only. */}
            <span className="sr-only"> →</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
      />
    </>
  );
}

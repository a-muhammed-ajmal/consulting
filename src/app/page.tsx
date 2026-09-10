import { ArrowRight, CircleCheck, Clock, Compass, Cpu, Eye, GitBranch, Repeat, Settings2, ShieldAlert, Users } from "lucide-react";
import { DependencyIndexPreview, FounderSystemVisual } from "@/components/home/SystemVisuals";
import { ArchitectureLadder, GrowthFormulaRail } from "@/components/home/Graphics";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CardGrid, CardGridItem } from "@/components/ui/CardGrid";
import { CTABand } from "@/components/ui/CTABand";
import { IconTile } from "@/components/ui/IconTile";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { StageRail } from "@/components/ui/StageRail";
import { Surface, SectionHeader } from "@/components/ui/Surface";
import { TrustMarquee } from "@/components/ui/TrustMarquee";
import { pageMetadata } from "@/lib/metadata";
import { jsonLdScript, personAndServiceJsonLd } from "@/lib/jsonLd";

export const metadata = pageMetadata({
  title: "Muhammed Ajmal Consulting | Business Operations & Growth Consultant — Dubai, UAE",
  absoluteTitle: true,
  ogTitle: "Build a business that grows beyond the founder | Muhammed Ajmal Consulting",
  description:
    "Business operations and growth consulting for founder-led UAE SMEs. Build systems, ownership, visibility, and consistent execution that reduce founder dependency.",
  path: "/",
});

/* ANCHOR §6. Four areas — not six. "Data" and "Accountability" are not operating
   scope areas; Accountability is a step in the Growth Formula (ANCHOR §10.3). */
const scopeAreas = [
  { title: "Strategy", body: "Direction, priorities, positioning, and growth choices.", Icon: Compass },
  { title: "Systems", body: "Processes, SOPs, management rhythm, KPIs, and structure.", Icon: Settings2 },
  { title: "People", body: "Roles, ownership, decision rights, accountability, and capability.", Icon: Users },
  { title: "Applied AI", body: "Automation and AI where they improve capacity, speed, or visibility.", Icon: Cpu },
];

/* ANCHOR §10.1 — the four observable symptoms, verbatim. */
const trapSymptoms = [
  { label: "Approval bottlenecks", detail: "Work waits for a founder decision.", Icon: Clock },
  { label: "Knowledge trapped in people", detail: "Critical know-how is not accessible.", Icon: GitBranch },
  { label: "Firefighting", detail: "Urgent issues replace planned work.", Icon: ShieldAlert },
  { label: "Inconsistent execution", detail: "Standards change by person or day.", Icon: Repeat },
];

/* ANCHOR §10.2 — the three components the index is built from. */
const indexComponents = [
  { title: "Decision Speed", body: "Do decisions and work continue when the founder is unavailable?", Icon: Clock },
  { title: "Execution Consistency", body: "Does recurring work reach a consistent standard without founder supervision?", Icon: Users },
  { title: "Operational Visibility", body: "Can the founder see what is happening without chasing updates?", Icon: Eye },
];

/* WEB §6 — the public commercial path, in order. */
const commercialPath = [
  { marker: "01", title: "Business Health Check", body: "A free founder-dependency self-report returning the Founder Dependency Index." },
  { marker: "02", title: "Business Clarity Audit", body: "An operating audit testing reported patterns against operating evidence." },
  { marker: "03", title: "Focused Improvement Sprint", body: "A tightly scoped improvement addressing the binding constraint." },
  { marker: "04", title: "Business System Build", body: "The broader operating-system build where evidence supports it." },
  { marker: "05", title: "Growth Partner Retainer", body: "Ongoing operating support once foundations are in place." },
];

const qualification = [
  "Founder-led",
  "United Arab Emirates",
  "AED 1,000,000 to AED 10,000,000 annual revenue",
  "5–50 employees",
  "3+ years operating",
  "Growth still depends heavily on the founder",
];

/* Every answer below is a governed boundary statement, not marketing FAQ.
   Sources: PRODUCT (the self-report boundary) and WEB §6 (the audit boundary). */
const boundaries = [
  {
    question: "Is the Business Health Check an audit?",
    answer:
      "This is a focused founder-dependency self-report, not a full financial, tax, legal, or business-performance audit. It shows where dependency appears; a Business Clarity Audit tests why, against operating evidence.",
  },
  {
    question: "Is the Business Clarity Audit a statutory audit?",
    answer:
      "The Business Clarity Audit is not a statutory, financial, tax, compliance, or legal audit. It examines operating evidence: records, workflows, dashboards, decision samples, SOPs, roles, and rework.",
  },
  {
    question: "What does the Founder Dependency Index tell me?",
    answer:
      "It shows where dependency appears. Only the Business Clarity Audit may claim to identify the binding constraint. A high index is the adverse result, and it is an index out of 100 — never a percentage.",
  },
];

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(personAndServiceJsonLd()) }} />

      <PageHero
        eyebrow="Business Operations & Growth Consultant · Dubai, UAE"
        spokeArc
        title={
          <>
            Build a business that <span className="brand-gradient-text">grows beyond the founder.</span>
          </>
        }
        lead="Muhammed Ajmal Consulting helps founder-led UAE SMEs build successful, scalable businesses by reducing founder dependency through stronger systems, clearer ownership, useful visibility, and consistent execution."
        actions={
          <>
            <Button href="/diagnostic" className="cta-shine">
              Start the Business Health Check
              {/* WEB §5 fixes the label including the arrow. The icon is decorative,
                  so the glyph is restated here for the accessible name only. */}
              <span className="sr-only"> →</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href="/services" variant="quiet">
              See How It Works
            </Button>
          </>
        }
        note="Free. Private. A focused founder-dependency self-report."
        aside={<FounderSystemVisual />}
        signals={indexComponents.map(({ title, body, Icon }) => (
          <div key={title}>
            <IconTile size="sm" className="mb-3">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </IconTile>
            <h2 className="font-heading text-[length:var(--step-1)] font-bold text-ink">{title}</h2>
            <p className="mt-1 font-body text-[length:var(--step--1)] leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      />

      <TrustMarquee items={trapSymptoms.map((symptom) => symptom.label)} />

      <Section tone="tint" width="wide" compact aria-label="Growth Formula">
        <GrowthFormulaRail />
      </Section>

      {/* ANCHOR §10.1. The Founder Trap is a pattern of observable dependency —
          not a judgment on the founder. */}
      <Section id="founder-trap" width="wide">
        <SectionHeader
          eyebrow="The Founder Trap"
          accent="danger"
          title="When growth still depends on one person."
          description="The pattern is visible in how decisions move, where knowledge sits, how the team responds to change, and whether work is done consistently."
        />
        <CardGrid className="mt-12" columns={4} scrollReveal>
          {trapSymptoms.map(({ label, detail, Icon }, index) => (
            <CardGridItem key={label} scrollReveal>
              <Surface
                interactive
                raised
                className="h-full"
                header={
                  <>
                    <IconTile variant="numeral" size="md" className="icon-tile-spring">
                      {String(index + 1).padStart(2, "0")}
                    </IconTile>
                    <h3 className="font-heading text-[length:var(--step-1)] font-bold text-ink">{label}</h3>
                  </>
                }
              >
                <p className="flex items-start gap-2.5 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.25} aria-hidden="true" />
                  {detail}
                </p>
              </Surface>
            </CardGridItem>
          ))}
        </CardGrid>
      </Section>

      <DependencyIndexPreview />

      <Section id="how-it-works" tone="tint" width="narrow" orbs>
        <SectionHeader
          eyebrow="How we work"
          title="One commercial journey. Each stage leads to the next."
          description="The right next step depends on what evidence shows—not on choosing from a menu of disconnected services."
        />
        <StageRail className="mt-12" stages={commercialPath} snap />
        <div className="mt-10">
          <Button href="/services" variant="secondary">
            See the full journey
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </Section>

      {/* Operating scope. An asymmetric 5/7 split with the four areas stacked as a
          divided list rather than four equal cards — the equal-card row is the
          strongest "template" signal on a marketing page. */}
      <Section width="wide" orbs>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-3">Operating scope</p>
            <h2 className="heading-reveal font-heading text-[length:var(--step-4)] font-extrabold text-ink">
              The areas of work that make an operating system work.
            </h2>
            <p className="mt-4 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
              These are areas of work, not another framework.
            </p>
          </div>
          <ul className="lg:col-span-7">
            {scopeAreas.map(({ title, body, Icon }, index) => (
              <li
                key={title}
                className="stage-reveal card-interactive mb-3 flex gap-4 rounded-2xl border border-line bg-white p-5 last:mb-0"
              >
                <IconTile size="lg">
                  <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-heading text-[length:var(--step-1)] font-bold text-ink">{title}</h3>
                    <span className="font-mono text-xs text-accent-ink">0{index + 1}</span>
                  </div>
                  <p className="mt-1.5 font-body text-[length:var(--step-0)] leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="light" width="default" divided>
        <SectionHeader
          eyebrow="Strategic Growth Architecture"
          title="A system that shifts responsibility out of the founder&rsquo;s head."
        />
        <div className="mt-12">
          <ArchitectureLadder />
        </div>
        <p className="mt-8 max-w-2xl font-body text-[length:var(--step-0)] leading-relaxed text-muted">
          The architecture is progressive: each layer gives the next one a stronger foundation.
        </p>
      </Section>

      <Section tone="dark" width="wide" orbs>
        <p className="eyebrow mb-3">The measurement</p>
        <h2 className="heading-reveal font-heading text-[length:var(--step-4)] font-extrabold text-white">
          Founder dependency, as a number you can act on.
        </h2>
        <p className="mt-4 max-w-xl font-body text-[length:var(--step-0)] leading-relaxed text-muted-invert">
          The Founder Dependency Index converts the pattern into an index out of 100 across three
          observable components. A high index is the adverse result.
        </p>
      </Section>

      <Section tone="light" width="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-3">Built for</p>
            <h2 className="heading-reveal font-heading text-[length:var(--step-4)] font-extrabold text-ink">
              Founder-led UAE SMEs ready to make operating changes.
            </h2>
            <p className="mt-4 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
              Primary sectors include trading and distribution, real estate and property services, and specialty contracting and technical services.
            </p>
          </div>
          <ul className="grid gap-3 rounded-2xl border border-line bg-white p-6 shadow-1 sm:grid-cols-2 lg:col-span-7">
            {qualification.map((item) => (
              <li
                key={item}
                className="stage-reveal flex items-start gap-2.5 font-body text-[length:var(--step-0)] text-ink"
              >
                <CircleCheck className="mt-px h-4 w-4 shrink-0 text-brand" strokeWidth={2.25} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section width="narrow" divided>
        <SectionHeader eyebrow="Boundaries" title="What this is, and what it is not." />
        <Accordion className="mt-10" items={boundaries.map(({ question, answer }) => ({ question, answer }))} />
      </Section>

      <CTABand
        eyebrow="Start with clarity"
        title="Find out where your business still depends on you."
        body="Start with a free Business Health Check and receive your Founder Dependency Index across decision speed, execution consistency, and operational visibility."
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

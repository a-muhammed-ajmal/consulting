'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Eye,
  LockKeyhole,
  Save,
  Settings2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { BrandLockup } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { FieldError, Input, Select } from '@/components/ui/Field';
import { Section } from '@/components/ui/Section';
import { Surface } from '@/components/ui/Surface';
import { CURRENT_FDI_QUESTION_SET } from '@/lib/fdi/config';
import type { FounderFdiReport } from '@/lib/fdi/public-report';
import { fdiBusinessDetailsSchema, fdiContactSchema } from '@/lib/fdi-server/validation';
import { cn } from '@/lib/utils';
import type { z } from 'zod';

type Stage = 'intro' | 'questions' | 'contact' | 'submitting';

/** Contact is required; the business details below it never block the result. */
const finalStepSchema = fdiContactSchema.extend(fdiBusinessDetailsSchema.shape).refine(
  (value) => value.sector !== 'other' || Boolean(value.sectorOther),
  { path: ['sectorOther'], message: 'Please describe your sector' },
);
/** Fields hold what a native select can produce ('' when untouched); the resolver hands us the cleaned values. */
type FinalStepFields = z.input<typeof finalStepSchema>;
type FinalStepValues = z.output<typeof finalStepSchema>;

const SECTOR_OPTIONS: readonly (readonly [string, string])[] = [
  ['real_estate_business_services', 'Real Estate & Business Services'],
  ['trading_distribution', 'Trading & Distribution'],
  ['construction_contracting', 'Construction & Contracting'],
  ['professional_services', 'Professional Services'],
  ['retail_ecommerce', 'Retail & E-commerce'],
  ['hospitality_fnb', 'Hospitality & F&B'],
  ['manufacturing', 'Manufacturing'],
  ['other', 'Other'],
];

const REVENUE_OPTIONS: readonly (readonly [string, string])[] = [
  ['under_1m', 'Under AED 1,000,000'],
  ['aed_1m_to_10m', 'AED 1,000,000–10,000,000'],
  ['over_10m', 'Over AED 10,000,000'],
];

const EMPLOYEE_OPTIONS: readonly (readonly [string, string])[] = [
  ['under_5', 'Under 5'],
  ['employees_5_to_50', '5–50'],
  ['over_50', 'Over 50'],
];

const OPERATING_YEAR_OPTIONS: readonly (readonly [string, string])[] = [
  ['under_3', 'Under 3 years'],
  ['years_3_or_more', '3 years or more'],
];

type Session = { readonly id: string; readonly token: string; readonly isTest: boolean };
type ApiResponse = { readonly success: boolean; readonly error?: string };
type StartResponse = ApiResponse & { readonly sessionId?: string; readonly sessionToken?: string; readonly isTest?: boolean };
type SubmitResponse = ApiResponse & { readonly report?: FounderFdiReport };

interface IndexComponent {
  readonly key: 'DS' | 'EC' | 'OV';
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

/* ANCHOR SS10.2 - the question each component answers. */
const INDEX_COMPONENTS: readonly IndexComponent[] = [
  {
    key: 'DS',
    label: 'Decision Speed',
    description: 'Can decisions continue without you?',
    icon: Zap,
  },
  {
    key: 'EC',
    label: 'Execution Consistency',
    description: 'Can recurring work maintain its standard?',
    icon: Settings2,
  },
  {
    key: 'OV',
    label: 'Operational Visibility',
    description: 'Can you see what is happening without chasing updates?',
    icon: BarChart3,
  },
];

const componentLabels: Record<string, string> = {
  DS: 'Decision Speed',
  EC: 'Execution Consistency',
  OV: 'Operational Visibility',
};

const componentIcons: Record<string, LucideIcon> = {
  DS: Zap,
  EC: Settings2,
  OV: BarChart3,
};

const INTRO_FACTS: readonly (readonly [string, string, LucideIcon])[] = [
  ['12 questions', 'Four questions across each operating component', ClipboardCheck],
  ['Progress saved', 'You can leave before completion; an unfinished attempt receives no score or email', Save],
  ['Self-report only', 'The result identifies reported patterns. It does not diagnose root causes', ShieldCheck],
];

/* The three objections the opening screen answers before asking anything: cost,
   time, and privacy. Owner-approved copy — see WEB SS8, Diagnostic. */
const HERO_ASSURANCES: readonly (readonly [string, string, LucideIcon])[] = [
  ['Free', 'No obligation', LockKeyhole],
  ['Takes 5 minutes', '12 focused questions', Clock],
  ['Private', 'Your information is confidential', ShieldCheck],
];

function completionMsFrom(startedAt: number | null): number | undefined {
  return startedAt === null ? undefined : Math.max(0, Date.now() - startedAt);
}

async function responseJson<T extends ApiResponse>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => ({ success: false, error: 'Unexpected server response.' }));
  if (!payload || typeof payload !== 'object' || !('success' in payload)) {
    return { success: false, error: 'Unexpected server response.' } as T;
  }
  return payload as T;
}

function DiagnosticHeader({ onExit }: { readonly onExit?: () => void }) {
  return (
    <header className="relative z-20 border-b border-line bg-white">
      <div className="flex min-h-16 items-center justify-between gap-3 px-5 py-3 md:px-8">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            aria-label="Exit the Business Health Check and return home"
            className="inline-flex min-h-11 items-center rounded-xl"
          >
            <BrandLockup className="h-8 sm:h-10 lg:h-8 xl:h-11" eager />
          </button>
        ) : (
          <Link href="/" aria-label="Muhammed Ajmal Consulting home" className="inline-flex min-h-11 items-center rounded-xl">
            <BrandLockup className="h-8 sm:h-10 lg:h-8 xl:h-11" eager />
          </Link>
        )}
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="tap-target inline-flex items-center justify-center rounded-xl px-3 font-body text-xs font-medium text-muted transition-colors duration-200 ease-out hover:bg-canvas-light hover:text-ink"
          >
            Exit
          </button>
        ) : (
          <p className="font-body text-xs font-medium text-muted">Free · Private · Focused</p>
        )}
      </div>
    </header>
  );
}

function IntroMechanism() {
  return (
    <Section id="check-covers" aria-label="How the Business Health Check works" tone="light" width="wide" compact className="py-10 md:py-16">
      <div className="grid gap-8 md:grid-cols-12 lg:gap-16">
        <header className="md:col-span-4">
          <p className="eyebrow text-brand-ink">What the check covers</p>
          <h2 className="mt-3 font-heading text-[length:var(--step-4)] font-extrabold leading-tight text-ink">
            Three operating signals. One focused result.
          </h2>
        </header>
        <ul className="divide-y divide-line md:col-span-8">
          {INDEX_COMPONENTS.map(({ key, label, description, icon: Icon }) => (
            <li key={key} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
              <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', key === 'EC' ? 'bg-accent text-ink' : 'bg-brand text-white')} aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-[length:var(--step-1)] font-bold leading-snug text-ink">{label}</h3>
                <p className="mt-1 font-body text-[length:var(--step-0)] leading-relaxed text-muted">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function IntroFacts() {
  return (
    <div className="grid gap-3 md:grid-cols-3 md:gap-5">
      {INTRO_FACTS.map(([title, body, Icon]) => (
        <Surface key={title} className="flex min-w-0 items-start gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand-ink" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-[length:var(--step-0)] font-bold leading-snug text-ink">{title}</h3>
            <p className="mt-1.5 font-body text-xs leading-relaxed text-muted">{body}</p>
          </div>
        </Surface>
      ))}
    </div>
  );
}

/**
 * The opening panel: the founder photograph, full bleed, under its pull-quote.
 *
 * The photograph is the LCP element on this route, so it carries `priority` and
 * goes through the Next optimizer. `object-cover` lets it crop to whatever height
 * the copy column sets, which is why the panel can stand full height beside the
 * copy without letterboxing.
 *
 * The quote sits on the sky. A white scrim under it keeps that text legible
 * whatever the crop exposes, rather than trusting one fixed region of the image.
 */
function IntroArtwork() {
  return (
    <figure className="relative isolate mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-line md:aspect-auto md:h-full md:min-h-[22rem] md:max-w-none">
      <Image
        src="/images/diagnostic/founder-skyline.jpg"
        alt="A founder in a suit looking out over the Dubai skyline"
        width={1200}
        height={1500}
        sizes="(min-width: 1280px) 500px, (min-width: 1024px) 320px, (min-width: 768px) 512px, 100vw"
        priority
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/85 via-white/45 to-transparent" aria-hidden="true" />
      <figcaption className="relative ml-auto max-w-[13rem] p-5 text-right font-heading text-[length:var(--step-0)] font-semibold italic leading-snug text-ink md:max-w-[15rem] md:p-6 md:text-[length:var(--step-3)]">
        A stronger business. A freer founder.
      </figcaption>
    </figure>
  );
}

/**
 * The three objections answered before the founder commits: cost, time, privacy.
 *
 * Three-up from 420px, which is where the columns stop crushing the sub-lines;
 * stacked below that so the 320px overflow check holds.
 */
function IntroAssurances() {
  return (
    <ul className="mx-auto mt-6 grid max-w-4xl gap-4 border-t border-line pt-5 min-[420px]:grid-cols-3 md:mt-8 md:gap-6 md:pt-6">
      {HERO_ASSURANCES.map(([title, note, Icon]) => (
        <li key={title} className="flex min-w-0 items-center gap-3 min-[420px]:justify-center">
          <Icon className="h-6 w-6 shrink-0 text-brand-ink" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-heading text-[length:var(--step-0)] font-bold leading-snug text-ink">{title}</p>
            <p className="mt-0.5 font-body text-xs leading-snug text-muted">{note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PreparingResult() {
  return (
    <section className="px-5 py-10 text-center md:px-8 md:py-14" aria-labelledby="preparing-title" aria-busy="true">
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-brand-tint" aria-hidden="true">
        <ClipboardCheck className="h-20 w-20 text-brand" strokeWidth={1.25} />
        <span className="absolute right-1 top-3 h-3 w-3 rotate-12 rounded-sm bg-accent" />
        <span className="absolute -left-2 top-12 h-2 w-2 -rotate-12 rounded-sm bg-brand" />
        <span className="absolute bottom-1 right-5 h-2 w-2 rotate-45 bg-accent" />
      </div>
      <h1 id="preparing-title" className="mt-6 font-heading text-[length:var(--step-4)] font-extrabold text-ink">Preparing your result…</h1>
      <p role="status" className="mx-auto mt-3 max-w-sm font-body text-[length:var(--step-0)] leading-relaxed text-muted">
        Your 12 answers are complete. Your Founder Dependency Index will appear here next.
      </p>
      <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-brand-tint px-4 py-4 text-left">
        {['Your index and what it means', 'Reported operating patterns', 'Component findings', 'Recommended next step'].map((item) => (
          <p key={item} className="flex items-center gap-3 py-2 font-body text-[length:var(--step-0)] text-ink">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-ink" aria-hidden="true" />
            {item}
          </p>
        ))}
      </div>
      <p className="mt-6 font-body text-xs text-muted">Please keep this page open while your result is prepared.</p>
    </section>
  );
}

export function FdiDiagnosticFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('intro');
  const [session, setSession] = useState<Session | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  /* The queued auto-advance, and the position it was queued from. Both are
     refs: the timer has to read where the founder is when it fires, not where
     they were when the option was tapped. */
  const advanceTimer = useRef<number | null>(null);
  const positionRef = useRef(0);
  /* Only the most recent selection may move the screen. Anything older — a
     save still in flight from a question already left behind — is spent. */
  const answerSeq = useRef(0);
  const question = CURRENT_FDI_QUESTION_SET.questions[currentQuestion];

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  /* Every move through the questions goes through here, so a queued advance
     can never land on top of one the founder made themselves. */
  const goTo = useCallback((index: number) => {
    cancelAdvance();
    answerSeq.current += 1;
    const total = CURRENT_FDI_QUESTION_SET.questions.length;
    if (index >= total) {
      positionRef.current = total - 1;
      setStage('contact');
      return;
    }
    const next = Math.max(0, index);
    positionRef.current = next;
    setCurrentQuestion(next);
  }, [cancelAdvance]);

  useEffect(() => cancelAdvance, [cancelAdvance]);

  const finalForm = useForm<FinalStepFields, unknown, FinalStepValues>({
    resolver: zodResolver(finalStepSchema),
    mode: 'onTouched',
  });
  /** Only the 'other' sector needs a free-text box. useWatch keeps this compiler-safe. */
  const sector = useWatch({ control: finalForm.control, name: 'sector' });

  const saveProgress = async (payload: Record<string, unknown>) => {
    if (!session) throw new Error('The diagnostic session is missing. Start again to continue.');
    const response = await fetch(`/api/fdi/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: session.token, completionMs: completionMsFrom(startedAt), ...payload }),
    });
    const data = await responseJson<ApiResponse>(response);
    if (!response.ok || !data.success) throw new Error(data.error ?? 'Unable to save progress.');
  };

  const start = async () => {
    setIsWorking(true);
    setError(null);
    try {
      const response = await fetch('/api/fdi/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testMode: new URLSearchParams(window.location.search).get('testMode') === 'true' }),
      });
      const data = await responseJson<StartResponse>(response);
      if (!response.ok || !data.success || !data.sessionId || !data.sessionToken) {
        throw new Error(data.error ?? 'Unable to start the diagnostic.');
      }
      setSession({ id: data.sessionId, token: data.sessionToken, isTest: Boolean(data.isTest) });
      setStartedAt(Date.now());
      setStage('questions');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to start the diagnostic.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleAnswer = async (questionId: string, optionId: string) => {
    /* One question per screen, auto-advancing 450ms after a selection so the
       choice is visibly registered before the screen changes. Back stays
       available throughout. A save failure cancels the advance — the founder
       must see the error rather than be carried past it.

       The advance belongs to the question that was answered. Changing your
       mind, a double tap, a slow save, or tapping Next during the pause each
       used to leave a second timer running, and the extra tick carried the
       founder past the following question with nothing recorded for it.
       Cancelling on the way in, and re-checking the position when the timer
       fires, keeps one selection to exactly one move. */
    const answeredAt = positionRef.current;
    const seq = (answerSeq.current += 1);
    const isCurrent = () => seq === answerSeq.current && positionRef.current === answeredAt;
    cancelAdvance();
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setError(null);
    try {
      await saveProgress({ answers: { [questionId]: optionId } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save that answer. Please try again.');
      return;
    }
    if (!isCurrent()) return;
    cancelAdvance();
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      if (!isCurrent()) return;
      goTo(answeredAt + 1);
    }, 450);
  };

  /* Leaving discards an unfinished attempt, which receives no score and no
     email. That is worth one confirmation. */
  const exitCheck = () => {
    const answered = Object.keys(answers).length;
    if (answered === 0 || window.confirm('Leave the Business Health Check? An unfinished attempt receives no score or email.')) {
      router.push('/');
    }
  };

  const submit = finalForm.handleSubmit(async (values) => {
    if (!session) return;
    const { name, email, companyName, phone, ...businessDetails } = values;
    setStage('submitting');
    setIsWorking(true);
    setError(null);
    try {
      const response = await fetch('/api/fdi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          sessionToken: session.token,
          contact: { name, email, companyName, phone },
          businessDetails,
          completionMs: completionMsFrom(startedAt),
        }),
      });
      const data = await responseJson<SubmitResponse>(response);
      if (!response.ok || !data.success || !data.report) {
        throw new Error(data.error ?? 'Unable to complete the diagnostic.');
      }
      sessionStorage.setItem('fdiFounderReport', JSON.stringify(data.report));
      router.push('/results');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to complete the diagnostic.');
      setStage('contact');
    } finally {
      setIsWorking(false);
    }
  });

  if (stage === 'intro') {
    // This scrollable landing page is independent of the approved tool screens.
    const startFromIntro = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      void start();
    };

    return (
      <div id="diagnostic-landing" className="min-h-svh bg-white">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-6 py-3">
            <Link href="/" aria-label="Muhammed Ajmal Consulting home" className="inline-flex min-h-11 items-center rounded-xl">
              <BrandLockup className="h-8 sm:h-10 lg:h-8 xl:h-11" eager />
            </Link>
            <div className="flex items-center gap-6">
              <p className="hidden font-body text-xs font-medium text-muted md:block">Free · Private · Focused</p>
              <a href="#about-the-check" className="inline-flex min-h-11 items-center rounded-xl font-body text-xs font-medium text-brand-ink underline underline-offset-4 transition-colors duration-200 hover:text-brand">
                About this check
              </a>
            </div>
          </div>
        </header>

        {/* One screen, not two. Below lg the blocks stack in reading order; from lg
            the copy, the mechanism, and the action share an 8-of-12 column with the
            artwork standing full height beside them. */}
        <Section
          aria-label="Business Health Check introduction"
          width="wide"
          className="bg-gradient-to-b from-electric-50 to-white py-6 md:py-9"
        >
          {/* Three blocks in one grid. Stacked, they read copy -> artwork -> action.
              From md, explicit row and column placement keeps that order while the
              artwork stands beside both text blocks. */}
          <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12">
            <div className="min-w-0 md:col-span-7 md:col-start-1 md:row-start-1 md:self-end">
              <p className="eyebrow text-brand-ink">Business Health Check</p>
              <h1 id="diagnostic-intro-title" className="mt-3 max-w-xl font-heading text-[length:var(--step-5)] font-extrabold leading-tight text-ink md:text-[length:var(--step-4)] lg:text-[length:var(--step-5)]">
                How much does your business still <span className="brand-gradient-text">depend on you?</span>
              </h1>
              <p className="mt-4 max-w-lg font-body text-[length:var(--step-0)] leading-relaxed text-muted">
                A free check of how much day-to-day operations still rely on you.
              </p>
              {error && (
                <p role="alert" aria-live="assertive" className="mt-4 font-body text-[length:var(--step-0)] text-danger">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-6 min-w-0 md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:mt-0">
              <IntroArtwork />
            </div>

            <div className="mt-7 flex flex-col items-center gap-2 md:col-span-7 md:col-start-1 md:row-start-2 md:mt-0 md:items-start">
              <Button onClick={startFromIntro} disabled={isWorking} className="cta-shine min-h-[52px] w-full px-3 sm:w-auto sm:min-w-[22rem] sm:px-8">
                {isWorking ? 'Starting…' : 'Start the Business Health Check →'}
              </Button>
              <a href="#check-covers" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-body text-xs font-medium text-muted transition-colors duration-200 hover:text-brand-ink">
                See what the check covers
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <IntroAssurances />
        </Section>

        <IntroMechanism />

        <Section id="about-the-check" aria-label="Before you start" width="wide" compact className="py-10 md:py-12">
          <h2 className="font-heading text-[length:var(--step-3)] font-extrabold text-ink">Before you start</h2>
          <div className="mt-5">
            <IntroFacts />
          </div>
          <div className="mt-6 flex flex-col gap-3 border-l-4 border-accent pl-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <p className="max-w-3xl font-body text-xs leading-relaxed text-muted">
              This is a focused founder-dependency self-report, not a full financial, tax, legal, or business-performance audit.
            </p>
            <a href="/privacy" className="inline-flex min-h-11 shrink-0 items-center self-start rounded-xl font-body text-xs font-medium text-brand-ink underline underline-offset-4 transition-colors duration-200 hover:text-brand sm:min-h-0">
              Privacy Policy
            </a>
          </div>
        </Section>

        <Section aria-label="Your Business Health Check result" tone="dark" width="wide" compact className="py-10 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-12 lg:gap-16">
            <div className="min-w-0 md:col-span-7">
              <p className="eyebrow">Your result</p>
              <h2 className="mt-3 max-w-lg font-heading text-[length:var(--step-4)] font-extrabold leading-tight text-white">
                A clearer view of founder dependency.
              </h2>
              <p className="mt-3 max-w-lg font-body text-[length:var(--step-0)] leading-relaxed text-muted-invert">
                Your completed answers show reported operating patterns and where to look more closely.
              </p>
              <Button onClick={startFromIntro} disabled={isWorking} className="mt-6 min-h-[52px] w-full px-4 sm:w-auto sm:px-5">
                {isWorking ? 'Starting…' : 'Start the Business Health Check →'}
              </Button>
            </div>
            <ul className="space-y-5 md:col-span-5">
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white" aria-hidden="true">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-[length:var(--step-1)] font-bold text-white">Founder Dependency Index</h3>
                  <p className="mt-1 font-body text-[length:var(--step-0)] leading-relaxed text-muted-invert">Reported dependency, out of 100</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white" aria-hidden="true">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-[length:var(--step-1)] font-bold text-white">Component findings</h3>
                  <p className="mt-1 font-body text-[length:var(--step-0)] leading-relaxed text-muted-invert">Decision Speed, Execution Consistency and Operational Visibility.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white" aria-hidden="true">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-[length:var(--step-1)] font-bold text-white">Clear next step</h3>
                  <p className="mt-1 font-body text-[length:var(--step-0)] leading-relaxed text-muted-invert">Where to look more closely.</p>
                </div>
              </li>
            </ul>
          </div>
        </Section>
      </div>
    );
  }

  if (stage === 'submitting') {
    return (
      <div className="min-h-svh bg-canvas-light md:px-6 md:py-8">
        <div className="mx-auto min-h-svh max-w-2xl overflow-hidden bg-white md:min-h-0 md:rounded-2xl md:border md:border-line md:shadow-2">
          <DiagnosticHeader onExit={exitCheck} />
          <PreparingResult />
        </div>
      </div>
    );
  }

  if (stage === 'contact') {
    const errors = finalForm.formState.errors;
    const fieldLabelClass = 'block font-heading text-[length:var(--step--1)] font-semibold text-ink';
    return (
      <div className="min-h-svh bg-canvas-light md:px-6 md:py-8">
        <div className="mx-auto min-h-svh max-w-2xl overflow-hidden bg-white md:min-h-0 md:rounded-2xl md:border md:border-line md:shadow-2">
          <DiagnosticHeader onExit={exitCheck} />
          <section className="px-5 py-5 md:px-8 md:py-6" aria-labelledby="contact-title">
            <div className="mx-auto max-w-xl">
              <header className="mx-auto max-w-xl text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brand bg-brand-soft text-brand-ink" aria-hidden="true">
                  <Check className="h-6 w-6" strokeWidth={3} />
                </span>
                <p className="eyebrow mt-3 text-brand-ink">Your result is ready</p>
                <h1 id="contact-title" className="mt-2 font-heading text-[length:var(--step-4)] font-extrabold text-ink">
                  Your 12 answers are complete.
                </h1>
                <p className="mt-2 font-body text-[length:var(--step-0)] leading-relaxed text-muted">
                  Add your details to see your Founder Dependency Index.
                </p>
              </header>

              <form onSubmit={submit} className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="sr-only">Where should we send it?</h2>
                  </div>
                  <p className="font-body text-xs font-medium text-muted">All four fields are required</p>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <label className={fieldLabelClass} htmlFor="fdi-name">Your name</label>
                      <span className="text-danger" aria-hidden="true">*</span>
                    </div>
                    <Input
                      id="fdi-name"
                      className="min-h-12 py-2.5"
                      autoComplete="name"
                      aria-required="true"
                      aria-describedby={errors.name ? 'fdi-name-error' : undefined}
                      invalid={Boolean(errors.name)}
                      {...finalForm.register('name')}
                    />
                    <FieldError id="fdi-name-error" message={errors.name?.message} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <label className={fieldLabelClass} htmlFor="fdi-company">Company name</label>
                      <span className="text-danger" aria-hidden="true">*</span>
                    </div>
                    <Input
                      id="fdi-company"
                      className="min-h-12 py-2.5"
                      autoComplete="organization"
                      aria-required="true"
                      aria-describedby={errors.companyName ? 'fdi-company-error' : undefined}
                      invalid={Boolean(errors.companyName)}
                      {...finalForm.register('companyName')}
                    />
                    <FieldError id="fdi-company-error" message={errors.companyName?.message} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <label className={fieldLabelClass} htmlFor="fdi-email">Email address</label>
                      <span className="text-danger" aria-hidden="true">*</span>
                    </div>
                    <Input
                      id="fdi-email"
                      type="email"
                      inputMode="email"
                      className="min-h-12 py-2.5"
                      autoComplete="email"
                      aria-required="true"
                      aria-describedby={errors.email ? 'fdi-email-error' : undefined}
                      invalid={Boolean(errors.email)}
                      {...finalForm.register('email')}
                    />
                    <FieldError id="fdi-email-error" message={errors.email?.message} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <label className={fieldLabelClass} htmlFor="fdi-phone">Mobile number</label>
                      <span className="text-danger" aria-hidden="true">*</span>
                    </div>
                    <Input
                      id="fdi-phone"
                      type="tel"
                      inputMode="tel"
                      className="min-h-12 py-2.5"
                      autoComplete="tel"
                      aria-required="true"
                      aria-describedby={errors.phone ? 'fdi-phone-error' : undefined}
                      invalid={Boolean(errors.phone)}
                      {...finalForm.register('phone')}
                    />
                    <FieldError id="fdi-phone-error" message={errors.phone?.message} />
                  </div>
                </div>

                <div className="mt-4 border-t border-line pt-2">
                  <button
                    type="button"
                    onClick={() => setDetailsOpen((open) => !open)}
                    aria-expanded={detailsOpen}
                    aria-controls="fdi-business-details"
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-2 text-left font-heading text-[length:var(--step-0)] font-semibold text-ink transition-colors duration-200 ease-out hover:bg-canvas-light hover:text-brand-ink"
                  >
                    <span>Add business details <span className="font-normal text-muted">— optional</span></span>
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-brand-ink transition-transform duration-200', detailsOpen && 'rotate-180')} aria-hidden="true" />
                  </button>
                  <div id="fdi-business-details" hidden={!detailsOpen} className="px-2 pb-2 pt-3">
                    <p className="font-body text-xs leading-snug text-muted">
                      Skip these if you prefer. They help us tailor any follow-up and never change your result.
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className={cn(fieldLabelClass, 'mb-1')} htmlFor="fdi-sector">Sector</label>
                        <Select id="fdi-sector" {...finalForm.register('sector', { setValueAs: (value) => value === '' ? undefined : value })}>
                          <option value="">Select…</option>
                          {SECTOR_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </Select>
                      </div>
                      <div>
                        <label className={cn(fieldLabelClass, 'mb-1')} htmlFor="fdi-employees">Number of employees</label>
                        <Select id="fdi-employees" {...finalForm.register('employeeCount', { setValueAs: (value) => value === '' ? undefined : value })}>
                          <option value="">Select…</option>
                          {EMPLOYEE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </Select>
                      </div>
                      <div>
                        <label className={cn(fieldLabelClass, 'mb-1')} htmlFor="fdi-revenue">Annual revenue</label>
                        <Select id="fdi-revenue" {...finalForm.register('annualRevenue', { setValueAs: (value) => value === '' ? undefined : value })}>
                          <option value="">Select…</option>
                          {REVENUE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </Select>
                      </div>
                      <div>
                        <label className={cn(fieldLabelClass, 'mb-1')} htmlFor="fdi-years">Years operating</label>
                        <Select id="fdi-years" {...finalForm.register('operatingYears', { setValueAs: (value) => value === '' ? undefined : value })}>
                          <option value="">Select…</option>
                          {OPERATING_YEAR_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </Select>
                      </div>
                      {sector === 'other' && (
                        <div className="md:col-span-2">
                          <label className={cn(fieldLabelClass, 'mb-1')} htmlFor="fdi-sector-other">Type your sector</label>
                          <Input
                            id="fdi-sector-other"
                            aria-describedby={errors.sectorOther ? 'fdi-sector-other-error' : undefined}
                            invalid={Boolean(errors.sectorOther)}
                            {...finalForm.register('sectorOther')}
                          />
                          <FieldError id="fdi-sector-other-error" message={errors.sectorOther?.message} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <p role="alert" aria-live="assertive" className="mt-4 font-body text-[length:var(--step-0)] text-danger">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={isWorking} fullWidth className="mt-5 min-h-12">
                  View my Founder Dependency Index →
                </Button>
                <p className="mt-3 text-center font-body text-xs leading-snug text-muted">
                  <LockKeyhole className="mr-1 inline h-4 w-4 text-brand-ink" aria-hidden="true" />
                  By continuing, you agree to our <a href="/privacy" className="font-medium text-brand-ink underline underline-offset-4">Privacy Policy</a>.
                  {session?.isTest && <span className="text-brand-ink"> Marked as a test record.</span>}
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const isLast = currentQuestion === CURRENT_FDI_QUESTION_SET.questions.length - 1;
  const selected = answers[question.id];
  const progress = Math.round(((currentQuestion + 1) / CURRENT_FDI_QUESTION_SET.questions.length) * 100);
  const ComponentIcon = componentIcons[question.componentKey] ?? Eye;

  /* Each flow state is its own responsive tool screen, never a storyboard grid. */
  return (
    <div className="min-h-svh bg-canvas-light md:px-6 md:py-8">
      <div className="mx-auto min-h-svh max-w-2xl overflow-hidden bg-white md:min-h-0 md:rounded-2xl md:border md:border-line md:shadow-2">
      <DiagnosticHeader onExit={exitCheck} />
      <section className="px-5 py-5 md:px-8 md:py-6" aria-labelledby="question-title">
        <div
          className="mb-4"
          role="progressbar"
          aria-label="Business Health Check progress"
          aria-valuemin={1}
          aria-valuemax={CURRENT_FDI_QUESTION_SET.questions.length}
          aria-valuenow={currentQuestion + 1}
          aria-valuetext={`Question ${currentQuestion + 1} of ${CURRENT_FDI_QUESTION_SET.questions.length}`}
        >
          <div className="mb-2 flex items-center justify-between gap-4 font-body text-xs font-medium text-muted">
            <span>Business Health Check</span>
            <span className="font-mono">Question {currentQuestion + 1} of 12</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric-700 to-electric-500 transition-[width] duration-[400ms] ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-3 rounded-xl bg-brand-tint px-3 py-3 text-brand-ink">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white" aria-hidden="true"><ComponentIcon className="h-5 w-5" /></span>
            <div>
              <strong className="block font-heading text-[length:var(--step-0)] font-bold text-ink">{componentLabels[question.componentKey]}</strong>
              <p className="mt-0.5 font-body text-xs leading-snug text-muted">{INDEX_COMPONENTS.find((component) => component.key === question.componentKey)?.description}</p>
            </div>
          </div>

          <h1 id="question-title" className="mt-5 font-heading text-[length:var(--step-4)] font-extrabold leading-tight md:text-[length:var(--step-3)] text-ink">
            {question.text}
          </h1>

          <div className="mt-5 space-y-2.5">
            {question.options.map((option) => {
              const isSelected = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => void handleAnswer(question.id, option.id)}
                  className={cn(
                    'group flex min-h-12 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-body text-[length:var(--step-0)] leading-snug transition-all duration-200 ease-out',
                    isSelected
                      ? 'border-brand bg-brand-tint font-medium text-ink shadow-1'
                      : 'border-line bg-white text-ink hover:-translate-y-0.5 hover:border-brand hover:shadow-1',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
                      isSelected ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white group-hover:border-brand',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <p role="alert" aria-live="assertive" className="mt-4 rounded-xl border border-danger bg-danger-soft px-4 py-3 font-body text-[length:var(--step-0)] text-danger">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
            {currentQuestion > 0 ? (
              <Button variant="quiet" onClick={() => goTo(currentQuestion - 1)} className="min-h-12 flex-1 sm:flex-none">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            ) : <span />}
            {/* Auto-advance carries a selected answer forward; this stays as the
                explicit path for anyone who prefers it, and for reduced-motion
                users who may not notice the transition. */}
            <Button disabled={!selected} onClick={() => goTo(currentQuestion + 1)} className="min-h-12 flex-1 sm:flex-none">
              {isLast ? 'Continue' : 'Next'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

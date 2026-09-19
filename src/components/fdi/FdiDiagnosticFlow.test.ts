import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('FDI-1.1 intro requirements', () => {
  const source = readFileSync(join(process.cwd(), 'src', 'components', 'fdi', 'FdiDiagnosticFlow.tsx'), 'utf8');

  it('uses the active question set and approved intro content', () => {
    expect(source).toContain('CURRENT_FDI_QUESTION_SET');
    expect(source).toContain('A free check of how much day-to-day operations still rely on you.');
    expect(source).toContain('This is a focused founder-dependency self-report, not a full financial, tax, legal, or business-performance audit.');
    expect(source).toContain('href="/privacy"');
    expect(source).toContain("value.sector !== 'other' || Boolean(value.sectorOther)");
  });

  it('uses the focused visual mechanism without a fabricated intro score', () => {
    expect(source).toContain('aria-label="How the Business Health Check works"');
    expect(source).toContain('Three operating signals. One focused result.');
    expect(source).toContain('Reported dependency, out of 100');
    expect(source).toContain('Clear next step');
    expect(source).not.toContain('IndexScale');
    expect(source).not.toContain('IndexBandList');
  });

  it('uses the founder artwork as a supporting illustration, not a cropped infographic', () => {
    expect(source).toContain('src="/images/diagnostic/founder-operations.png"');
    expect(source).toContain('sizes="(min-width: 1024px) 480px, (min-width: 768px) 360px, 100vw"');
    expect(source).toContain('width={1536}');
    expect(source).toContain('height={1024}');
    expect(source).toContain('className="h-full w-full object-contain"');
    /* The LCP element on this route. `priority` preloads it, and the optimizer
       has to stay on: the source PNG is 1.5 MB, which `unoptimized` would ship
       whole to every phone. */
    expect(source).toContain('priority');
    expect(source).not.toContain('unoptimized');
    expect(source).not.toContain('grid-cols-[64px_24px_minmax(0,1fr)]');
    expect(source).not.toContain('grid items-stretch');
    expect(source).not.toContain('function FlowConnector');
    const artwork = readFileSync(join(process.cwd(), 'public', 'images', 'diagnostic', 'founder-operations.png'));
    expect(artwork.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(artwork.readUInt32BE(16)).toBeGreaterThan(0);
    expect(artwork.readUInt32BE(20)).toBeGreaterThan(0);
    expect(artwork[25]).toBe(6); // RGBA: preserve the extracted artwork's transparency.
  });

  it('opens with the mechanism, the owner-approved assurances, and no invented reading', () => {
    const intro = source.slice(source.indexOf("  if (stage === 'intro')"), source.indexOf("  if (stage === 'submitting')"));
    expect(intro).toContain('<IntroSignalFlow />');
    expect(intro).toContain('<IntroAssurances />');
    /* Owner-approved hero copy. Recorded against WEB SS8 so a later pass does not
       read these as unsupported claims and strip them. */
    expect(source).toContain('A stronger business. A freer founder.');
    expect(source).toContain("['Free', 'No obligation', LockKeyhole]");
    expect(source).toContain("['Takes 5 minutes', '12 focused questions', Clock]");
    expect(source).toContain("['Private', 'Your information is confidential', ShieldCheck]");
    /* The index card names the result and shows a glyph. A number, a band, or a
       filled meter here would be an invented reading. */
    expect(source).toContain('Your Founder Dependency Index');
    expect(intro).not.toMatch(/\d+\s*\/\s*100/);
    expect(intro).not.toContain('%');
    expect(intro).not.toMatch(/(Low|Moderate|High|Very High) Founder Dependency/);
  });

  it('abbreviates the three signals in the hero without restating their labels', () => {
    expect(source).toContain("short: 'Can decisions continue?'");
    expect(source).toContain("short: 'Can work maintain its standard?'");
    expect(source).toContain(`short: "Can you see what's happening?"`);
    /* The hero reads the same constant the fuller section below it does, so the
       three labels cannot drift apart. */
    expect(source.match(/const INDEX_COMPONENTS/g)).toHaveLength(1);
  });

  it('makes only the intro a scrollable landing page with native sections and readable facts', () => {
    const intro = source.slice(source.indexOf("  if (stage === 'intro')"), source.indexOf("  if (stage === 'submitting')"));
    expect(intro).toContain('id="diagnostic-landing"');
    expect(intro).toContain('<IntroArtwork />');
    expect(intro).toContain('<IntroMechanism />');
    expect(intro).toContain('<IntroFacts />');
    expect(intro).toContain('href="#check-covers"');
    expect(intro).toContain('id="about-the-check"');
    expect(intro).toContain('tone="dark"');
    expect(intro).not.toContain('max-w-5xl');
    expect(intro).not.toContain('<DiagnosticHeader');
    expect(source).toContain('grid gap-3 md:grid-cols-3 md:gap-5');
    expect(intro.match(/<h1\b/g)).toHaveLength(1);
    expect(intro.match(/Start the Business Health Check →/g)).toHaveLength(2);
  });

  it('takes either intro start button back to the top before starting the existing flow', () => {
    const intro = source.slice(source.indexOf("  if (stage === 'intro')"), source.indexOf("  if (stage === 'submitting')"));
    expect(intro).toContain("window.scrollTo({ top: 0, behavior: 'instant' });\n      void start();");
    expect(intro.match(/onClick=\{startFromIntro\}/g)).toHaveLength(2);
    expect(intro.match(/disabled=\{isWorking\}/g)).toHaveLength(2);
  });

  it('renders submission as a separate state without delaying or gating the results handoff', () => {
    expect(source).toContain("if (stage === 'submitting')");
    expect(source).toContain('<PreparingResult />');
    expect(source).toContain("if (stage === 'contact')");
    expect(source).not.toContain("stage === 'contact' || stage === 'submitting'");
    expect(source).toContain("sessionStorage.setItem('fdiFounderReport', JSON.stringify(data.report));\n      router.push('/results');");
  });

  it('makes the completed-answer transition and required contact fields explicit', () => {
    expect(source).toContain('Your 12 answers are complete.');
    expect(source).toContain('Add your details to see your Founder Dependency Index.');
    expect(source.match(/aria-required="true"/g)).toHaveLength(4);
    expect(source).toContain('Add business details');
    expect(source).toContain('— optional');
  });

  it('routes branded in-flow exits through the unfinished-attempt confirmation', () => {
    expect(source).toContain('aria-label="Exit the Business Health Check and return home"');
    expect(source).toContain("window.confirm('Leave the Business Health Check? An unfinished attempt receives no score or email.')");
  });

  it('takes a completed check directly to the canonical result route', () => {
    expect(source).toContain("router.push('/results')");
    expect(source).not.toContain("router.push('/results/fdi')");
  });
});

/* A second queued timer used to advance twice from one selection, carrying the
   founder past the following question with no answer recorded for it. */
describe('one selection moves the screen exactly once', () => {
  const source = readFileSync(join(process.cwd(), 'src', 'components', 'fdi', 'FdiDiagnosticFlow.tsx'), 'utf8');

  it('keeps at most one auto-advance queued and clears it on unmount', () => {
    expect(source).toContain('window.clearTimeout(advanceTimer.current)');
    expect(source).toContain('useEffect(() => cancelAdvance, [cancelAdvance])');
    /* Every scheduled advance is held, so it can be replaced rather than added to. */
    expect(source).toContain('advanceTimer.current = window.setTimeout(');
    expect(source.match(/window\.setTimeout\(/g)).toHaveLength(1);
  });

  it('advances only from the question the answer belongs to', () => {
    expect(source).toContain('const answeredAt = positionRef.current');
    expect(source).toContain('seq === answerSeq.current && positionRef.current === answeredAt');
    expect(source).toContain('if (!isCurrent()) return;');
    expect(source).toContain('goTo(answeredAt + 1)');
  });

  it('routes every manual move through the same guard', () => {
    expect(source).toContain('onClick={() => goTo(currentQuestion - 1)}');
    expect(source).toContain('onClick={() => goTo(currentQuestion + 1)}');
    /* Nothing may set the position behind goTo's back, or the guard reads a stale index. */
    expect(source.match(/setCurrentQuestion\(/g)).toHaveLength(1);
  });
});

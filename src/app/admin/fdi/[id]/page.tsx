import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FdiTestStatusForm } from '@/components/admin/FdiTestStatusForm';
import { requireAdminAuth } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/server';
import { BrandMark } from '@/components/layout/BrandLogo';
import { AdminSignOut } from '@/components/admin/AdminSignOut';

type FdiSessionDetail = {
  readonly id: string;
  readonly created_at: string;
  readonly completed_at: string | null;
  readonly status: string;
  readonly is_test: boolean;
  readonly name: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly company_name: string | null;
  readonly fdi_display: number | null;
  readonly band_label: string | null;
  readonly display_ds: number | null;
  readonly display_ec: number | null;
  readonly display_ov: number | null;
  readonly concentration: { labels?: string[] } | null;
  readonly component_alerts: { components?: { label: string }[] }[] | null;
  readonly observations: string[] | null;
  readonly qualification_result: string | null;
  readonly qualification_reasons: string[] | null;
  readonly q_industry: string | null;
  readonly q_other_sector: string | null;
  readonly q_revenue_range: string | null;
  readonly q_team_size: string | null;
  readonly q_operating_years: string | null;
  readonly email_sent: boolean;
  readonly completion_ms: number | null;
  readonly answer_change_count: number | null;
};

type FdiAnswer = { readonly question_id: string; readonly component_key: string; readonly option_id: string; readonly score: number; readonly change_count: number; readonly answered_at: string };
type TestHistory = { readonly previous_is_test: boolean; readonly new_is_test: boolean; readonly changed_at: string; readonly admin_identifier: string | null; readonly reason: string | null };

function displayValue(value: string | number | boolean | null): string {
  if (value === null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).replace(/_/g, ' ');
}

export default async function AdminFdiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminAuth();
  const { id } = await params;
  const supabase = createAdminClient();
  const [sessionResult, answersResult, historyResult] = await Promise.all([
    supabase.from('fdi_sessions').select('*').eq('id', id).single(),
    supabase.from('fdi_answers').select('question_id,component_key,option_id,score,change_count,answered_at').eq('session_id', id).order('question_id'),
    supabase.from('fdi_test_status_history').select('previous_is_test,new_is_test,changed_at,admin_identifier,reason').eq('session_id', id).order('changed_at', { ascending: false }),
  ]);
  const { data: row, error } = sessionResult;
  if (error) {
    if (error.code === 'PGRST116') notFound();
    console.error(`FDI session ${id} could not be loaded:`, error);
    throw new Error('FDI session could not be loaded.');
  }
  if (!row) notFound();
  if (answersResult.error || historyResult.error) {
    console.error(`FDI supporting records for ${id} could not be loaded:`, {
      answersError: answersResult.error,
      historyError: historyResult.error,
    });
    throw new Error('FDI supporting records could not be loaded.');
  }
  const answers = answersResult.data;
  const history = historyResult.data;
  const session = row as FdiSessionDetail;
  const alerts = (session.component_alerts ?? []).flatMap((tier) => tier.components?.map((component) => component.label) ?? []);
  // Self-reported and optional: a dash means the founder skipped it, which never blocks a result.
  const qualification = [
    ['Sector', session.q_industry], ['Other sector', session.q_other_sector], ['Employees', session.q_team_size], ['Revenue', session.q_revenue_range], ['Operating age', session.q_operating_years],
  ] as const;

  return (
    <div className="min-h-screen bg-canvas-light"><nav className="border-b border-line bg-white text-ink px-6 py-4 flex items-center justify-between"><div className="flex items-center gap-4"><Link href="/admin/fdi" className="text-xs text-muted hover:text-brand-ink">← FDI sessions</Link><span className="flex items-center gap-2 font-heading font-bold text-[length:var(--step-0)]"><BrandMark className="h-7 w-7" />FDI record</span></div><AdminSignOut /></nav><section className="max-w-5xl mx-auto px-4 py-8 space-y-5"><header className="bg-white border border-line rounded-2xl p-6"><div className="flex flex-col md:flex-row md:justify-between gap-4"><div><p className="eyebrow text-brand-ink">{session.is_test ? 'Explicit test record' : 'Live FDI record'}</p><h1 className="font-heading font-extrabold text-ink text-[length:var(--step-3)] mt-2">{session.name ?? 'Incomplete session'}</h1><p className="font-body text-muted mt-1">{session.company_name ?? 'No company captured'} · {session.email ?? 'No email captured'}</p></div><div className="md:text-right"><p className="font-mono font-heading font-extrabold text-ink text-[length:var(--step-4)]">{session.fdi_display === null ? '—' : `${session.fdi_display} / 100`}</p><p className="font-body text-[length:var(--step-0)] text-muted">{session.band_label ?? session.status}</p></div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-line pt-5 mt-5"><div><p className="eyebrow text-muted">Decision Speed</p><p className="font-mono font-heading font-bold text-ink text-[length:var(--step-0)] mt-1">{session.display_ds ?? '—'}</p></div><div><p className="eyebrow text-muted">Execution</p><p className="font-mono font-heading font-bold text-ink text-[length:var(--step-0)] mt-1">{session.display_ec ?? '—'}</p></div><div><p className="eyebrow text-muted">Visibility</p><p className="font-mono font-heading font-bold text-ink text-[length:var(--step-0)] mt-1">{session.display_ov ?? '—'}</p></div><div><p className="eyebrow text-muted">Email</p><p className="font-mono font-heading font-bold text-ink text-[length:var(--step-0)] mt-1">{session.status === 'completed' ? (session.email_sent ? 'Sent' : 'Pending') : '—'}</p></div></div></header>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5"><div className="bg-white border border-line rounded-2xl p-6"><h2 className="font-heading font-extrabold text-ink text-[length:var(--step-0)]">Consultant qualification</h2><p className="font-body text-[length:var(--step-0)] text-muted mt-2">Outcome: <strong>{session.qualification_result ?? 'Pending'}</strong></p><p className="font-body text-xs text-muted mt-1">Business details are optional on the final screen. Not assessed means none were shared.</p>{session.qualification_reasons && session.qualification_reasons.length > 0 && <p className="font-body text-xs text-muted mt-2">Reasons: {session.qualification_reasons.map(displayValue).join(', ')}</p>}<dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5">{qualification.map(([label, value]) => <div key={label}><dt className="font-heading text-xs text-muted">{label}</dt><dd className="font-body text-[length:var(--step-0)] text-ink mt-1">{displayValue(value)}</dd></div>)}</dl></div><div className="bg-white border border-line rounded-2xl p-6"><h2 className="font-heading font-extrabold text-ink text-[length:var(--step-0)]">Test classification</h2><div className="mt-4"><FdiTestStatusForm sessionId={session.id} isTest={session.is_test} /></div><div className="border-t border-line mt-5 pt-5"><p className="eyebrow text-muted">Override history</p><ul className="mt-3 space-y-3">{((history ?? []) as TestHistory[]).map((entry) => <li key={`${entry.changed_at}-${entry.admin_identifier}`} className="font-body text-xs text-muted"><strong>{entry.previous_is_test ? 'Test' : 'Live'} → {entry.new_is_test ? 'Test' : 'Live'}</strong> · {new Date(entry.changed_at).toLocaleString('en-AE')}{entry.reason ? ` · ${entry.reason}` : ''}</li>)}{(history ?? []).length === 0 && <li className="font-body text-xs text-muted">No manual override recorded.</li>}</ul></div></div></section>
      <section className="bg-white border border-line rounded-2xl p-6"><h2 className="font-heading font-extrabold text-ink text-[length:var(--step-0)]">Deterministic findings</h2><p className="font-body text-[length:var(--step-0)] text-muted mt-2">Concentration: {session.concentration?.labels?.join(' and ') ?? 'Pending'}{alerts.length > 0 ? ` · Severe component alert: ${alerts.join(', ')}` : ''}</p><ul className="mt-4 space-y-2">{(session.observations ?? []).map((finding) => <li key={finding} className="font-body text-[length:var(--step-0)] text-ink">• {finding}</li>)}{(session.observations ?? []).length === 0 && <li className="font-body text-[length:var(--step-0)] text-muted">No result until the session is completed.</li>}</ul></section>
      <section className="bg-white border border-line rounded-2xl p-6"><h2 className="font-heading font-extrabold text-ink text-[length:var(--step-0)]">Saved FDI answers</h2><div className="overflow-x-auto mt-4"><table className="w-full text-[length:var(--step-0)]"><thead><tr className="border-b border-line"><th className="h-11 text-left py-2 font-body text-xs font-medium text-muted">Question</th><th className="h-11 text-left py-2 font-body text-xs font-medium text-muted">Component</th><th className="h-11 text-right py-2 font-body text-xs font-medium text-muted">Score</th><th className="h-11 text-right py-2 font-body text-xs font-medium text-muted">Changes</th></tr></thead><tbody>{((answers ?? []) as FdiAnswer[]).map((answer) => <tr key={answer.question_id} className="border-b border-line"><td className="py-2 font-body text-ink">{answer.question_id}</td><td className="py-2 font-body text-muted">{answer.component_key}</td><td className="py-2 text-right font-mono font-heading font-bold text-ink">{answer.score}</td><td className="py-2 text-right font-mono font-body text-muted">{answer.change_count}</td></tr>)}</tbody></table></div></section>
    </section></div>
  );
}

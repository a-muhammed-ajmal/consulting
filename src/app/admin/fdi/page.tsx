import Link from 'next/link';
import { requireAdminAuth } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/server';
import { BrandMark } from '@/components/layout/BrandLogo';
import { AdminSignOut } from '@/components/admin/AdminSignOut';

type FdiSessionListRow = {
  readonly id: string;
  readonly created_at: string;
  readonly status: 'in_progress' | 'completed';
  readonly is_test: boolean;
  readonly name: string | null;
  readonly email: string | null;
  readonly company_name: string | null;
  readonly fdi_display: number | null;
  readonly band_label: string | null;
  readonly qualification_result: string | null;
  readonly email_sent: boolean;
};

export default async function AdminFdiPage() {
  await requireAdminAuth();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('fdi_sessions')
    .select('id,created_at,status,is_test,name,email,company_name,fdi_display,band_label,qualification_result,email_sent')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('FDI sessions could not be loaded:', error);
    throw new Error('FDI sessions could not be loaded.');
  }
  const sessions = (data ?? []) as FdiSessionListRow[];
  const liveCompleted = sessions.filter((session) => !session.is_test && session.status === 'completed');
  const liveInProgress = sessions.filter((session) => !session.is_test && session.status === 'in_progress');
  const testSessions = sessions.filter((session) => session.is_test);

  return (
    <div className="min-h-screen bg-canvas-light">
      <nav className="border-b border-line bg-white text-ink px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4"><Link href="/admin/leads" className="text-xs text-muted hover:text-brand-ink">← Legacy leads</Link><span className="flex items-center gap-2 font-heading font-bold text-[length:var(--step-0)]"><BrandMark className="h-7 w-7" />FDI Consultant Workspace</span></div>
        <div className="flex items-center gap-4"><Link href="/diagnostic?testMode=true" className="text-xs text-brand-ink hover:text-brand">Start Test Mode</Link><AdminSignOut /></div>
      </nav>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><p className="eyebrow text-brand-ink">Founder Dependency Index</p><h1 className="font-heading font-extrabold text-ink text-[length:var(--step-3)] mt-2">FDI sessions</h1><p className="font-body text-[length:var(--step-0)] text-muted mt-2">Live and test records are separated. Qualification is consultant-only.</p></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"><div className="bg-white border border-line rounded-xl p-5"><p className="font-body text-xs font-medium uppercase text-muted">Live completed</p><p className="font-mono font-heading font-extrabold text-ink text-[length:var(--step-4)] mt-2">{liveCompleted.length}</p></div><div className="bg-white border border-line rounded-xl p-5"><p className="font-body text-xs font-medium uppercase text-muted">Live in progress</p><p className="font-mono font-heading font-extrabold text-ink text-[length:var(--step-4)] mt-2">{liveInProgress.length}</p></div><div className="bg-white border border-line rounded-xl p-5"><p className="font-body text-xs font-medium uppercase text-muted">Explicit test records</p><p className="font-mono font-heading font-extrabold text-ink text-[length:var(--step-4)] mt-2">{testSessions.length}</p></div></div>
        <div className="bg-white border border-line rounded-xl shadow-1 overflow-hidden mt-6"><div className="overflow-x-auto"><table className="w-full text-[length:var(--step-0)]"><thead className="sticky top-0 z-10 bg-white text-ink"><tr>{['Date', 'Respondent', 'Company', 'Status', 'FDI', 'Qualification', 'Email', 'Record'].map((label) => <th key={label} className="h-11 px-4 text-left font-body text-xs font-medium uppercase whitespace-nowrap">{label}</th>)}</tr></thead><tbody className="divide-y divide-line">{sessions.map((session) => <tr key={session.id} className="h-11 hover:bg-brand-tint"><td className="px-4 py-3 font-body text-xs text-muted whitespace-nowrap">{new Date(session.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td className="px-4 py-3"><p className="font-heading font-semibold text-ink">{session.name ?? '—'}</p><p className="font-body text-xs text-muted">{session.email ?? 'No contact yet'}</p></td><td className="px-4 py-3 font-body text-xs text-muted">{session.company_name ?? '—'}</td><td className="px-4 py-3"><span className={session.status === 'completed' ? 'text-xs font-bold text-success' : 'text-xs font-bold text-warning'}>{session.status === 'completed' ? 'Completed' : 'In progress'}</span></td><td className="px-4 py-3 text-right font-mono font-heading font-bold text-ink">{session.fdi_display === null ? '—' : `${session.fdi_display} / 100`}<p className="font-body text-xs font-normal text-muted">{session.band_label ?? ''}</p></td><td className="px-4 py-3 font-body text-xs text-muted">{session.qualification_result ?? 'Pending'}</td><td className="px-4 py-3 font-body text-xs">{session.status === 'completed' ? (session.email_sent ? <span className="text-success">Sent</span> : <span className="text-danger">Pending</span>) : '—'}</td><td className="px-4 py-3"><Link href={`/admin/fdi/${session.id}`} className="font-heading text-xs font-bold text-brand-ink hover:underline">{session.is_test ? 'Test record →' : 'View →'}</Link></td></tr>)}</tbody></table></div>{sessions.length === 0 && <p className="font-body text-[length:var(--step-0)] text-muted p-8 text-center">No FDI sessions yet.</p>}</div>
      </section>
    </div>
  );
}

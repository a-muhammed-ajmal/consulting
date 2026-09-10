import Link from 'next/link';
import { requireAdminAuth } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/server';
import { inquiryTypeLabel } from '@/lib/contact/inquiry-types';
import { BrandMark } from '@/components/layout/BrandLogo';
import { AdminSignOut } from '@/components/admin/AdminSignOut';

/**
 * Consultant-only view of contact inquiries.
 *
 * This exists because a notification that Resend rejects would otherwise leave
 * no trace anyone ever looks at: the row is written, the send fails, and the
 * message sits in Postgres unread. Failed sends are therefore listed first and
 * counted at the top, so a dropped notification cannot hide below the fold.
 *
 * Reached by URL only — deliberately absent from every navigation, from the
 * sitemap allowlist, and noindex via the admin layout.
 */

type ContactInquiryRow = {
  readonly id: string;
  readonly created_at: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly company_name: string;
  readonly inquiry_type: string;
  readonly message: string;
  readonly email_sent: boolean;
  readonly email_error: string | null;
};

export default async function AdminInquiriesPage() {
  await requireAdminAuth();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('contact_enquiries')
    .select('id,created_at,name,email,phone,company_name,inquiry_type,message,email_sent,email_error')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Contact inquiries could not be loaded:', error);
    throw new Error('Contact inquiries could not be loaded.');
  }

  const inquiries = (data ?? []) as ContactInquiryRow[];
  // A recorded rejection outranks recency: those are the messages at risk of
  // never being answered.
  const failed = inquiries.filter((inquiry) => inquiry.email_error !== null);
  const rest = inquiries.filter((inquiry) => inquiry.email_error === null);
  const ordered = [...failed, ...rest];
  const notified = inquiries.filter((inquiry) => inquiry.email_sent);

  return (
    <div className="min-h-screen bg-canvas-light">
      <nav className="border-b border-line bg-white text-ink px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/fdi" className="text-xs text-muted hover:text-brand-ink">← FDI sessions</Link>
          <span className="flex items-center gap-2 font-heading font-bold text-[length:var(--step-0)]"><BrandMark className="h-7 w-7" />Contact inquiries</span>
        </div>
        <AdminSignOut />
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <p className="eyebrow text-brand-ink">Contact form</p>
          <h1 className="font-heading font-extrabold text-ink text-[length:var(--step-3)] mt-2">Inquiries</h1>
          <p className="font-body text-[length:var(--step-0)] text-muted mt-2">
            Every message submitted through the contact form. A failed notification means the
            message was stored but never reached the inbox — those are listed first.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border border-line rounded-xl p-5">
            <p className="font-body text-xs font-medium uppercase text-muted">Total inquiries</p>
            <p className="font-mono font-heading font-extrabold text-ink text-[length:var(--step-4)] mt-2">{inquiries.length}</p>
          </div>
          <div className="bg-white border border-line rounded-xl p-5">
            <p className="font-body text-xs font-medium uppercase text-muted">Notified</p>
            <p className="font-mono font-heading font-extrabold text-ink text-[length:var(--step-4)] mt-2">{notified.length}</p>
          </div>
          <div className={failed.length > 0 ? 'bg-danger-soft border border-danger/30 rounded-xl p-5' : 'bg-white border border-line rounded-xl p-5'}>
            <p className="font-body text-xs font-medium uppercase text-muted">Failed notifications</p>
            <p className={`font-mono font-heading font-extrabold text-[length:var(--step-4)] mt-2 ${failed.length > 0 ? 'text-danger' : 'text-ink'}`}>{failed.length}</p>
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl shadow-1 overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-[length:var(--step-0)]">
              <thead className="sticky top-0 z-10 bg-white text-ink">
                <tr>
                  {['Date', 'Name', 'Company', 'Email', 'Inquiry', 'Message', 'Notification'].map((label) => (
                    <th key={label} className="h-11 px-4 text-left font-body text-xs font-medium uppercase whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ordered.map((inquiry) => (
                  <tr key={inquiry.id} className={inquiry.email_error !== null ? 'bg-danger-soft/40 align-top' : 'align-top hover:bg-brand-tint'}>
                    <td className="px-4 py-3 font-body text-xs text-muted whitespace-nowrap">
                      {new Date(inquiry.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-heading font-semibold text-ink">{inquiry.name}</p>
                      <p className="font-body text-xs text-muted">{inquiry.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted">{inquiry.company_name}</td>
                    <td className="px-4 py-3 font-body text-xs">
                      <a href={`mailto:${inquiry.email}`} className="text-brand-ink hover:underline">{inquiry.email}</a>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-ink">{inquiryTypeLabel(inquiry.inquiry_type)}</td>
                    <td className="px-4 py-3 font-body text-xs text-ink whitespace-pre-wrap min-w-[18rem] max-w-md">{inquiry.message}</td>
                    <td className="px-4 py-3 font-body text-xs whitespace-nowrap">
                      {inquiry.email_error !== null ? (
                        <>
                          <span className="font-bold text-danger">Failed</span>
                          <p className="font-body text-xs text-danger whitespace-pre-wrap max-w-[14rem]">{inquiry.email_error}</p>
                        </>
                      ) : inquiry.email_sent ? (
                        <span className="text-success">Sent</span>
                      ) : (
                        <span className="text-muted">Not recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inquiries.length === 0 && (
            <p className="font-body text-[length:var(--step-0)] text-muted p-8 text-center">No contact inquiries yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

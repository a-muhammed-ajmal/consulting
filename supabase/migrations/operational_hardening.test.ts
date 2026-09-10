import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migration = readFileSync(
  join(process.cwd(), 'supabase', 'migrations', '20260910000001_operational_hardening.sql'),
  'utf8',
).toLowerCase();

describe('operational hardening migration', () => {
  it('changes test status and writes history inside one database function', () => {
    expect(migration).toContain('function public.set_fdi_test_status');
    expect(migration).toContain('for update');
    expect(migration).toContain('update public.fdi_sessions');
    expect(migration).toContain('insert into public.fdi_test_status_history');
    expect(migration).toContain('grant execute on function public.set_fdi_test_status');
  });

  it('enforces the published retention boundaries', () => {
    expect(migration).toContain("status = 'in_progress'");
    expect(migration).toContain("interval '30 days'");
    expect(migration).toContain("status = 'completed'");
    expect(migration).toContain("interval '24 months'");
    expect(migration).toContain('delete from public.contact_enquiries');
    expect(migration).toContain('delete from public.diagnostic_leads');
    expect(migration).toContain('delete from public.newsletter_subscribers');
    expect(migration).toContain('delete from public.admin_sessions');
  });

  it('schedules cleanup and denies public execution', () => {
    expect(migration).toContain("'purge-expired-application-data'");
    expect(migration).toContain("'17 3 * * *'");
    expect(migration).toContain('revoke execute on function public.purge_expired_application_data() from public, anon, authenticated');
    expect(migration).toContain('grant execute on function public.purge_expired_application_data() to service_role');
  });
});

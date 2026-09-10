-- Operational hardening for admin auditing and application-data retention.
--
-- The service-role-only RPC below makes an FDI live/test status change and its
-- audit-history insert one database transaction. The retention function keeps
-- the public privacy notice aligned with what the application actually does.

create extension if not exists pg_cron;

create or replace function public.set_fdi_test_status(
  p_session_id uuid,
  p_is_test boolean,
  p_admin_identifier text,
  p_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous boolean;
begin
  select is_test
    into v_previous
    from public.fdi_sessions
   where id = p_session_id
   for update;

  if not found then
    raise exception 'FDI session was not found.' using errcode = 'P0002';
  end if;

  if v_previous = p_is_test then
    return false;
  end if;

  update public.fdi_sessions
     set is_test = p_is_test
   where id = p_session_id;

  insert into public.fdi_test_status_history (
    session_id,
    previous_is_test,
    new_is_test,
    admin_identifier,
    reason
  ) values (
    p_session_id,
    v_previous,
    p_is_test,
    p_admin_identifier,
    nullif(btrim(p_reason), '')
  );

  return true;
end;
$$;

comment on function public.set_fdi_test_status(uuid, boolean, text, text) is
  'Atomically changes FDI test classification and appends its admin audit record.';

revoke execute on function public.set_fdi_test_status(uuid, boolean, text, text) from public, anon, authenticated;
grant execute on function public.set_fdi_test_status(uuid, boolean, text, text) to service_role;

create or replace function public.purge_expired_application_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_incomplete_fdi integer;
  v_completed_fdi integer;
  v_contact_inquiries integer;
  v_legacy_leads integer;
  v_unsubscribed integer;
  v_admin_sessions integer;
  v_rate_limits integer;
begin
  delete from public.fdi_sessions
   where status = 'in_progress'
     and created_at < now() - interval '30 days';
  get diagnostics v_incomplete_fdi = row_count;

  delete from public.fdi_sessions
   where status = 'completed'
     and created_at < now() - interval '24 months';
  get diagnostics v_completed_fdi = row_count;

  delete from public.contact_enquiries
   where created_at < now() - interval '24 months';
  get diagnostics v_contact_inquiries = row_count;

  delete from public.diagnostic_leads
   where created_at < now() - interval '24 months';
  get diagnostics v_legacy_leads = row_count;

  delete from public.newsletter_subscribers
   where unsubscribed_at is not null
     and unsubscribed_at < now() - interval '30 days';
  get diagnostics v_unsubscribed = row_count;

  delete from public.admin_sessions
   where expires_at < now();
  get diagnostics v_admin_sessions = row_count;

  delete from public.rate_limits
   where window_start < now() - interval '2 days';
  get diagnostics v_rate_limits = row_count;

  return jsonb_build_object(
    'incomplete_fdi', v_incomplete_fdi,
    'completed_fdi', v_completed_fdi,
    'contact_inquiries', v_contact_inquiries,
    'legacy_leads', v_legacy_leads,
    'unsubscribed_newsletter', v_unsubscribed,
    'admin_sessions', v_admin_sessions,
    'rate_limits', v_rate_limits
  );
end;
$$;

comment on function public.purge_expired_application_data() is
  'Deletes application data at the retention boundaries published in the privacy notice.';

revoke execute on function public.purge_expired_application_data() from public, anon, authenticated;
grant execute on function public.purge_expired_application_data() to service_role;

do $$
declare
  v_job_id bigint;
begin
  for v_job_id in
    select jobid from cron.job where jobname = 'purge-expired-application-data'
  loop
    perform cron.unschedule(v_job_id);
  end loop;
end;
$$;

select cron.schedule(
  'purge-expired-application-data',
  '17 3 * * *',
  'select public.purge_expired_application_data();'
);

comment on column public.admin_sessions.session_token is
  'SHA-256 digest of the random bearer token held only in the HTTP-only cookie.';

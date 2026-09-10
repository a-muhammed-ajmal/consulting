import { NextRequest } from 'next/server';

const mockSend = jest.fn();
const mockFrom = jest.fn();
const mockCreateAdminClient = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

jest.mock('@/lib/rateLimit', () => ({
  enforcePublicFormLimits: () => Promise.resolve(null),
}));

jest.mock('@/lib/serverEnv', () => ({
  requireResendConfig: () => ({ apiKey: 're_test_key', fromEmail: 'consult@muhammedajmal.com' }),
}));

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}));

import { POST } from './route';

const VALID = {
  name: 'Dana Okonkwo',
  email: 'dana@acme.ae',
  phone: '+971500000000',
  companyName: 'Acme Trading',
  inquiryType: 'health-check-followup',
  message: 'We would like to discuss where operations still depend on me.',
};

function request(body: Record<string, unknown> = VALID) {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify(body),
  });
}

/** Captures every update() payload so the recorded outcome can be asserted. */
let updates: Record<string, unknown>[];

function supabaseWith(insertResult: { data: unknown; error: unknown }) {
  updates = [];
  const single = jest.fn().mockResolvedValue(insertResult);
  const select = jest.fn().mockReturnValue({ single });
  const insert = jest.fn().mockReturnValue({ select });
  const update = jest.fn().mockImplementation((payload: Record<string, unknown>) => {
    updates.push(payload);
    return { eq: jest.fn().mockResolvedValue({ error: null }) };
  });
  mockFrom.mockReturnValue({ insert, update });
  mockCreateAdminClient.mockReturnValue({ from: mockFrom });
  return { insert };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSend.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
});

describe('POST /api/contact', () => {
  it('stores the inquiry and records the notification as sent', async () => {
    supabaseWith({ data: { id: 'row-1' }, error: null });

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(updates).toContainEqual({ email_sent: true, email_error: null });
  });

  it('returns an error and never sends when the inquiry cannot be stored', async () => {
    supabaseWith({ data: null, error: { message: 'permission denied' } });

    const res = await POST(request());

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false });
    // Nothing was stored, so the visitor must be able to retry rather than be
    // told a message was received that no longer exists anywhere.
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('keeps the stored inquiry and records the failure when the send is rejected', async () => {
    supabaseWith({ data: { id: 'row-2' }, error: null });
    mockSend.mockResolvedValue({ data: null, error: { message: 'Rejected by Resend' } });

    const res = await POST(request());

    // The visitor sees success because their message WAS stored.
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(updates).toContainEqual({ email_error: 'Rejected by Resend' });
    expect(updates).not.toContainEqual(expect.objectContaining({ email_sent: true }));
  });

  it('records the failure when the send throws rather than returning an error', async () => {
    supabaseWith({ data: { id: 'row-3' }, error: null });
    mockSend.mockRejectedValue(new Error('socket hang up'));

    const res = await POST(request());

    expect(await res.json()).toEqual({ success: true });
    expect(updates).toContainEqual({ email_error: 'socket hang up' });
  });

  it('builds the subject from the readable label, in US spelling', async () => {
    supabaseWith({ data: { id: 'row-4' }, error: null });

    await POST(request());

    const { subject, replyTo } = mockSend.mock.calls[0][0];
    expect(subject).toBe(
      'New inquiry — Dana Okonkwo, Acme Trading — Following up on my Business Health Check result',
    );
    expect(subject).not.toMatch(/enquiry/i);
    expect(subject).not.toContain('health-check-followup');
    // The reply destination is the visitor, not the sending mailbox.
    expect(replyTo).toBe('dana@acme.ae');
  });

  it('rejects an unrecognised inquiry type before storing or sending', async () => {
    supabaseWith({ data: { id: 'row-5' }, error: null });

    const response = await POST(request({ ...VALID, inquiryType: 'retired-slug' }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false });
    expect(mockSend).not.toHaveBeenCalled();
  });
});

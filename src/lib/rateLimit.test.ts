import { NextRequest } from 'next/server';

const mockRpc = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({ rpc: (...args: unknown[]) => mockRpc(...args) }),
}));

import {
  consume,
  consumeStrict,
  enforcePublicFormLimits,
  getClientIp,
  normaliseEmail,
  tooManyRequests,
} from './rateLimit';

function request(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/contact', { headers });
}

describe('rate limiting', () => {
  beforeEach(() => jest.clearAllMocks());

  it('normalises identifiers and resolves the forwarded client address', () => {
    expect(normaliseEmail('  Founder@Acme.AE ')).toBe('founder@acme.ae');
    expect(getClientIp(request({ 'x-forwarded-for': '203.0.113.4, 10.0.0.2' }))).toBe('203.0.113.4');
    expect(getClientIp(request({ 'x-real-ip': '198.51.100.8' }))).toBe('198.51.100.8');
    expect(getClientIp(request())).toBe('unknown');
  });

  it('returns the atomic database result', async () => {
    mockRpc.mockResolvedValue({ data: [{ allowed: false, retry_after_seconds: 42 }], error: null });

    await expect(consumeStrict({ scope: 'admin', identifier: 'ip', limit: 1, windowSeconds: 60 }))
      .resolves.toEqual({ allowed: false, retryAfterSeconds: 42 });
  });

  it('fails public forms open but strict callers closed through rejection', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'offline' } });
    const rule = { scope: 'contact:ip', identifier: 'ip', limit: 5, windowSeconds: 60 };

    await expect(consume(rule)).resolves.toEqual({ allowed: true, retryAfterSeconds: 0 });
    await expect(consumeStrict(rule)).rejects.toEqual({ message: 'offline' });
  });

  it('enforces both the IP and normalised-email buckets', async () => {
    mockRpc
      .mockResolvedValueOnce({ data: { allowed: true, retry_after_seconds: 20 }, error: null })
      .mockResolvedValueOnce({ data: { allowed: false, retry_after_seconds: 90 }, error: null });

    const response = await enforcePublicFormLimits(
      request({ 'x-forwarded-for': '203.0.113.4' }),
      'contact',
      ' Founder@Acme.AE ',
    );

    expect(response?.status).toBe(429);
    expect(response?.headers.get('retry-after')).toBe('90');
    expect(mockRpc).toHaveBeenNthCalledWith(2, 'consume_rate_limit', expect.objectContaining({
      p_scope: 'contact:email',
      p_identifier: 'founder@acme.ae',
    }));
  });

  it('creates a standards-compliant 429 response', async () => {
    const response = tooManyRequests(0.2);
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('1');
    expect(await response.json()).toMatchObject({ success: false });
  });
});

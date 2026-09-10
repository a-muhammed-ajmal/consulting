import { NextRequest } from 'next/server';

const mockConsumeStrict = jest.fn();
const mockInsert = jest.fn();
const mockCreateAdminClient = jest.fn();

jest.mock('@/lib/rateLimit', () => ({
  consumeStrict: (...args: unknown[]) => mockConsumeStrict(...args),
  getClientIp: () => '203.0.113.10',
  tooManyRequests: (seconds: number) => new Response(
    JSON.stringify({ success: false, error: 'Too many requests' }),
    { status: 429, headers: { 'content-type': 'application/json', 'Retry-After': String(seconds) } },
  ),
}));

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}));

import { POST } from './route';

function request(password: unknown = 'correct-password') {
  return new NextRequest('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify({ password }),
  });
}

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_PASSWORD = 'correct-password';
    mockConsumeStrict.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mockInsert.mockResolvedValue({ error: null });
    mockCreateAdminClient.mockReturnValue({ from: () => ({ insert: mockInsert }) });
  });

  afterAll(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it('stores a digest, sets the raw HTTP-only cookie, and reports success', async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    const inserted = mockInsert.mock.calls[0][0];
    expect(inserted.session_token).toMatch(/^[a-f0-9]{64}$/);
    const cookie = response.cookies.get('admin_session');
    expect(cookie?.value).toMatch(/^[a-f0-9]{64}$/);
    expect(cookie?.value).not.toBe(inserted.session_token);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('strict');
  });

  it('rejects a wrong password without creating a session', async () => {
    const response = await POST(request('wrong-password'));

    expect(response.status).toBe(401);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(response.cookies.get('admin_session')).toBeUndefined();
  });

  it('returns 429 when the brute-force bucket is exhausted', async () => {
    mockConsumeStrict.mockResolvedValue({ allowed: false, retryAfterSeconds: 120 });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('120');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('fails closed when the rate-limit store is unavailable', async () => {
    mockConsumeStrict.mockRejectedValue(new Error('database unavailable'));

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(response.cookies.get('admin_session')).toBeUndefined();
  });

  it('never sets a cookie when session persistence fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'permission denied' } });

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(response.cookies.get('admin_session')).toBeUndefined();
  });

  it('returns 400 for an invalid body', async () => {
    const response = await POST(request(''));

    expect(response.status).toBe(400);
    expect(mockConsumeStrict).not.toHaveBeenCalled();
  });
});

const mockCookies = jest.fn();
const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockRedirect = jest.fn((path: string) => {
  void path;
  throw new Error('NEXT_REDIRECT');
});

jest.mock('next/headers', () => ({ cookies: () => mockCookies() }));
jest.mock('next/navigation', () => ({ redirect: (path: string) => mockRedirect(path) }));
jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({ from: () => ({ select: mockSelect }) }),
}));

import { getAdminAuthContext, requireAdminAuth } from './adminAuth';
import { hashAdminSessionToken } from './adminSession';

function cookieWith(value?: string) {
  mockCookies.mockResolvedValue({ get: () => value ? { value } : undefined });
}

describe('admin authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it('returns null without a bearer cookie', async () => {
    cookieWith();
    await expect(getAdminAuthContext()).resolves.toBeNull();
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it('queries by the stored digest and returns a non-secret audit identifier', async () => {
    const token = 'a'.repeat(64);
    cookieWith(token);
    mockSingle.mockResolvedValue({ data: { expires_at: '2099-01-01T00:00:00.000Z' }, error: null });

    const context = await getAdminAuthContext();

    expect(mockEq).toHaveBeenCalledWith('session_token', hashAdminSessionToken(token));
    expect(context).toEqual({ identifier: hashAdminSessionToken(token).slice(0, 16) });
    expect(context?.identifier).not.toContain(token);
  });

  it('rejects expired or failed database sessions', async () => {
    cookieWith('expired');
    mockSingle.mockResolvedValueOnce({ data: { expires_at: '2000-01-01T00:00:00.000Z' }, error: null });
    await expect(getAdminAuthContext()).resolves.toBeNull();

    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'offline' } });
    await expect(getAdminAuthContext()).resolves.toBeNull();
  });

  it('redirects unauthenticated admin requests', async () => {
    cookieWith();
    await expect(requireAdminAuth()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/admin');
  });
});

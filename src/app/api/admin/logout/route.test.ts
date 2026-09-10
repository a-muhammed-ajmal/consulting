import { NextRequest } from 'next/server';

const mockDelete = jest.fn();
const mockEq = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({ from: () => ({ delete: (...args: unknown[]) => mockDelete(...args) }) }),
}));

import { POST } from './route';
import { hashAdminSessionToken } from '@/lib/adminSession';

function request(token?: string) {
  const headers = token ? { cookie: `admin_session=${token}` } : undefined;
  return new NextRequest('https://www.muhammedajmal.com/api/admin/logout', { method: 'POST', headers });
}

describe('POST /api/admin/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  it('revokes the stored digest, clears the cookie, and redirects with 303', async () => {
    const token = 'a'.repeat(64);
    const response = await POST(request(token));

    expect(mockEq).toHaveBeenCalledWith('session_token', hashAdminSessionToken(token));
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://www.muhammedajmal.com/admin');
    expect(response.headers.get('set-cookie')).toContain('admin_session=;');
  });

  it('clears the browser cookie without touching the database when no token exists', async () => {
    const response = await POST(request());
    expect(mockDelete).not.toHaveBeenCalled();
    expect(response.status).toBe(303);
  });
});

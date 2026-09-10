import { hashAdminSessionToken } from './adminSession';

describe('admin session token storage', () => {
  it('returns a stable SHA-256 digest without retaining the bearer token', () => {
    const token = 'a'.repeat(64);
    const digest = hashAdminSessionToken(token);

    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toBe(token);
    expect(hashAdminSessionToken(token)).toBe(digest);
    expect(hashAdminSessionToken('b'.repeat(64))).not.toBe(digest);
  });
});

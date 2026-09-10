import { createHash } from 'node:crypto';

/** Store only a one-way digest; the raw bearer token remains in the HTTP-only cookie. */
export function hashAdminSessionToken(token: string): string {
  return createHash('sha256').update(`admin-session:${token}`).digest('hex');
}

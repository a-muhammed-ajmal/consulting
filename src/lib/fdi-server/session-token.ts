import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_PREFIX = 'fdi1';

function signingKey(): string {
  const dedicatedKey = process.env.FDI_SESSION_SIGNING_SECRET?.trim();
  if (dedicatedKey) {
    if (dedicatedKey.length < 32) throw new Error('FDI_SESSION_SIGNING_SECRET must contain at least 32 characters.');
    return dedicatedKey;
  }

  // Backward-compatible fallback keeps current sessions valid until the
  // dedicated secret is configured. New deployments should set it so rotating
  // the Supabase service-role key does not invalidate active diagnostic flows.
  const fallbackKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!fallbackKey) throw new Error('FDI_SESSION_SIGNING_SECRET or SUPABASE_SERVICE_ROLE_KEY is required to protect FDI sessions.');
  return fallbackKey;
}

function signature(sessionId: string): string {
  return createHmac('sha256', signingKey()).update(`fdi-session:${sessionId}`).digest('base64url');
}

/** A server-issued bearer capability for a single uncompleted browser session. */
export function issueFdiSessionToken(sessionId: string): string {
  return `${TOKEN_PREFIX}.${sessionId}.${signature(sessionId)}`;
}

/** Rejects malformed, substituted, or cross-session capabilities without revealing why. */
export function hasValidFdiSessionToken(sessionId: string, token: string): boolean {
  const expected = issueFdiSessionToken(sessionId);
  const received = Buffer.from(token);
  const expectedBytes = Buffer.from(expected);
  return received.length === expectedBytes.length && timingSafeEqual(received, expectedBytes);
}

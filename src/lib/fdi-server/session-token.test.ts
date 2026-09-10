import { hasValidFdiSessionToken, issueFdiSessionToken } from './session-token';

describe('FDI session capability', () => {
  const initial = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const initialDedicated = process.env.FDI_SESSION_SIGNING_SECRET;

  beforeEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-secret-key';
    delete process.env.FDI_SESSION_SIGNING_SECRET;
  });

  afterEach(() => {
    if (initial === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = initial;
    if (initialDedicated === undefined) delete process.env.FDI_SESSION_SIGNING_SECRET;
    else process.env.FDI_SESSION_SIGNING_SECRET = initialDedicated;
  });

  it('is valid only for its issued session', () => {
    const token = issueFdiSessionToken('11111111-1111-4111-8111-111111111111');
    expect(hasValidFdiSessionToken('11111111-1111-4111-8111-111111111111', token)).toBe(true);
    expect(hasValidFdiSessionToken('22222222-2222-4222-8222-222222222222', token)).toBe(false);
    expect(hasValidFdiSessionToken('11111111-1111-4111-8111-111111111111', `${token}x`)).toBe(false);
  });

  it('prefers a dedicated signing secret over the Supabase credential', () => {
    process.env.FDI_SESSION_SIGNING_SECRET = 'dedicated-test-secret-with-32-characters';
    const dedicated = issueFdiSessionToken('11111111-1111-4111-8111-111111111111');

    delete process.env.FDI_SESSION_SIGNING_SECRET;
    const fallback = issueFdiSessionToken('11111111-1111-4111-8111-111111111111');

    expect(dedicated).not.toBe(fallback);
  });

  it('rejects a weak dedicated secret instead of silently using it', () => {
    process.env.FDI_SESSION_SIGNING_SECRET = 'too-short';
    expect(() => issueFdiSessionToken('11111111-1111-4111-8111-111111111111'))
      .toThrow('at least 32 characters');
  });
});

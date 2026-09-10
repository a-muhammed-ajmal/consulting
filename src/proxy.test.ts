import { NextRequest } from 'next/server';
import { proxy } from './proxy';

function request(method: string, origin?: string, extraHeaders: Record<string, string> = {}) {
  return new NextRequest('https://www.muhammedajmal.com/api/contact', {
    method,
    headers: { ...(origin ? { origin } : {}), ...extraHeaders },
  });
}

describe('API origin boundary', () => {
  it('allows same-origin state changes', () => {
    expect(proxy(request('POST', 'https://www.muhammedajmal.com')).status).toBe(200);
  });

  it('rejects cross-origin and originless state changes', async () => {
    const crossOrigin = proxy(request('POST', 'https://attacker.example'));
    expect(crossOrigin.status).toBe(403);
    await expect(crossOrigin.json()).resolves.toMatchObject({ success: false });

    expect(proxy(request('POST')).status).toBe(403);
  });

  it('does not trust a forged forwarded host as an allowed origin', () => {
    const response = proxy(request('POST', 'https://attacker.example', {
      'x-forwarded-host': 'attacker.example',
    }));
    expect(response.status).toBe(403);
  });

  it('allows safe originless reads', () => {
    expect(proxy(request('GET')).status).toBe(200);
  });
});

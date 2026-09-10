import { contentSecurityPolicy } from './next.config';

describe('site content security policy', () => {
  it('permits every configured analytics and scheduling script origin', () => {
    expect(contentSecurityPolicy).toContain('https://assets.calendly.com');
    expect(contentSecurityPolicy).toContain('https://va.vercel-scripts.com');
    expect(contentSecurityPolicy).toContain('https://static.cloudflareinsights.com');
  });

  it('permits the configured analytics and scheduling connection origins', () => {
    expect(contentSecurityPolicy).toContain('https://*.calendly.com');
    expect(contentSecurityPolicy).toContain('https://vitals.vercel-insights.com');
    expect(contentSecurityPolicy).toContain('https://cloudflareinsights.com');
  });
});

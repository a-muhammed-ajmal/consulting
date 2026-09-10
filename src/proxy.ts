import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function getHost(value: string | null) {
  if (!value) return null;

  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return value.replace(/^https?:\/\//, '').split('/')[0]?.toLowerCase() || null;
  }
}

export function proxy(req: NextRequest) {
  // Add basic origin checking for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin');
    const originHost = getHost(origin);

    // Allow same-origin API calls first, then optional deployment aliases.
    const allowedHosts = new Set(
      [
        req.nextUrl.host,
        req.headers.get('host'),
        getHost(process.env.NEXT_PUBLIC_SITE_URL ?? null),
        getHost(process.env.VERCEL_URL ?? null),
        getHost(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null),
      ]
        .filter((host): host is string => Boolean(host))
        .map((host) => host.toLowerCase())
    );

    if (originHost) {
      if (!allowedHosts.has(originHost)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Invalid Origin' },
          { status: 403 }
        );
      }
    } else if (req.method !== 'GET' && req.method !== 'HEAD') {
      // A state-changing request with no Origin header is not a browser form submission —
      // it is a script. Browsers always send Origin on cross-origin and same-origin POSTs.
      // Previously these were waved through, which let a plain curl reach the
      // Resend delivery path behind the public diagnostic API.
      return NextResponse.json(
        { success: false, error: 'Forbidden: Missing Origin' },
        { status: 403 }
      );
    }
  }
  return NextResponse.next();
}

// Ensure the proxy ONLY intercepts API routes to avoid blocking regular page loads
export const config = { 
  matcher: ['/api/:path*'] 
};

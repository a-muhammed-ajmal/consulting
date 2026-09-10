import type { NextConfig } from "next";
import { PHASE_TEST } from "next/constants";
import { resolveCalendlyLink } from "./src/lib/calendly";

const isDevelopment = process.env.NODE_ENV === 'development';
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://assets.calendly.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "img-src 'self' data: blob: https://assets.calendly.com https://*.calendly.com",
  "font-src 'self' data: https://assets.calendly.com",
  "connect-src 'self' https://calendly.com https://*.calendly.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "frame-src https://calendly.com https://*.calendly.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
];

/**
 * Build-time guard for the booking link.
 *
 * Next loads .env* files before evaluating this config, so this runs on every
 * `next dev` / `next build` / `next start` and aborts before a single route is compiled
 * if NEXT_PUBLIC_CALENDLY_LINK is missing or malformed. Without it the build would only
 * fail incidentally — via whichever page happens to import src/lib/env.ts — and a
 * refactor could quietly restore the dead-booking-button bug.
 *
 * PHASE_TEST is exempt. `next/jest` loads this config to build the Jest transform, and it
 * does so *before* calling loadEnvConfig — so gating it would make the unit tests depend
 * on a deployment variable they never use. src/lib/calendly.test.ts covers the validator
 * directly instead.
 *
 * The check lives inside the exported function rather than at module scope so it can see
 * the phase. It is an explicit call, not a side-effect-only import, so no bundler can
 * tree-shake it away. Note the relative specifier: the `@/*` tsconfig alias is not
 * honoured here.
 */
export default function nextConfig(phase: string): NextConfig {
  if (phase !== PHASE_TEST) {
    resolveCalendlyLink(process.env.NEXT_PUBLIC_CALENDLY_LINK);
  }

  return {
    async headers() {
      return [{ source: '/:path*', headers: securityHeaders }];
    },
  };
}

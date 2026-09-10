/**
 * Build-time validated public environment.
 *
 * Only NEXT_PUBLIC_* values belong here. Next.js inlines these at build time, so a
 * missing value silently becomes the string "undefined" in the shipped HTML — which is
 * exactly the bug this module exists to prevent. Reading them here means a bad build
 * fails loudly instead of rendering a broken booking link.
 *
 * This is the second line of defence: `next.config.ts` runs the same validator before
 * compilation starts, so the build aborts there first regardless of which pages happen
 * to import this module.
 *
 * Server-only secrets (SUPABASE_SERVICE_ROLE_KEY, FDI_SESSION_SIGNING_SECRET,
 * RESEND_API_KEY, ADMIN_PASSWORD) are deliberately NOT validated here — they are read lazily inside
 * route handlers so the build never requires them.
 */

import { resolveCalendlyLink } from "./calendly";
import { resolveWhatsAppAuditLink } from "./whatsapp";

/**
 * The practice's Calendly booking URL. Guaranteed to be a valid https://calendly.com URL
 * with an event path.
 *
 * The literal `process.env.NEXT_PUBLIC_CALENDLY_LINK` reference is required: Next.js
 * replaces it textually at build time. Destructuring or dynamic access will not inline.
 * Passing it straight through as an argument keeps the literal intact.
 */
export const CALENDLY_LINK = resolveCalendlyLink(
  process.env.NEXT_PUBLIC_CALENDLY_LINK,
);

/**
 * Optional direct-message route for people who want to ask a question before
 * booking. It is omitted from the UI until the business WhatsApp number is configured.
 */
export const WHATSAPP_AUDIT_LINK = resolveWhatsAppAuditLink(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
);

/** Canonical public origin, used for metadata, sitemap and absolute links. */
export const SITE_URL = "https://www.muhammedajmal.com";

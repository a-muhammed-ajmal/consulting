import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Rate limiting for the public API routes.
 *
 * Every public report submission can trigger a Resend send, so an unbounded endpoint is
 * a direct bill. The counter lives in the Supabase `rate_limits`
 * table (see supabase/migrations) rather than in process memory: Vercel functions are
 * per-instance and cold-start frequently, so an in-memory Map would reset constantly and
 * would not span instances.
 */

export interface RateLimitRule {
  /** Stable identifier for the bucket, e.g. "submit:ip". */
  scope: string;
  /** The thing being limited — an IP address or an email address. */
  identifier: string;
  /** Maximum requests allowed inside the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry. Only meaningful when `allowed` is false. */
  retryAfterSeconds: number;
}

/**
 * The caller's IP. Vercel populates x-forwarded-for; the left-most entry is the client.
 * Falls back to a constant so a missing header degrades to a shared bucket rather than
 * to no limit at all.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Normalises an email so casing and whitespace cannot be used to mint fresh buckets. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function consumeSupabase(rule: RateLimitRule): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_scope: rule.scope,
    p_identifier: rule.identifier,
    p_limit: rule.limit,
    p_window_seconds: rule.windowSeconds,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  const allowed = Boolean(row?.allowed);
  const retryAfterSeconds = Number(row?.retry_after_seconds ?? rule.windowSeconds);

  return { allowed, retryAfterSeconds };
}

/**
 * Security-sensitive callers use the strict path so a failed counter store
 * cannot silently remove their brute-force protection.
 */
export async function consumeStrict(rule: RateLimitRule): Promise<RateLimitResult> {
  return consumeSupabase(rule);
}

/**
 * Consumes one unit from a bucket.
 *
 * Fails OPEN: if the counter store itself is unreachable the request is allowed through
 * and the failure is logged. A broken limiter must not take the contact form offline.
 */
export async function consume(rule: RateLimitRule): Promise<RateLimitResult> {
  try {
    return await consumeSupabase(rule);
  } catch (error) {
    console.error(`Rate limit check failed for ${rule.scope} (failing open):`, error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

const TOO_MANY_MESSAGE =
  "Too many requests. Please wait a little while and try again, or email us directly.";

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { success: false, error: TOO_MANY_MESSAGE },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))) },
    },
  );
}

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/**
 * The standard public-form guard: 5 requests per IP per hour, and — when an email address
 * is known — 2 per email address per day.
 *
 * Returns a 429 response to return immediately, or null when the request may proceed.
 */
export async function enforcePublicFormLimits(
  req: NextRequest,
  scope: string,
  email?: string,
): Promise<NextResponse | null> {
  const ipResult = await consume({
    scope: `${scope}:ip`,
    identifier: getClientIp(req),
    limit: 5,
    windowSeconds: HOUR,
  });
  if (!ipResult.allowed) return tooManyRequests(ipResult.retryAfterSeconds);

  if (email) {
    const emailResult = await consume({
      scope: `${scope}:email`,
      identifier: normaliseEmail(email),
      limit: 2,
      windowSeconds: DAY,
    });
    if (!emailResult.allowed) return tooManyRequests(emailResult.retryAfterSeconds);
  }

  return null;
}

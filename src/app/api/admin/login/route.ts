import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { consumeStrict, getClientIp, tooManyRequests } from "@/lib/rateLimit";
import { hashAdminSessionToken } from '@/lib/adminSession';
import { z } from "zod";
import crypto from "crypto";

/** Constant-time comparison so response timing does not leak the password. */
function passwordMatches(candidate: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = z.object({ password: z.string().min(1).max(500) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    console.error('Admin login is unavailable because ADMIN_PASSWORD is not configured.');
    return NextResponse.json({ error: 'Authentication temporarily unavailable' }, { status: 503 });
  }

  try {
    const { password } = parsed.data;

    // Brute-force guard on ADMIN_PASSWORD: 10 attempts per IP per hour.
    let attempt;
    try {
      attempt = await consumeStrict({
        scope: "admin-login:ip",
        identifier: getClientIp(req),
        limit: 10,
        windowSeconds: 60 * 60,
      });
    } catch (error) {
      console.error('Admin login rate limit failed closed:', error);
      return NextResponse.json({ error: 'Authentication temporarily unavailable' }, { status: 503 });
    }
    if (!attempt.allowed) return tooManyRequests(attempt.retryAfterSeconds);

    if (!passwordMatches(password, expectedPassword)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    const { error: insertError } = await supabase.from("admin_sessions").insert({
      session_token: hashAdminSessionToken(sessionToken),
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error('Admin session could not be stored:', insertError);
      return NextResponse.json({ error: 'Authentication temporarily unavailable' }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error('Admin login failed unexpectedly:', error);
    return NextResponse.json({ error: 'Authentication temporarily unavailable' }, { status: 500 });
  }
}

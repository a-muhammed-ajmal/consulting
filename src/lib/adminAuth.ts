import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { hashAdminSessionToken } from '@/lib/adminSession';

export interface AdminAuthContext {
  /** Stable, non-secret audit identifier derived from the admin session token. */
  readonly identifier: string;
}

export async function getAdminAuthContext(): Promise<AdminAuthContext | null> {
  // cookies() must come first: it marks the route dynamic, so Next never tries
  // to prerender admin pages at build time (where env vars may be absent).
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  if (!sessionToken) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("session_token", hashAdminSessionToken(sessionToken))
    .single();

  if (error || !data || new Date(data.expires_at) < new Date()) return null;

  return {
    identifier: hashAdminSessionToken(sessionToken).slice(0, 16),
  };
}

export async function requireAdminAuth(): Promise<AdminAuthContext> {
  const context = await getAdminAuthContext();
  if (!context) redirect("/admin");
  return context;
}

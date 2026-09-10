import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { hashAdminSessionToken } from '@/lib/adminSession';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (sessionToken) {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token', hashAdminSessionToken(sessionToken));
    if (error) console.error('Admin session could not be revoked during logout:', error);
  }

  const response = NextResponse.redirect(new URL('/admin', request.nextUrl.origin), 303);
  response.cookies.delete('admin_session');
  return response;
}

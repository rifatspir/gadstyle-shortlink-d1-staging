import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie } from '@/lib/session';
import { verifyLoginCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get('username') || '');
  const password = String(formData.get('password') || '');
  const nextPath = String(formData.get('next') || '/admin');

  const valid = await verifyLoginCredentials(username, password);

  if (!valid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', '1');
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const token = await createSessionToken(username);
  await setSessionCookie(token);
  return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
}

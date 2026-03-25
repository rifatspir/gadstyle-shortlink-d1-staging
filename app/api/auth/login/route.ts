import { NextRequest, NextResponse } from 'next/server';
import { createPreAuthToken, createSessionToken, setPreAuthCookie, setSessionCookie, clearPreAuthCookie } from '@/lib/session';
import { verifyLoginCredentials, isTwoFactorRequired } from '@/lib/auth';
import { clearLoginGuard, getLoginGuardStatus, registerFailedLogin } from '@/lib/login-guard';

function genericFailureRedirect(request: NextRequest, nextPath: string) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', '1');
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get('username') || '');
  const password = String(formData.get('password') || '');
  const nextPath = String(formData.get('next') || '/admin');

  const guard = await getLoginGuardStatus(request);
  if (guard.isLocked) {
    return genericFailureRedirect(request, nextPath);
  }

  const valid = await verifyLoginCredentials(username, password);

  if (!valid) {
    await registerFailedLogin(request);
    return genericFailureRedirect(request, nextPath);
  }

  await clearLoginGuard();

  if (isTwoFactorRequired()) {
    const preAuthToken = await createPreAuthToken(username, nextPath);
    await setPreAuthCookie(preAuthToken);
    return NextResponse.redirect(new URL('/login/verify', request.url), { status: 303 });
  }

  const token = await createSessionToken(username);
  await clearPreAuthCookie();
  await setSessionCookie(token);
  return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
}

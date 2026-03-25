import { NextRequest, NextResponse } from 'next/server';
import { createPreAuthToken, createSessionToken, setPreAuthCookie, setSessionCookie, clearPreAuthCookie } from '@/lib/session';
import { verifyLoginCredentials, isTwoFactorRequired } from '@/lib/auth';
import { clearLoginGuard, getLoginGuardStatus, registerFailedLogin } from '@/lib/login-guard';
import { logAdminAuthEvent } from '@/lib/auth-audit';

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

  const guard = await getLoginGuardStatus(request, 'login');
  if (guard.isLocked) {
    logAdminAuthEvent('login_locked', { username, stage: 'login', retryAt: guard.retryAt }, request);
    return genericFailureRedirect(request, nextPath);
  }

  const valid = await verifyLoginCredentials(username, password);

  if (!valid) {
    await registerFailedLogin(request, 'login', username);
    logAdminAuthEvent('login_failed', { username, stage: 'login' }, request);
    return genericFailureRedirect(request, nextPath);
  }

  await clearLoginGuard();

  if (isTwoFactorRequired()) {
    const preAuthToken = await createPreAuthToken(username, nextPath);
    await setPreAuthCookie(preAuthToken);
    logAdminAuthEvent('login_password_passed', { username, stage: 'preauth' }, request);
    return NextResponse.redirect(new URL('/login/verify', request.url), { status: 303 });
  }

  const token = await createSessionToken(username);
  await clearPreAuthCookie();
  await setSessionCookie(token);
  logAdminAuthEvent('login_success', { username, stage: 'password_only' }, request);
  return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
}

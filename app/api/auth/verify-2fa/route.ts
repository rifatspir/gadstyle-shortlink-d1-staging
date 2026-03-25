import { NextRequest, NextResponse } from 'next/server';
import { clearPreAuthCookie, createSessionToken, getPreAuthFromCookies, setSessionCookie } from '@/lib/session';
import { verifyRecoveryCode, verifyTwoFactorToken } from '@/lib/auth';
import { clearLoginGuard, getLoginGuardStatus, registerFailedLogin } from '@/lib/login-guard';
import { logAdminAuthEvent } from '@/lib/auth-audit';

export async function POST(request: NextRequest) {
  const preauth = await getPreAuthFromCookies();
  if (!preauth) {
    return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  }

  const guard = await getLoginGuardStatus(request, 'verify');
  if (guard.isLocked) {
    logAdminAuthEvent('verify_locked', { username: preauth.username, stage: 'verify', retryAt: guard.retryAt }, request);
    return NextResponse.redirect(new URL('/login/verify?error=1', request.url), { status: 303 });
  }

  const formData = await request.formData();
  const token = String(formData.get('token') || '');
  const recoveryCode = String(formData.get('recovery_code') || '');

  const validTotp = token ? await verifyTwoFactorToken(token) : false;
  const validRecovery = !validTotp && recoveryCode ? await verifyRecoveryCode(recoveryCode) : false;

  if (!validTotp && !validRecovery) {
    await registerFailedLogin(request, 'verify', preauth.username);
    logAdminAuthEvent('verify_failed', { username: preauth.username, stage: 'verify', usedRecovery: Boolean(recoveryCode) }, request);
    return NextResponse.redirect(new URL('/login/verify?error=1', request.url), { status: 303 });
  }

  await clearLoginGuard();
  await clearPreAuthCookie();
  const session = await createSessionToken(preauth.username);
  await setSessionCookie(session);
  logAdminAuthEvent(validRecovery ? 'verify_success_recovery' : 'verify_success_totp', { username: preauth.username, stage: 'verify' }, request);
  return NextResponse.redirect(new URL(preauth.nextPath || '/admin', request.url), { status: 303 });
}

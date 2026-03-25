import { NextRequest, NextResponse } from 'next/server';
import { clearPreAuthCookie, createSessionToken, getPreAuthFromCookies, setSessionCookie } from '@/lib/session';
import { verifyRecoveryCode, verifyTwoFactorToken } from '@/lib/auth';
import { clearLoginGuard, registerFailedLogin } from '@/lib/login-guard';

export async function POST(request: NextRequest) {
  const preauth = await getPreAuthFromCookies();
  if (!preauth) {
    return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  }

  const formData = await request.formData();
  const token = String(formData.get('token') || '');
  const recoveryCode = String(formData.get('recovery_code') || '');

  const validTotp = token ? await verifyTwoFactorToken(token) : false;
  const validRecovery = !validTotp && recoveryCode ? await verifyRecoveryCode(recoveryCode) : false;

  if (!validTotp && !validRecovery) {
    await registerFailedLogin(request);
    return NextResponse.redirect(new URL('/login/verify?error=1', request.url), { status: 303 });
  }

  await clearLoginGuard();
  await clearPreAuthCookie();
  const session = await createSessionToken(preauth.username);
  await setSessionCookie(session);
  return NextResponse.redirect(new URL(preauth.nextPath || '/admin', request.url), { status: 303 });
}

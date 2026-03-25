import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/env';

const LOGIN_GUARD_COOKIE = 'gadstyle_login_guard';
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

type GuardState = {
  attempts: number;
  lockUntil?: number;
  lastIp?: string;
};

function getSecretKey() {
  return new TextEncoder().encode(`${env.sessionSecret}:login-guard`);
}

async function readGuardState(raw?: string | null): Promise<GuardState> {
  if (!raw) return { attempts: 0 };
  try {
    const result = await jwtVerify(raw, getSecretKey());
    return {
      attempts: Number(result.payload.attempts || 0),
      lockUntil: result.payload.lockUntil ? Number(result.payload.lockUntil) : undefined,
      lastIp: result.payload.lastIp ? String(result.payload.lastIp) : undefined,
    };
  } catch {
    return { attempts: 0 };
  }
}

async function writeGuardState(state: GuardState) {
  return new SignJWT(state as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecretKey());
}

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function getLoginGuardStatus(request: NextRequest) {
  const cookieStore = await cookies();
  const state = await readGuardState(cookieStore.get(LOGIN_GUARD_COOKIE)?.value || null);
  const now = Date.now();
  return {
    isLocked: Boolean(state.lockUntil && state.lockUntil > now),
    retryAt: state.lockUntil,
    attempts: state.attempts,
  };
}

export async function registerFailedLogin(request: NextRequest) {
  const cookieStore = await cookies();
  const state = await readGuardState(cookieStore.get(LOGIN_GUARD_COOKIE)?.value || null);
  const ip = getClientIp(request);
  const attempts = (state.lastIp && state.lastIp !== ip) ? 1 : (state.attempts + 1);
  const nextState: GuardState = {
    attempts,
    lastIp: ip,
    lockUntil: attempts >= MAX_FAILURES ? Date.now() + (LOCK_MINUTES * 60 * 1000) : undefined,
  };
  cookieStore.set(LOGIN_GUARD_COOKIE, await writeGuardState(nextState), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearLoginGuard() {
  const cookieStore = await cookies();
  cookieStore.set(LOGIN_GUARD_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

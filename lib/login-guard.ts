import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/env';

const LOGIN_GUARD_COOKIE = 'gadstyle_login_guard';
const MAX_LOGIN_FAILURES = 5;
const MAX_VERIFY_FAILURES = 6;
const LOCK_MINUTES = 15;

type StageKey = 'login' | 'verify';

type GuardState = {
  loginAttempts: number;
  verifyAttempts: number;
  loginLockUntil?: number;
  verifyLockUntil?: number;
  lastIp?: string;
  lastUsername?: string;
};

function getSecretKey() {
  return new TextEncoder().encode(`${env.sessionSecret}:login-guard`);
}

async function readGuardState(raw?: string | null): Promise<GuardState> {
  if (!raw) return { loginAttempts: 0, verifyAttempts: 0 };
  try {
    const result = await jwtVerify(raw, getSecretKey());
    return {
      loginAttempts: Number(result.payload.loginAttempts || 0),
      verifyAttempts: Number(result.payload.verifyAttempts || 0),
      loginLockUntil: result.payload.loginLockUntil ? Number(result.payload.loginLockUntil) : undefined,
      verifyLockUntil: result.payload.verifyLockUntil ? Number(result.payload.verifyLockUntil) : undefined,
      lastIp: result.payload.lastIp ? String(result.payload.lastIp) : undefined,
      lastUsername: result.payload.lastUsername ? String(result.payload.lastUsername) : undefined,
    };
  } catch {
    return { loginAttempts: 0, verifyAttempts: 0 };
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

async function getState() {
  const cookieStore = await cookies();
  return readGuardState(cookieStore.get(LOGIN_GUARD_COOKIE)?.value || null);
}

async function setState(nextState: GuardState) {
  const cookieStore = await cookies();
  cookieStore.set(LOGIN_GUARD_COOKIE, await writeGuardState(nextState), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getLoginGuardStatus(request: NextRequest, stage: StageKey = 'login') {
  const state = await getState();
  const now = Date.now();
  const retryAt = stage === 'login' ? state.loginLockUntil : state.verifyLockUntil;
  return {
    isLocked: Boolean(retryAt && retryAt > now),
    retryAt,
    attempts: stage === 'login' ? state.loginAttempts : state.verifyAttempts,
  };
}

export async function registerFailedLogin(request: NextRequest, stage: StageKey = 'login', username = '') {
  const state = await getState();
  const ip = getClientIp(request);
  const sameActor = (!state.lastIp || state.lastIp === ip) && (!username || !state.lastUsername || state.lastUsername === username);
  const loginAttempts = stage === 'login'
    ? (sameActor ? state.loginAttempts + 1 : 1)
    : state.loginAttempts;
  const verifyAttempts = stage === 'verify'
    ? (sameActor ? state.verifyAttempts + 1 : 1)
    : state.verifyAttempts;

  const nextState: GuardState = {
    loginAttempts,
    verifyAttempts,
    lastIp: ip,
    lastUsername: username || state.lastUsername,
    loginLockUntil: stage === 'login' && loginAttempts >= MAX_LOGIN_FAILURES
      ? Date.now() + (LOCK_MINUTES * 60 * 1000)
      : state.loginLockUntil,
    verifyLockUntil: stage === 'verify' && verifyAttempts >= MAX_VERIFY_FAILURES
      ? Date.now() + (LOCK_MINUTES * 60 * 1000)
      : state.verifyLockUntil,
  };
  await setState(nextState);
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

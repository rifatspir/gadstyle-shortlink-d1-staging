import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export const SESSION_COOKIE = 'gadstyle_admin_session';
export const PREAUTH_COOKIE = 'gadstyle_admin_preauth';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const PREAUTH_DURATION_SECONDS = 60 * 10;

function getSecretKey() {
  return new TextEncoder().encode(env.sessionSecret);
}

export async function createSessionToken(username: string) {
  return new SignJWT({ role: 'admin', username, stage: 'full', sid: crypto.randomUUID() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function createPreAuthToken(username: string, nextPath: string) {
  return new SignJWT({ role: 'admin', username, stage: 'preauth', nextPath, nonce: crypto.randomUUID() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${PREAUTH_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const result = await jwtVerify(token, getSecretKey());
    return result.payload.role === 'admin' && result.payload.stage === 'full';
  } catch {
    return false;
  }
}

export async function readPreAuthToken(token: string) {
  try {
    const result = await jwtVerify(token, getSecretKey());
    if (result.payload.role === 'admin' && result.payload.stage === 'preauth') {
      return {
        username: String(result.payload.username || ''),
        nextPath: String(result.payload.nextPath || '/admin'),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function buildCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, buildCookieOptions(SESSION_DURATION_SECONDS));
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', buildCookieOptions(0));
}

export async function setPreAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(PREAUTH_COOKIE, token, buildCookieOptions(PREAUTH_DURATION_SECONDS));
}

export async function clearPreAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(PREAUTH_COOKIE, '', buildCookieOptions(0));
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const valid = await verifySessionToken(token);
  return valid ? { isAuthenticated: true } : null;
}

export async function getPreAuthFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PREAUTH_COOKIE)?.value;
  if (!token) return null;
  return readPreAuthToken(token);
}

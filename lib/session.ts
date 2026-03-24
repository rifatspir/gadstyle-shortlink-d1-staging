import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export const SESSION_COOKIE = 'gadstyle_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey() {
  return new TextEncoder().encode(env.sessionSecret);
}

export async function createSessionToken(username: string) {
  return new SignJWT({ role: 'admin', username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const result = await jwtVerify(token, getSecretKey());
    return result.payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const valid = await verifySessionToken(token);
  return valid ? { isAuthenticated: true } : null;
}

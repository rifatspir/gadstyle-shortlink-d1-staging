import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/session';

const protectedPrefixes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (pathname === '/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('gadstyle_admin_session')?.value;
  const valid = token ? await verifySessionToken(token) : false;

  if (valid) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

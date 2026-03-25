import { NextRequest } from 'next/server';

function getClientIp(request?: NextRequest | null) {
  if (!request) return 'unknown';
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function logAdminAuthEvent(event: string, details: Record<string, unknown> = {}, request?: NextRequest | null) {
  const payload = {
    scope: 'admin-auth',
    event,
    ip: getClientIp(request),
    timestamp: new Date().toISOString(),
    ...details,
  };
  console.info(JSON.stringify(payload));
}

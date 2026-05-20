export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DEVICES = new Set(['desktop', 'unknown']);

const normalizeSource = (value: string | null) => {
  if (!value) return 'direct';
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).hostname.replace(/^www\./, '').toLowerCase() || 'direct';
    } catch {
      return 'direct';
    }
  }
  return value.toLowerCase().replace(/[^a-z0-9._:-]/g, '').slice(0, 120) || 'direct';
};

async function forwardFallbackEvent(body: { destination: 'fallback'; device_type: 'desktop' | 'unknown'; source: string }) {
  const apiBaseUrl = process.env.SHORTLINK_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!apiBaseUrl) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    const secret = process.env.SMART_DOWNLOAD_LOG_SECRET?.trim();
    if (secret) headers['x-smart-download-secret'] = secret;

    await fetch(`${apiBaseUrl}/api/download-events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const destination = raw && typeof raw === 'object' && 'destination' in raw ? String(raw.destination) : '';
  const requestedDeviceType = raw && typeof raw === 'object' && 'device_type' in raw ? String(raw.device_type) : 'unknown';
  const requestedSource = raw && typeof raw === 'object' && 'source' in raw ? String(raw.source) : null;

  if (destination !== 'fallback') {
    return NextResponse.json({ error: 'Only fallback logging is allowed from the public app endpoint.' }, { status: 400 });
  }

  const deviceType = ALLOWED_DEVICES.has(requestedDeviceType) ? requestedDeviceType as 'desktop' | 'unknown' : 'unknown';
  const source = normalizeSource(requestedSource || request.headers.get('referer'));

  try {
    await forwardFallbackEvent({ destination: 'fallback', device_type: deviceType, source });
  } catch {
    // Best-effort logging. The public page should never fail because reporting failed.
  }

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}

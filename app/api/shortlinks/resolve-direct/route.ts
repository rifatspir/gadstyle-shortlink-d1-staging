export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { resolveDirectRoute } from '@/lib/links';
import { serializeShortLinkResponse } from '@/lib/public-shortlinks';
import { resolveDirectRouteViaWorker } from '@/lib/worker-shortlinks';
import type { SupportedTargetType } from '@/lib/links';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

function normalizeTargetType(value: string | null): SupportedTargetType | null {
  if (value === 'product' || value === 'category' || value === 'brand') return value;
  return null;
}

function normalizeTargetId(value: string | null) {
  const normalized = (value || '').trim();
  return /^\d+$/.test(normalized) ? normalized : null;
}

export async function GET(request: NextRequest) {
  const targetType = normalizeTargetType(request.nextUrl.searchParams.get('target_type'));
  const targetId = normalizeTargetId(request.nextUrl.searchParams.get('target_id'));

  if (!targetType || !targetId) {
    return NextResponse.json(
      { error: 'Missing or invalid target_type/target_id.' },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  if (env.shortlinkApiBaseUrl) {
    try {
      const shortLink = await resolveDirectRouteViaWorker(targetType, targetId);
      return NextResponse.json(
        {
          code: shortLink.code,
          short_url: `${env.appBaseUrl.replace(/\/$/, '')}/s/${shortLink.code}`,
          app_url: `${env.appBaseUrl.replace(/\/$/, '')}${shortLink.app_path}`,
          canonical_url: shortLink.web_url,
          app_path: shortLink.app_path,
          target_type: shortLink.entity_type,
          target_id: shortLink.entity_id,
          is_active: shortLink.is_active,
        },
        { headers: NO_STORE_HEADERS },
      );
    } catch {
      return NextResponse.json(
        { error: 'Shortlink not found.' },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }
  }

  const shortLink = await resolveDirectRoute(targetType, targetId);

  if (!shortLink) {
    return NextResponse.json(
      { error: 'Shortlink not found.' },
      { status: 404, headers: NO_STORE_HEADERS },
    );
  }

  return NextResponse.json(
    {
      ...serializeShortLinkResponse(shortLink),
      is_active: shortLink.isActive,
    },
    { headers: NO_STORE_HEADERS },
  );
}

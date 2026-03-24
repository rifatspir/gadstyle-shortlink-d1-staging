export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { resolveShortCode } from '@/lib/links';
import { serializeShortLinkResponse } from '@/lib/public-shortlinks';
import { publicResolveSchema } from '@/lib/public-validations';
import { resolveShortCodeViaWorker } from '@/lib/worker-shortlinks';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(request: NextRequest) {
  const parsed = publicResolveSchema.safeParse({
    code: request.nextUrl.searchParams.get('code') || '',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing shortlink code.' },
      {
        status: 400,
        headers: NO_STORE_HEADERS,
      },
    );
  }

  if (env.shortlinkApiBaseUrl) {
    try {
      const shortLink = await resolveShortCodeViaWorker(parsed.data.code);
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

  const shortLink = await resolveShortCode(parsed.data.code);

  if (!shortLink) {
    return NextResponse.json(
      { error: 'Shortlink not found.' },
      {
        status: 404,
        headers: NO_STORE_HEADERS,
      },
    );
  }

  return NextResponse.json(
    {
      ...serializeShortLinkResponse(shortLink),
      is_active: shortLink.isActive,
    },
    {
      headers: NO_STORE_HEADERS,
    },
  );
}

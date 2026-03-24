export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { resolveShortCode } from '@/lib/links';
import { serializeShortLinkResponse } from '@/lib/public-shortlinks';
import { publicResolveSchema } from '@/lib/public-validations';

export async function GET(request: NextRequest) {
  const parsed = publicResolveSchema.safeParse({
    code: request.nextUrl.searchParams.get('code') || '',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing shortlink code.' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  }

  const shortLink = await resolveShortCode(parsed.data.code);

  if (!shortLink) {
    return NextResponse.json(
      { error: 'Shortlink not found.' },
      {
        status: 404,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  }

  return NextResponse.json(
    {
      ...serializeShortLinkResponse(shortLink),
      is_active: shortLink.isActive,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  );
}

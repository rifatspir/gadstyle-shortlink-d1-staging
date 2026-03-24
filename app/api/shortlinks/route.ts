export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createOrReuseShortLink, serializeShortLinkResponse } from '@/lib/public-shortlinks';
import { publicShortLinkSchema } from '@/lib/public-validations';

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const parsed = publicShortLinkSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please send a valid Gadstyle product, category, or brand target.' },
      { status: 400 },
    );
  }

  const result = await createOrReuseShortLink(parsed.data);

  return NextResponse.json(
    {
      ...serializeShortLinkResponse(result.link),
      reused: result.reused,
      healed: result.healed,
    },
    {
      status: result.reused ? 200 : 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  );
}

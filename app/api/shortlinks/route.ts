export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { publicShortLinkSchema } from '@/lib/public-validations';
import { env } from '@/lib/env';
import { createShortlinkViaWorker } from '@/lib/worker-shortlinks';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const parsed = publicShortLinkSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please send a valid Gadstyle product, category, or brand target.' },
      { status: 400 },
    );
  }

  try {
    const shortLink = await createShortlinkViaWorker({
      code: undefined,
      entity_type: parsed.data.targetType,
      entity_id: parsed.data.targetId,
      web_url: parsed.data.canonicalUrl,
      source: 'vercel-public-api',
      notes: 'public-create',
    });

    return NextResponse.json(
      {
        code: shortLink.code,
        short_url: `${env.appBaseUrl.replace(/\/$/, '')}/s/${shortLink.code}`,
        app_url: `${env.appBaseUrl.replace(/\/$/, '')}${shortLink.app_path}`,
        canonical_url: shortLink.web_url,
        app_path: shortLink.app_path,
        target_type: shortLink.entity_type,
        target_id: shortLink.entity_id,
        reused: false,
        healed: false,
      },
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Worker create failed.' },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

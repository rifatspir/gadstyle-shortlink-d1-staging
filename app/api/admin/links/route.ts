import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { normalizeCode } from '@/lib/utils';
import { shortLinkSchema } from '@/lib/validations';
import { getSessionFromCookies } from '@/lib/session';
import { createShortlinkViaWorker } from '@/lib/worker-shortlinks';
import { fetchWorkerAdminLinks } from '@/lib/worker-admin';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const search = (request.nextUrl.searchParams.get('q') || '').trim();
  const page = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  const pageSize = Number.parseInt(request.nextUrl.searchParams.get('page_size') || '20', 10);

  try {
    const data = await fetchWorkerAdminLinks(
      search,
      Number.isFinite(page) && page > 0 ? page : 1,
      Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    );

    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load links.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = shortLinkSchema.safeParse(raw);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue?.message || 'Please fill the form correctly.' }, { status: 400 });
  }

  const data = parsed.data;
  const code = normalizeCode(data.code);

  try {
    const created = await createShortlinkViaWorker({
      code,
      entity_type: data.target_type,
      entity_id: data.target_id,
      web_url: data.canonical_url,
      source: 'vercel-admin-primary',
      notes: 'admin-create',
    });

    return NextResponse.json({
      id: created.id,
      shortUrl: `${env.appBaseUrl.replace(/\/$/, '')}/s/${created.code}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Worker create failed.' }, { status: 500 });
  }
}

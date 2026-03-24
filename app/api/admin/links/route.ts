
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { normalizeCode } from '@/lib/utils';
import { shortLinkSchema } from '@/lib/validations';
import { getSessionFromCookies } from '@/lib/session';
import { createShortlinkViaWorker } from '@/lib/worker-shortlinks';

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

  if (env.shortlinkApiBaseUrl) {
    try {
      const created = await createShortlinkViaWorker({
        code,
        entity_type: data.target_type,
        entity_id: data.target_id,
        web_url: data.canonical_url,
        source: 'vercel-admin-primary',
        notes: 'phase4-admin-primary',
      });

      return NextResponse.json({
        id: created.id,
        shortUrl: `${env.appBaseUrl.replace(/\/$/, '')}/s/${created.code}`,
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Worker create failed.' }, { status: 500 });
    }
  }

  try {
    const created = await prisma.shortLink.create({
      data: {
        code,
        targetType: data.target_type,
        targetId: data.target_id,
        targetSlug: data.target_slug || null,
        canonicalUrl: data.canonical_url,
        appPath: data.app_path || null,
        isActive: data.is_active,
      },
    });

    return NextResponse.json({
      id: created.id,
      shortUrl: `${env.appBaseUrl.replace(/\/$/, '')}/s/${created.code}`,
    });
  } catch {
    return NextResponse.json({ error: 'This code may already exist.' }, { status: 409 });
  }
}

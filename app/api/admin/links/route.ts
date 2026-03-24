import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { normalizeCode } from '@/lib/utils';
import { shortLinkSchema } from '@/lib/validations';
import { getSessionFromCookies } from '@/lib/session';

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = shortLinkSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Please fill the form correctly with a trusted Gadstyle URL.' }, { status: 400 });
  }

  const data = parsed.data;
  const code = normalizeCode(data.code);

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

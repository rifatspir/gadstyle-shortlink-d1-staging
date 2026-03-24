import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { normalizeCode } from '@/lib/utils';
import type { SupportedTargetType } from '@/lib/links';

export type PublicTargetType = SupportedTargetType;

function slugify(value: string) {
  return normalizeCode(
    value
      .replace(/[^a-zA-Z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

export function buildDefaultAppPath(targetType: PublicTargetType, targetId: string) {
  if (targetType === 'product') return `/p/${targetId}`;
  if (targetType === 'category') return `/c/${targetId}`;
  return `/b/${targetId}`;
}

const MAX_CODE_LENGTH = 80;
const MAX_SUFFIX_LENGTH = 4;

function buildDefaultCode(targetType: PublicTargetType, targetId: string, targetSlug?: string | null) {
  const slug = slugify(targetSlug || '');
  const prefix = targetType === 'product' ? 'p' : targetType === 'category' ? 'c' : 'b';
  const fallback = normalizeCode(`${prefix}-${targetId}`);
  if (!slug) return fallback;

  const reservedLength = prefix.length + 1 + 1 + targetId.length + MAX_SUFFIX_LENGTH;
  const slugBudget = Math.max(0, MAX_CODE_LENGTH - reservedLength);
  const trimmedSlug = slugBudget > 0 ? slug.slice(0, slugBudget).replace(/-+$/g, '') : '';
  return normalizeCode(trimmedSlug ? `${prefix}-${trimmedSlug}-${targetId}` : `${prefix}-${targetId}`);
}

export async function findReusableShortLink(targetType: PublicTargetType, targetId: string) {
  return prisma.shortLink.findFirst({
    where: {
      targetType,
      targetId,
      isActive: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

async function reserveUniqueCode(baseCode: string) {
  const normalizedBase = normalizeCode(baseCode);
  let code = normalizedBase;
  let suffix = 1;

  while (true) {
    const existing = await prisma.shortLink.findUnique({ where: { code } });
    if (!existing) {
      return code;
    }
    suffix += 1;
    code = `${normalizedBase}-${suffix}`;
  }
}

function normalizeNullableString(value?: string | null) {
  const normalized = (value || '').trim();
  return normalized || null;
}

function needsSelfHeal(existing: {
  targetSlug: string | null;
  canonicalUrl: string;
  appPath: string | null;
}, desired: {
  targetSlug: string | null;
  canonicalUrl: string;
  appPath: string | null;
}) {
  return (
    normalizeNullableString(existing.targetSlug) !== normalizeNullableString(desired.targetSlug) ||
    existing.canonicalUrl.trim() !== desired.canonicalUrl.trim() ||
    normalizeNullableString(existing.appPath) !== normalizeNullableString(desired.appPath)
  );
}

export async function createOrReuseShortLink(params: {
  targetType: PublicTargetType;
  targetId: string;
  targetSlug?: string | null;
  canonicalUrl: string;
  appPath?: string | null;
}) {
  const desiredAppPath = buildDefaultAppPath(params.targetType, params.targetId);
  const desiredTargetSlug = normalizeNullableString(params.targetSlug);
  const desiredCanonicalUrl = params.canonicalUrl.trim();

  const existing = await findReusableShortLink(params.targetType, params.targetId);
  if (existing) {
    if (needsSelfHeal(existing, {
      targetSlug: desiredTargetSlug,
      canonicalUrl: desiredCanonicalUrl,
      appPath: desiredAppPath,
    })) {
      const healed = await prisma.shortLink.update({
        where: { id: existing.id },
        data: {
          targetSlug: desiredTargetSlug,
          canonicalUrl: desiredCanonicalUrl,
          appPath: desiredAppPath,
        },
      });

      return {
        link: healed,
        reused: true,
        healed: true,
      };
    }

    return {
      link: existing,
      reused: true,
      healed: false,
    };
  }

  const desiredCode = buildDefaultCode(params.targetType, params.targetId, desiredTargetSlug);
  const code = await reserveUniqueCode(desiredCode);

  const created = await prisma.shortLink.create({
    data: {
      code,
      targetType: params.targetType,
      targetId: params.targetId,
      targetSlug: desiredTargetSlug,
      canonicalUrl: desiredCanonicalUrl,
      appPath: desiredAppPath,
      isActive: true,
    },
  });

  return {
    link: created,
    reused: false,
    healed: false,
  };
}

export function serializeShortLinkResponse(shortLink: {
  code: string;
  canonicalUrl: string;
  appPath: string | null;
  targetType: string;
  targetId: string;
}) {
  const appBase = env.appBaseUrl.replace(/\/$/, '');
  return {
    code: shortLink.code,
    short_url: shortLink.appPath ? `${appBase}${shortLink.appPath}` : `${appBase}/s/${shortLink.code}`,
    app_url: shortLink.appPath ? `${appBase}${shortLink.appPath}` : null,
    canonical_url: shortLink.canonicalUrl,
    app_path: shortLink.appPath,
    target_type: shortLink.targetType,
    target_id: shortLink.targetId,
  };
}

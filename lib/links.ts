import { prisma } from '@/lib/prisma';
import { normalizeCode } from '@/lib/utils';

export type SupportedTargetType = 'product' | 'category' | 'brand';
export type SupportedRouteType = 'short_code' | 'direct_product' | 'direct_category' | 'direct_brand';

export async function resolveShortCode(code: string) {
  const normalized = normalizeCode(code);
  return prisma.shortLink.findUnique({
    where: { code: normalized },
  });
}

export async function resolveDirectRoute(targetType: SupportedTargetType, targetId: string) {
  return prisma.shortLink.findFirst({
    where: {
      targetType,
      targetId,
      isActive: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function logClick(shortLinkId: string, routeType: SupportedRouteType, req?: Request) {
  const forwardedFor = req?.headers.get('x-forwarded-for') || '';
  const userAgent = req?.headers.get('user-agent') || '';
  const referer = req?.headers.get('referer') || '';
  const ipAddress = forwardedFor.split(',')[0]?.trim() || null;

  await prisma.$transaction([
    prisma.shortLink.update({
      where: { id: shortLinkId },
      data: { clickCount: { increment: 1 } },
    }),
    prisma.clickEvent.create({
      data: {
        shortLinkId,
        routeType,
        ipAddress,
        userAgent: userAgent || null,
        referer: referer || null,
      },
    }),
  ]);
}

import type { SupportedRouteType, SupportedTargetType } from '@/lib/shortlink-contract';
import { buildDefaultAppPath } from '@/lib/shortlink-contract';
import { resolveDirectRouteViaWorker, resolveShortCodeViaWorker } from '@/lib/worker-shortlinks';

export type LandingPayload = {
  appPath: string;
  canonicalUrl: string;
  routeType: SupportedRouteType;
  headline: string;
};

export async function resolveLandingForDirectRoute(params: {
  targetType: SupportedTargetType;
  targetId: string;
  request: Request;
}): Promise<LandingPayload | null> {
  const routeType: SupportedRouteType =
    params.targetType === 'product'
      ? 'direct_product'
      : params.targetType === 'category'
        ? 'direct_category'
        : 'direct_brand';

  try {
    const shortLink = await resolveDirectRouteViaWorker(params.targetType, params.targetId);
    if (!shortLink || !shortLink.is_active) return null;

    return {
      appPath: shortLink.app_path || buildDefaultAppPath(params.targetType, params.targetId),
      canonicalUrl: shortLink.web_url || 'https://www.gadstyle.com/',
      routeType,
      headline: buildHeadline(params.targetType),
    };
  } catch {
    return null;
  }
}

export async function resolveLandingForShortCode(params: {
  code: string;
  request: Request;
}): Promise<LandingPayload | null> {
  try {
    const shortLink = await resolveShortCodeViaWorker(params.code);
    if (!shortLink || !shortLink.is_active) return null;

    const targetType = shortLink.entity_type as SupportedTargetType;
    return {
      appPath: shortLink.app_path || buildDefaultAppPath(targetType, shortLink.entity_id),
      canonicalUrl: shortLink.web_url || 'https://www.gadstyle.com/',
      routeType: 'short_code',
      headline: buildHeadline(targetType),
    };
  } catch {
    return null;
  }
}

function buildHeadline(targetType: SupportedTargetType) {
  if (targetType === 'product') return 'Open this product in the Gadstyle app';
  if (targetType === 'category') return 'Open this category in the Gadstyle app';
  return 'Open this brand in the Gadstyle app';
}

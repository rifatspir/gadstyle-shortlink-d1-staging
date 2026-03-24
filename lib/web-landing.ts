import { logClick, resolveDirectRoute, resolveShortCode, type SupportedRouteType, type SupportedTargetType } from "@/lib/links";

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
  const shortLink = await resolveDirectRoute(params.targetType, params.targetId);

  if (!shortLink) return null;

  const routeType: SupportedRouteType =
    params.targetType === "product"
      ? "direct_product"
      : params.targetType === "category"
        ? "direct_category"
        : "direct_brand";

  await logClick(shortLink.id, routeType, params.request);

  return {
    appPath: shortLink.appPath || defaultAppPath(params.targetType, params.targetId),
    canonicalUrl: shortLink.canonicalUrl,
    routeType,
    headline: buildHeadline(params.targetType),
  };
}

export async function resolveLandingForShortCode(params: {
  code: string;
  request: Request;
}): Promise<LandingPayload | null> {
  const shortLink = await resolveShortCode(params.code);

  if (!shortLink || !shortLink.isActive) return null;

  await logClick(shortLink.id, "short_code", params.request);

  const targetType = shortLink.targetType as SupportedTargetType;

  return {
    appPath: shortLink.appPath || defaultAppPath(targetType, shortLink.targetId),
    canonicalUrl: shortLink.canonicalUrl,
    routeType: "short_code",
    headline: buildHeadline(targetType),
  };
}

function defaultAppPath(targetType: SupportedTargetType, targetId: string) {
  if (targetType === "product") return `/p/${targetId}`;
  if (targetType === "category") return `/c/${targetId}`;
  return `/b/${targetId}`;
}

function buildHeadline(targetType: SupportedTargetType) {
  if (targetType === "product") return "Open this product in the Gadstyle app";
  if (targetType === "category") return "Open this category in the Gadstyle app";
  return "Open this brand in the Gadstyle app";
}

export type SupportedTargetType = 'product' | 'category' | 'brand';
export type SupportedRouteType = 'short_code' | 'direct_product' | 'direct_category' | 'direct_brand';

export function buildDefaultAppPath(targetType: SupportedTargetType, targetId: string) {
  if (targetType === 'product') return `/p/${targetId}`;
  if (targetType === 'category') return `/c/${targetId}`;
  return `/b/${targetId}`;
}

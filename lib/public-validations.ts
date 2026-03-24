import { z } from 'zod';
import { buildDefaultAppPath } from '@/lib/public-shortlinks';

const allowedCanonicalHosts = ['gadstyle.com', 'www.gadstyle.com', 'app.gadstyle.com'];

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function isTrustedGadstyleUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (!allowedCanonicalHosts.includes(parsed.hostname)) return false;
    if (!/^https?:$/.test(parsed.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

function hasExpectedPathForType(value: string, targetType: 'product' | 'category' | 'brand') {
  try {
    const pathname = new URL(value).pathname.replace(/\/+$/, '') || '/';
    if (targetType === 'product') return /^\/item\/\d+(?:\/.*)?$/.test(pathname);
    if (targetType === 'category') return /^\/category\/.+\/\d+$/.test(pathname);
    if (targetType === 'brand') return /^\/brand\/.+\/\d+$/.test(pathname);
    return false;
  } catch {
    return false;
  }
}

const createSchemaBase = z.object({
  target_type: z.enum(['product', 'category', 'brand']),
  target_id: z.preprocess(cleanString, z.string().min(1).max(64)),
  target_slug: z.preprocess(cleanString, z.string().max(255).optional().or(z.literal(''))),
  canonical_url: z.preprocess(
    cleanString,
    z.string().url().refine((value) => isTrustedGadstyleUrl(value), 'Use a trusted Gadstyle URL.'),
  ),
  app_path: z.preprocess(cleanString, z.string().max(255).optional().or(z.literal(''))),
}).superRefine((data, ctx) => {
  if (!hasExpectedPathForType(data.canonical_url, data.target_type)) {
    const message = data.target_type === 'product'
      ? 'Product URL must look like https://www.gadstyle.com/item/{id}/{slug}/'
      : data.target_type === 'category'
        ? 'Category URL must look like https://www.gadstyle.com/category/.../{id}/'
        : 'Brand URL must look like https://www.gadstyle.com/brand/{slug}/{id}/';

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['canonical_url'],
      message,
    });
  }

  if (data.app_path) {
    const expectedPrefix = data.target_type === 'product' ? '/p/' : data.target_type === 'category' ? '/c/' : '/b/';
    if (!data.app_path.startsWith(expectedPrefix)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['app_path'],
        message: `App path must start with ${expectedPrefix}`,
      });
    }
  }
});

export const publicShortLinkSchema = createSchemaBase.transform((data) => ({
  targetType: data.target_type,
  targetId: data.target_id,
  targetSlug: data.target_slug || null,
  canonicalUrl: data.canonical_url,
  appPath: data.app_path || buildDefaultAppPath(data.target_type, data.target_id),
}));

export const publicResolveSchema = z.object({
  code: z.string().min(2).max(80),
});

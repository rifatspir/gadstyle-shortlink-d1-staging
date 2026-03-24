import { z } from 'zod';
import { shortLinkSchema } from '@/lib/validations';
import { buildDefaultAppPath } from '@/lib/public-shortlinks';

const createSchemaBase = shortLinkSchema.pick({
  target_type: true,
  target_id: true,
  target_slug: true,
  canonical_url: true,
  app_path: true,
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

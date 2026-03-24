import { z } from 'zod';

const allowedCanonicalHosts = ['gadstyle.com', 'www.gadstyle.com', 'app.gadstyle.com'];

const canonicalUrlSchema = z.string().url().refine((value) => {
  try {
    const parsed = new URL(value);
    return allowedCanonicalHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}, 'Use a trusted Gadstyle URL.');

export const shortLinkSchema = z.object({
  code: z.string().min(2).max(80),
  target_type: z.enum(['product', 'category', 'brand']),
  target_id: z.string().min(1).max(64),
  target_slug: z.string().max(255).optional().or(z.literal('')),
  canonical_url: canonicalUrlSchema,
  app_path: z.string().max(255).optional().or(z.literal('')),
  is_active: z.preprocess((value) => value === 'on' || value === true, z.boolean()),
});

export type ShortLinkInput = z.infer<typeof shortLinkSchema>;

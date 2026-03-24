-- Add first-class brand support without changing existing product/category links.
ALTER TYPE "TargetType" ADD VALUE IF NOT EXISTS 'brand';
ALTER TYPE "RouteType" ADD VALUE IF NOT EXISTS 'direct_brand';

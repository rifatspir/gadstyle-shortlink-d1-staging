-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('product', 'category');

-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('short_code', 'direct_product', 'direct_category');

-- CreateTable
CREATE TABLE "ShortLink" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" VARCHAR(64) NOT NULL,
    "targetSlug" VARCHAR(255),
    "canonicalUrl" TEXT NOT NULL,
    "appPath" VARCHAR(255),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "shortLinkId" TEXT NOT NULL,
    "routeType" "RouteType" NOT NULL,
    "ipAddress" VARCHAR(64),
    "userAgent" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_code_key" ON "ShortLink"("code");

-- CreateIndex
CREATE INDEX "ShortLink_targetType_targetId_idx" ON "ShortLink"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ShortLink_isActive_updatedAt_idx" ON "ShortLink"("isActive", "updatedAt");

-- CreateIndex
CREATE INDEX "ClickEvent_shortLinkId_createdAt_idx" ON "ClickEvent"("shortLinkId", "createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_createdAt_idx" ON "ClickEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_shortLinkId_fkey" FOREIGN KEY ("shortLinkId") REFERENCES "ShortLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

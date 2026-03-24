import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/StatCard';
import { LinksTable } from '@/components/LinksTable';
import { RecentClicks } from '@/components/RecentClicks';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const search = (params.q || '').trim();

  const where = search
    ? {
        OR: [
          { code: { contains: search, mode: 'insensitive' as const } },
          { canonicalUrl: { contains: search, mode: 'insensitive' as const } },
          { targetId: { contains: search, mode: 'insensitive' as const } },
          { targetSlug: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [totalLinks, totalClicksAggregate, recentClicksCount, links, recentClicks] = await Promise.all([
    prisma.shortLink.count(),
    prisma.shortLink.aggregate({ _sum: { clickCount: true } }),
    prisma.clickEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } } }),
    prisma.shortLink.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 25,
    }),
    prisma.clickEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        shortLink: {
          select: { code: true, targetType: true, targetId: true },
        },
      },
    }),
  ]);

  return (
    <section className="dashboard-grid">
      <div className="stats-grid">
        <StatCard label="Total links" value={totalLinks} hint="All product, category, and brand shortlinks." />
        <StatCard label="Total clicks" value={totalClicksAggregate._sum.clickCount ?? 0} hint="Stored on each shortlink record." />
        <StatCard label="Recent clicks" value={recentClicksCount} hint="Clicks from the last 7 days." />
      </div>

      <LinksTable links={links} search={search} />
      <RecentClicks clicks={recentClicks} />
    </section>
  );
}

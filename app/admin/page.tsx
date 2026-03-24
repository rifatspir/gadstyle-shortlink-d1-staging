
import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/StatCard';
import { LinksTable, type AdminLinkRow } from '@/components/LinksTable';
import { RecentClicks, type AdminRecentClickRow } from '@/components/RecentClicks';
import { env } from '@/lib/env';
import { fetchWorkerAdminLinks, fetchWorkerAdminStats, fetchWorkerRecentClicks } from '@/lib/worker-admin';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const search = (params.q || '').trim();

  if (env.shortlinkApiBaseUrl) {
    const [stats, links, recentClicks] = await Promise.all([
      fetchWorkerAdminStats(),
      fetchWorkerAdminLinks(search),
      fetchWorkerRecentClicks(),
    ]);

    return (
      <section className="dashboard-grid">
        <div className="stats-grid">
          <StatCard label="Total links" value={stats.totalLinks} hint="All product, category, and brand shortlinks in D1." />
          <StatCard label="Total clicks" value={stats.totalClicks} hint="D1 click analytics are optional in this phase and may remain 0." />
          <StatCard label="Recent clicks" value={stats.recentClicks} hint="Recent click activity from D1." />
        </div>

        <LinksTable links={links as AdminLinkRow[]} search={search} />
        <RecentClicks clicks={recentClicks as AdminRecentClickRow[]} />
      </section>
    );
  }

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

      <LinksTable links={links as AdminLinkRow[]} search={search} />
      <RecentClicks clicks={recentClicks as AdminRecentClickRow[]} />
    </section>
  );
}

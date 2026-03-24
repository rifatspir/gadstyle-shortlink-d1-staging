'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatCard } from '@/components/StatCard';
import { LinksTable, type AdminLinkRow } from '@/components/LinksTable';
import { RecentClicks, type AdminRecentClickRow } from '@/components/RecentClicks';
import type { WorkerAdminPagination, WorkerAdminStats } from '@/lib/worker-admin';

type LinksResponse = {
  links: AdminLinkRow[];
  pagination: WorkerAdminPagination;
};

const DEFAULT_PAGE_SIZE = 20;

export function AdminDashboardClient({ initialSearch = '' }: { initialSearch?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [page, setPage] = useState(() => {
    const current = Number.parseInt(searchParams.get('page') || '1', 10);
    return Number.isFinite(current) && current > 0 ? current : 1;
  });

  const [stats, setStats] = useState<WorkerAdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [linksData, setLinksData] = useState<LinksResponse | null>(null);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);

  const [recentClicks, setRecentClicks] = useState<AdminRecentClickRow[]>([]);
  const [recentClicksLoading, setRecentClicksLoading] = useState(true);
  const [recentClicksError, setRecentClicksError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const updateUrl = useCallback((nextSearch: string, nextPage: number) => {
    const params = new URLSearchParams();
    if (nextSearch) params.set('q', nextSearch);
    if (nextPage > 1) params.set('page', String(nextPage));
    const query = params.toString();
    router.replace(query ? `/admin?${query}` : '/admin');
  }, [router]);

  useEffect(() => {
    if (searchInput === activeSearch) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      setActiveSearch(searchInput.trim());
      setPage(1);
      updateUrl(searchInput.trim(), 1);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchInput, activeSearch, updateUrl]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load stats.');
      setStats(data);
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Could not load stats.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadLinks = useCallback(async () => {
    setLinksLoading(true);
    setLinksError(null);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(DEFAULT_PAGE_SIZE) });
      if (activeSearch) params.set('q', activeSearch);
      const response = await fetch(`/api/admin/links?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load links.');
      setLinksData(data);
    } catch (error) {
      setLinksError(error instanceof Error ? error.message : 'Could not load links.');
    } finally {
      setLinksLoading(false);
    }
  }, [activeSearch, page]);

  const loadRecentClicks = useCallback(async () => {
    setRecentClicksLoading(true);
    setRecentClicksError(null);
    try {
      const response = await fetch('/api/admin/recent-clicks?limit=20', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load recent clicks.');
      setRecentClicks(data);
    } catch (error) {
      setRecentClicksError(error instanceof Error ? error.message : 'Could not load recent clicks.');
    } finally {
      setRecentClicksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadRecentClicks();
    const interval = window.setInterval(() => {
      loadStats();
      loadRecentClicks();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [loadRecentClicks, loadStats]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const statsCards = useMemo(() => ({
    totalLinks: stats?.totalLinks ?? '—',
    totalClicks: stats?.totalClicks ?? '—',
    recentClicks: stats?.recentClicks ?? '—',
  }), [stats]);

  return (
    <section className="dashboard-grid">
      <div className="stats-grid">
        <StatCard label="Total links" value={statsCards.totalLinks} hint={statsLoading ? 'Refreshing…' : statsError || 'All product, category, and brand shortlinks in D1.'} />
        <StatCard label="Total clicks" value={statsCards.totalClicks} hint={statsLoading ? 'Refreshing…' : statsError || 'Aggregate click counts stored on shortlinks.'} />
        <StatCard label="Recent clicks" value={statsCards.recentClicks} hint={statsLoading ? 'Refreshing…' : statsError || 'Recent click rows retained in lightweight rolling history.'} />
      </div>

      <LinksTable
        links={linksData?.links || []}
        search={searchInput}
        loading={linksLoading}
        error={linksError}
        pagination={linksData?.pagination}
        onSearchChange={setSearchInput}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          updateUrl(activeSearch, nextPage);
        }}
      />

      <RecentClicks clicks={recentClicks} loading={recentClicksLoading} error={recentClicksError} />
    </section>
  );
}

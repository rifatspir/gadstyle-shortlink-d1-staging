import { env } from '@/lib/env';

export type WorkerAdminLink = {
  id: number;
  code: string;
  targetType: 'product' | 'category' | 'brand';
  targetId: string;
  clickCount: number;
  isActive: boolean;
  updatedAt: string;
  canonicalUrl: string | null;
};

export type WorkerAdminClick = {
  id: number;
  createdAt: string;
  routeType: string;
  shortLink: {
    code: string;
    targetType: 'product' | 'category' | 'brand';
    targetId: string;
  };
};

export type WorkerAdminStats = {
  totalLinks: number;
  totalClicks: number;
  recentClicks: number;
};

export type WorkerAdminPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

function getWorkerBaseUrl() {
  if (!env.shortlinkApiBaseUrl) {
    throw new Error('SHORTLINK_API_BASE_URL is not configured.');
  }
  return env.shortlinkApiBaseUrl;
}

async function readWorkerJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getWorkerBaseUrl()}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String(data.error) : `Worker admin request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function fetchWorkerAdminStats(): Promise<WorkerAdminStats> {
  const data = await readWorkerJson<{ ok: true; stats: WorkerAdminStats }>('/api/admin/stats');
  return data.stats;
}

export async function fetchWorkerAdminLinks(search: string, page = 1, pageSize = 20): Promise<{ links: WorkerAdminLink[]; pagination: WorkerAdminPagination }> {
  const query = new URLSearchParams();
  const q = search.trim();
  if (q) query.set('q', q);
  query.set('page', String(page));
  query.set('page_size', String(pageSize));

  const data = await readWorkerJson<{ ok: true; links: WorkerAdminLink[]; pagination: WorkerAdminPagination }>(`/api/admin/links?${query.toString()}`);
  return {
    links: data.links,
    pagination: data.pagination,
  };
}

export async function fetchWorkerRecentClicks(limit = 20): Promise<WorkerAdminClick[]> {
  const data = await readWorkerJson<{ ok: true; clicks: WorkerAdminClick[] }>(`/api/admin/recent-clicks?limit=${encodeURIComponent(String(limit))}`);
  return data.clicks;
}

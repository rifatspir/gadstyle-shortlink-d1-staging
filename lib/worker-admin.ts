
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
  id: string;
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

export async function fetchWorkerAdminLinks(search: string): Promise<WorkerAdminLink[]> {
  const q = search.trim();
  const data = await readWorkerJson<{ ok: true; links: WorkerAdminLink[] }>(`/api/admin/links${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  return data.links;
}

export async function fetchWorkerRecentClicks(): Promise<WorkerAdminClick[]> {
  const data = await readWorkerJson<{ ok: true; clicks: WorkerAdminClick[] }>('/api/admin/recent-clicks');
  return data.clicks;
}

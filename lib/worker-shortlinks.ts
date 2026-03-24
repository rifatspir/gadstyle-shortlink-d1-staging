import { env } from '@/lib/env';
import type { SupportedTargetType } from '@/lib/shortlink-contract';

export type WorkerShortlink = {
  id: number;
  code: string;
  entity_type: SupportedTargetType;
  entity_id: string;
  app_path: string;
  web_url: string | null;
  is_active: boolean;
  source?: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

function getWorkerBaseUrl() {
  if (!env.shortlinkApiBaseUrl) {
    throw new Error('SHORTLINK_API_BASE_URL is not configured.');
  }
  return env.shortlinkApiBaseUrl;
}

async function readWorkerJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String(data.error) : `Worker request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

type WorkerResolveResponse = {
  ok: true;
  shortlink: WorkerShortlink;
};

export async function resolveShortCodeViaWorker(code: string) {
  const baseUrl = getWorkerBaseUrl();
  const url = `${baseUrl}/api/shortlinks/resolve?code=${encodeURIComponent(code)}`;
  const data = await readWorkerJson<WorkerResolveResponse>(url);
  return data.shortlink;
}

export async function resolveDirectRouteViaWorker(targetType: SupportedTargetType, targetId: string) {
  const baseUrl = getWorkerBaseUrl();
  const url = `${baseUrl}/api/shortlinks/resolve-direct?entity_type=${encodeURIComponent(targetType)}&entity_id=${encodeURIComponent(targetId)}`;
  const data = await readWorkerJson<WorkerResolveResponse>(url);
  return data.shortlink;
}

type WorkerCreatePayload = {
  code?: string;
  entity_type: SupportedTargetType;
  entity_id: string;
  web_url: string;
  source?: string;
  notes?: string | null;
};

type WorkerCreateResponse = {
  ok: true;
  shortlink: WorkerShortlink;
};

export async function createShortlinkViaWorker(payload: WorkerCreatePayload) {
  const baseUrl = getWorkerBaseUrl();
  const data = await readWorkerJson<WorkerCreateResponse>(`${baseUrl}/api/shortlinks`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return data.shortlink;
}

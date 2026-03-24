'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { WorkerAdminPagination } from '@/lib/worker-admin';

export type AdminLinkRow = {
  id: string | number;
  code: string;
  targetType: 'product' | 'category' | 'brand';
  targetId: string;
  clickCount: number;
  isActive: boolean;
  updatedAt: string | Date;
};

function getDirectPath(link: AdminLinkRow) {
  if (link.targetType === 'product') return `/p/${link.targetId}`;
  if (link.targetType === 'category') return `/c/${link.targetId}`;
  if (link.targetType === 'brand') return `/b/${link.targetId}`;
  return `/s/${link.code}`;
}

export function LinksTable({
  links,
  search,
  loading = false,
  error = null,
  pagination,
  onSearchChange,
  onPageChange,
}: {
  links: AdminLinkRow[];
  search: string;
  loading?: boolean;
  error?: string | null;
  pagination?: WorkerAdminPagination;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
}) {
  return (
    <div className="card table-card">
      <div className="table-head">
        <div>
          <h2>Shortlinks</h2>
          <p className="muted-text">Search by code, canonical URL, or target ID.</p>
        </div>
        <div className="search-form">
          <input
            name="q"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search links..."
            autoComplete="off"
          />
          <button type="button" className="ghost-button" disabled>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {error ? <p className="error-text inline-error">{error}</p> : null}

      <div className="responsive-table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Target ID</th>
              <th>Clicks</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="empty-cell">Loading shortlinks…</td>
              </tr>
            ) : links.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">No shortlinks found.</td>
              </tr>
            ) : (
              links.map((link) => (
                <tr key={link.id}>
                  <td>
                    <div className="code-cell">
                      <strong>{link.code}</strong>
                      <div className="link-actions-inline">
                        <Link href={`/s/${link.code}`} target="_blank">Short</Link>
                        <Link href={getDirectPath(link)} target="_blank">Direct</Link>
                      </div>
                    </div>
                  </td>
                  <td>{link.targetType}</td>
                  <td>{link.targetId}</td>
                  <td>{link.clickCount}</td>
                  <td>
                    <span className={link.isActive ? 'status-pill active' : 'status-pill inactive'}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(link.updatedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="table-footer">
          <p className="muted-text">
            Showing page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} total links
          </p>
          <div className="pager-actions">
            <button type="button" className="ghost-button pager-button" disabled={pagination.page <= 1 || loading} onClick={() => onPageChange?.(pagination.page - 1)}>
              Previous
            </button>
            <button type="button" className="ghost-button pager-button" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => onPageChange?.(pagination.page + 1)}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

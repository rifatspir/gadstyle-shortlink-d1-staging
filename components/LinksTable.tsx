
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

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

export function LinksTable({ links, search }: { links: AdminLinkRow[]; search: string }) {
  return (
    <div className="card table-card">
      <div className="table-head">
        <div>
          <h2>Shortlinks</h2>
          <p className="muted-text">Search by code, canonical URL, or target ID.</p>
        </div>
        <form method="get" className="search-form">
          <input name="q" defaultValue={search} placeholder="Search links..." />
          <button type="submit" className="ghost-button">Search</button>
        </form>
      </div>

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
            {links.length === 0 ? (
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
    </div>
  );
}

import { formatDate } from '@/lib/utils';

export type AdminRecentClickRow = {
  id: string | number;
  createdAt: string | Date;
  routeType: string;
  shortLink: {
    code: string;
    targetType: 'product' | 'category' | 'brand';
    targetId: string;
  };
};

export function RecentClicks({ clicks, loading = false, error = null }: { clicks: AdminRecentClickRow[]; loading?: boolean; error?: string | null }) {
  return (
    <div className="card table-card">
      <div className="table-head">
        <div>
          <h2>Recent clicks</h2>
          <p className="muted-text">Latest redirect activity across short code and direct routes.</p>
        </div>
      </div>

      {error ? <p className="error-text inline-error">{error}</p> : null}

      <div className="responsive-table">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Code</th>
              <th>Route</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="empty-cell">Loading recent clicks…</td>
              </tr>
            ) : clicks.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-cell">No clicks recorded yet.</td>
              </tr>
            ) : (
              clicks.map((click) => (
                <tr key={click.id}>
                  <td>{formatDate(click.createdAt)}</td>
                  <td>{click.shortLink.code}</td>
                  <td>{click.routeType}</td>
                  <td>{click.shortLink.targetType}:{click.shortLink.targetId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

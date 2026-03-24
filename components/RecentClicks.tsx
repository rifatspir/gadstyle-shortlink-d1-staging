import { ClickEvent, ShortLink } from '@prisma/client';
import { formatDate } from '@/lib/utils';

type ClickWithLink = ClickEvent & {
  shortLink: Pick<ShortLink, 'code' | 'targetType' | 'targetId'>;
};

export function RecentClicks({ clicks }: { clicks: ClickWithLink[] }) {
  return (
    <div className="card table-card">
      <div className="table-head">
        <div>
          <h2>Recent clicks</h2>
          <p className="muted-text">Latest redirect activity across short code and direct routes.</p>
        </div>
      </div>
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
            {clicks.length === 0 ? (
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

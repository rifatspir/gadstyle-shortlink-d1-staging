export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card stat-card">
      <p className="muted-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint ? <p className="muted-text">{hint}</p> : null}
    </div>
  );
}

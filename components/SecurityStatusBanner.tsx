import { env } from '@/lib/env';

export function SecurityStatusBanner() {
  if (!env.adminSecurityMaintenanceBanner) return null;
  const activeFlags = [
    env.admin2faBypass ? '2FA bypass is active' : null,
    env.adminForce2faReset ? '2FA reset mode is active' : null,
    env.admin2faRecoveryInputEnabled ? 'Recovery code input is visible on verify page' : null,
  ].filter(Boolean);

  if (!activeFlags.length) return null;

  return (
    <div className="security-banner" role="status">
      <strong>Security maintenance mode:</strong> {activeFlags.join(' • ')}
    </div>
  );
}

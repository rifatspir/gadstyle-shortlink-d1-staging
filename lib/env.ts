function getRequiredEnvValue(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getBooleanEnv(key: string, fallback = false) {
  const value = process.env[key];
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export const env = {
  appBaseUrl: getRequiredEnvValue('APP_BASE_URL'),
  sessionSecret: getRequiredEnvValue('SESSION_SECRET'),
  adminUsername: getRequiredEnvValue('ADMIN_USERNAME'),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  adminPassword: process.env.ADMIN_PASSWORD,
  shortlinkApiBaseUrl: getRequiredEnvValue('SHORTLINK_API_BASE_URL').replace(/\/$/, ''),
  admin2faEnabled: getBooleanEnv('ADMIN_2FA_ENABLED', false),
  admin2faBypass: getBooleanEnv('ADMIN_2FA_BYPASS', false),
  adminForce2faReset: getBooleanEnv('ADMIN_FORCE_2FA_RESET', false),
  admin2faSecret: process.env.ADMIN_2FA_SECRET || '',
  admin2faIssuer: process.env.ADMIN_2FA_ISSUER || 'Gadstyle Shortlink',
  admin2faRecoveryInputEnabled: getBooleanEnv('ADMIN_2FA_RECOVERY_INPUT_ENABLED', false),
  adminRecoveryCodes: (process.env.ADMIN_2FA_RECOVERY_CODES || '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean),
};

function getRequiredEnvValue(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const shortlinkApiBaseUrl = process.env.SHORTLINK_API_BASE_URL?.replace(/\/$/, '') || null;
const databaseUrl = process.env.DATABASE_URL || null;

if (!shortlinkApiBaseUrl && !databaseUrl) {
  throw new Error('Missing required environment variable: DATABASE_URL (or configure SHORTLINK_API_BASE_URL for Worker+D1 mode)');
}

export const env = {
  databaseUrl,
  appBaseUrl: getRequiredEnvValue('APP_BASE_URL'),
  sessionSecret: getRequiredEnvValue('SESSION_SECRET'),
  adminUsername: getRequiredEnvValue('ADMIN_USERNAME'),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  adminPassword: process.env.ADMIN_PASSWORD,
  directUrl: process.env.DIRECT_URL || null,
  shortlinkApiBaseUrl,
};

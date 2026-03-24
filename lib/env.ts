function getRequiredEnvValue(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  appBaseUrl: getRequiredEnvValue('APP_BASE_URL'),
  sessionSecret: getRequiredEnvValue('SESSION_SECRET'),
  adminUsername: getRequiredEnvValue('ADMIN_USERNAME'),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  adminPassword: process.env.ADMIN_PASSWORD,
  shortlinkApiBaseUrl: getRequiredEnvValue('SHORTLINK_API_BASE_URL').replace(/\/$/, ''),
};

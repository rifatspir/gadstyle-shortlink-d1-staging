const requiredKeys = [
  'DATABASE_URL',
  'APP_BASE_URL',
  'SESSION_SECRET',
  'ADMIN_USERNAME',
] as const;

function getEnvValue(key: (typeof requiredKeys)[number]): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  databaseUrl: getEnvValue('DATABASE_URL'),
  appBaseUrl: getEnvValue('APP_BASE_URL'),
  sessionSecret: getEnvValue('SESSION_SECRET'),
  adminUsername: getEnvValue('ADMIN_USERNAME'),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  adminPassword: process.env.ADMIN_PASSWORD,
  directUrl: process.env.DIRECT_URL,
};

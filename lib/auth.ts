import bcrypt from 'bcryptjs';
import { env } from '@/lib/env';
import { buildOtpAuthUrl, isLikelyBase32Secret, verifyTotpToken } from '@/lib/totp';

function looksLikeBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

async function verifyHashOrPlain(candidate: string, stored: string) {
  if (!stored) return false;
  if (!looksLikeBcryptHash(stored)) return candidate === stored;
  return bcrypt.compare(candidate, stored);
}

export async function verifyLoginCredentials(username: string, password: string) {
  if (username !== env.adminUsername) {
    return false;
  }

  if (env.adminPassword) {
    return password === env.adminPassword;
  }

  if (!env.adminPasswordHash) {
    return false;
  }

  return verifyHashOrPlain(password, env.adminPasswordHash);
}

export function hasValidTwoFactorSecret() {
  return isLikelyBase32Secret(env.admin2faSecret);
}

export function isTwoFactorRequired() {
  return env.admin2faEnabled && !env.admin2faBypass && !env.adminForce2faReset && hasValidTwoFactorSecret();
}

export async function verifyTwoFactorToken(token: string) {
  if (!isTwoFactorRequired()) return true;
  return verifyTotpToken(env.admin2faSecret, token);
}

export async function verifyRecoveryCode(code: string) {
  if (!code.trim()) return false;
  for (const stored of env.adminRecoveryCodes) {
    if (await verifyHashOrPlain(code.trim(), stored)) {
      return true;
    }
  }
  return false;
}

export function getTwoFactorSetupDetails() {
  if (!env.admin2faSecret || !hasValidTwoFactorSecret()) return null;
  return {
    secret: env.admin2faSecret,
    otpauthUrl: buildOtpAuthUrl({
      accountName: env.adminUsername,
      issuer: env.admin2faIssuer,
      secret: env.admin2faSecret,
    }),
    bypassEnabled: env.admin2faBypass,
    resetRequested: env.adminForce2faReset,
  };
}

export function getAdminSecurityStatus() {
  return {
    username: env.adminUsername,
    twoFactorEnabled: env.admin2faEnabled,
    twoFactorActive: isTwoFactorRequired(),
    bypassEnabled: env.admin2faBypass,
    resetRequested: env.adminForce2faReset,
    recoveryInputEnabled: env.admin2faRecoveryInputEnabled,
    hasSecret: hasValidTwoFactorSecret(),
    hasRecoveryCodes: env.adminRecoveryCodes.length > 0,
    issuer: env.admin2faIssuer,
  };
}

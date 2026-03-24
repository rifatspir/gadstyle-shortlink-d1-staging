import bcrypt from 'bcryptjs';
import { env } from '@/lib/env';

function looksLikeBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
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

  if (!looksLikeBcryptHash(env.adminPasswordHash)) {
    return password === env.adminPasswordHash;
  }

  return bcrypt.compare(password, env.adminPasswordHash);
}

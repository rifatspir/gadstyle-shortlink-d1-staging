import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 32) {
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    out += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return out;
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const left = crypto.randomBytes(3).toString('hex');
    const right = crypto.randomBytes(3).toString('hex');
    return `gs-${left}-${right}`;
  });
}

export function maskSecret(secret: string) {
  if (!secret) return 'Not configured';
  if (secret.length <= 8) return '••••••••';
  return `${secret.slice(0, 4)}••••••••${secret.slice(-4)}`;
}

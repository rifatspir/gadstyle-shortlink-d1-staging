import crypto from 'crypto';

const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function normalizeBase32(secret: string) {
  return secret.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
}

export function isLikelyBase32Secret(secret: string) {
  return /^[A-Z2-7=\s]+$/i.test(secret) && normalizeBase32(secret).length >= 16;
}

export function decodeBase32(secret: string) {
  const normalized = normalizeBase32(secret);
  let bits = '';
  for (const char of normalized) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error('Invalid TOTP base32 secret.');
    }
    bits += value.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter % 0x100000000, 4);
  const hmac = crypto.createHmac('sha1', secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24)
    | ((hmac[offset + 1] & 0xff) << 16)
    | ((hmac[offset + 2] & 0xff) << 8)
    | (hmac[offset + 3] & 0xff);
  return String(code % (10 ** DIGITS)).padStart(DIGITS, '0');
}

export function verifyTotpToken(secret: string, token: string, window = 1) {
  const normalizedToken = token.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalizedToken)) {
    return false;
  }

  const secretBytes = decodeBase32(secret);
  const currentCounter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  for (let offset = -window; offset <= window; offset += 1) {
    if (hotp(secretBytes, currentCounter + offset) === normalizedToken) {
      return true;
    }
  }
  return false;
}

export function buildOtpAuthUrl({ accountName, issuer, secret }: { accountName: string; issuer: string; secret: string }) {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const issuerParam = encodeURIComponent(issuer);
  const normalized = normalizeBase32(secret);
  return `otpauth://totp/${label}?secret=${normalized}&issuer=${issuerParam}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

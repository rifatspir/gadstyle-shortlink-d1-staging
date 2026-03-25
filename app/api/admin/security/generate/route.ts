import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/session';
import { generateBase32Secret, generateRecoveryCodes } from '@/lib/security-utils';
import { buildOtpAuthUrl } from '@/lib/totp';
import { env } from '@/lib/env';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = generateBase32Secret(32);
  const recoveryCodes = generateRecoveryCodes(8);

  return NextResponse.json({
    secret,
    issuer: env.admin2faIssuer,
    otpauthUrl: buildOtpAuthUrl({
      accountName: env.adminUsername,
      issuer: env.admin2faIssuer,
      secret,
    }),
    recoveryCodes,
    suggestedEnv: {
      ADMIN_2FA_SECRET: secret,
      ADMIN_2FA_RECOVERY_CODES: recoveryCodes.join(','),
    },
  });
}

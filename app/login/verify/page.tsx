import Link from 'next/link';
import { getPreAuthFromCookies } from '@/lib/session';
import { env } from '@/lib/env';
import { redirect } from 'next/navigation';

export default async function VerifyTwoFactorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const preauth = await getPreAuthFromCookies();
  if (!preauth) {
    redirect('/login');
  }

  return (
    <main className="login-wrap">
      <section className="card login-card verify-card">
        <div className="single-logo-branding compact-branding">
          <img src="/gadstyle-shortlink-logo.png" alt="Gadstyle Shortlink" className="brand-logo login-brand-logo" />
        </div>
        <h1 className="verify-title">Two-factor verification</h1>
        <p className="muted-text login-help">Enter the 6-digit code from Google Authenticator or Authy.</p>

        <form action="/api/auth/verify-2fa" method="post" className="login-form">
          <label>
            <span>Authenticator code</span>
            <input type="text" name="token" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} />
          </label>
          {env.admin2faRecoveryInputEnabled ? (
            <label>
              <span>Recovery code</span>
              <input type="text" name="recovery_code" placeholder="Use only if authenticator is unavailable" />
            </label>
          ) : null}
          <button type="submit" className="primary-button">Verify and continue</button>
        </form>

        {params.error ? <p className="error-text">Invalid verification code.</p> : null}

        <p className="login-credit inside-login-credit">Developed by <Link href="https://marbwp.com/" target="_blank" rel="noreferrer">MARB</Link></p>
      </section>
    </main>
  );
}

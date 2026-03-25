'use client';

import { useEffect, useState } from 'react';

type GeneratedState = {
  secret: string;
  issuer: string;
  otpauthUrl: string;
  recoveryCodes: string[];
  suggestedEnv: {
    ADMIN_2FA_SECRET: string;
    ADMIN_2FA_RECOVERY_CODES: string;
  };
};

export function SecuritySettingsPanel({
  status,
  maskedSecret,
}: {
  status: {
    username: string;
    twoFactorEnabled: boolean;
    twoFactorActive: boolean;
    bypassEnabled: boolean;
    resetRequested: boolean;
    recoveryInputEnabled: boolean;
    hasSecret: boolean;
    hasRecoveryCodes: boolean;
    issuer: string;
  };
  maskedSecret: string;
}) {
  const [generated, setGenerated] = useState<GeneratedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/security/generate', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate security values.');
      setGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate security values.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <section className="card security-card">
      <div className="security-section">
        <h1>Admin security settings</h1>
        <p className="muted-text">Manage 2FA operationally from Vercel env without exposing secrets on the public verify step.</p>
      </div>

      <div className="security-grid">
        <div className="security-stat"><span>Admin user</span><strong>{status.username}</strong></div>
        <div className="security-stat"><span>2FA enabled</span><strong>{status.twoFactorEnabled ? 'Yes' : 'No'}</strong></div>
        <div className="security-stat"><span>2FA active now</span><strong>{status.twoFactorActive ? 'Yes' : 'No'}</strong></div>
        <div className="security-stat"><span>Recovery input visible</span><strong>{status.recoveryInputEnabled ? 'Yes' : 'No'}</strong></div>
        <div className="security-stat"><span>Bypass active</span><strong>{status.bypassEnabled ? 'Yes' : 'No'}</strong></div>
        <div className="security-stat"><span>Forced reset active</span><strong>{status.resetRequested ? 'Yes' : 'No'}</strong></div>
      </div>

      <div className="security-section">
        <h2>Current protected setup</h2>
        <p><strong>Issuer:</strong> {status.issuer}</p>
        <p><strong>Current secret:</strong> {maskedSecret}</p>
        <p><strong>Recovery codes configured:</strong> {status.hasRecoveryCodes ? 'Yes' : 'No'}</p>
        <p className="muted-text">The real secret is intentionally not shown here unless you rotate and replace it through Vercel env.</p>
      </div>

      <div className="security-section">
        <div className="security-section-head">
          <h2>Generate new rotation values</h2>
          <button type="button" className="secondary-button" onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate new values'}</button>
        </div>
        <p className="muted-text">Use these values to rotate 2FA safely in Vercel. Rotation is manual by design so daily login never exposes setup secrets.</p>
        {error ? <p className="error-text">{error}</p> : null}
        {generated ? (
          <>
            <label className="security-textarea-wrap"><span>New TOTP secret</span><textarea readOnly value={generated.secret} /></label>
            <label className="security-textarea-wrap"><span>OTP URI</span><textarea readOnly value={generated.otpauthUrl} /></label>
            <label className="security-textarea-wrap"><span>Recovery codes</span><textarea readOnly value={generated.recoveryCodes.join('\n')} /></label>
            <label className="security-textarea-wrap"><span>Suggested Vercel env block</span><textarea readOnly value={`ADMIN_2FA_SECRET=${generated.suggestedEnv.ADMIN_2FA_SECRET}\nADMIN_2FA_RECOVERY_CODES=${generated.suggestedEnv.ADMIN_2FA_RECOVERY_CODES}`} /></label>
          </>
        ) : null}
      </div>

      <div className="security-section">
        <h2>Recovery and maintenance</h2>
        <ul className="security-list">
          <li>Normal production: <code>ADMIN_2FA_BYPASS=false</code>, <code>ADMIN_FORCE_2FA_RESET=false</code>, <code>ADMIN_2FA_RECOVERY_INPUT_ENABLED=false</code></li>
          <li>If authenticator is lost: temporarily set <code>ADMIN_2FA_BYPASS=true</code> in Vercel, redeploy, log in, rotate the secret, then set bypass back to false.</li>
          <li>If you want recovery code entry visible on verify screen: set <code>ADMIN_2FA_RECOVERY_INPUT_ENABLED=true</code> temporarily, then switch it back off after use.</li>
          <li>If you need to invalidate all sessions quickly: rotate <code>SESSION_SECRET</code> in Vercel and redeploy.</li>
        </ul>
      </div>

      <div className="security-section">
        <h2>Audit visibility</h2>
        <p className="muted-text">Login success, login failures, verify failures, recovery-code use, and bypass-mode use are written to Vercel function logs as structured events.</p>
      </div>

    </section>
  );
}


import Image from 'next/image';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next || '/admin';

  return (
    <main className="login-wrap">
      <section className="card login-card">
        <div className="login-branding single-logo-branding">
          <Image
            src="/gadstyle-shortlink-logo.png"
            alt="Gadstyle Shortlink"
            width={522}
            height={128}
            className="brand-logo login-brand-logo"
            priority
          />
        </div>
        <p className="muted-text login-help">
          Shortlink server provided for Gadstyle app.
        </p>

        <form action="/api/auth/login" method="post" className="login-form">
          <input type="hidden" name="next" value={next} />
          <label>
            <span>Username</span>
            <input type="text" name="username" required autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="primary-button">Login</button>
        </form>

        {params.error ? <p className="error-text">Invalid username or password.</p> : null}
      </section>
    </main>
  );
}

function BrandMark() {
  return (
    <div className="brand-mark large" aria-hidden="true">
      <span>GS</span>
    </div>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next || '/admin';

  return (
    <main className="login-wrap">
      <section className="card login-card">
        <div className="login-branding">
          <BrandMark />
          <div>
            <p className="eyebrow">Gadstyle Internal</p>
            <h1>Shortlink Admin</h1>
          </div>
        </div>
        <p className="muted-text login-help">
          Lightweight admin for ID-based product, category, and brand shortlinks. Current production stack stays Vercel + Worker + D1.
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

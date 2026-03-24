export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next || '/admin';

  return (
    <main className="login-wrap">
      <section className="card login-card">
        <p className="eyebrow">Gadstyle Internal</p>
        <h1>Admin Login</h1>
        <p className="muted-text login-help">
          Phase 1 uses one secure internal admin login. Later, this can be replaced with role-based accounts if you need multiple staff users.
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

import Link from 'next/link';

export function Header() {
  return (
    <header className="site-header">
      <div>
        <p className="eyebrow">Gadstyle</p>
        <h1>Shortlink Service</h1>
      </div>
      <nav className="top-nav">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/links/new">Create Link</Link>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="ghost-button">Logout</button>
        </form>
      </nav>
    </header>
  );
}

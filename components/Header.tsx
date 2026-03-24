import Link from 'next/link';

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span>GS</span>
    </div>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="brand-lockup">
        <BrandMark />
        <div>
          <p className="eyebrow">Gadstyle</p>
          <h1>Shortlink Service</h1>
        </div>
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

import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="site-header">
      <div className="brand-lockup">
        <Image
          src="/gadstyle-shortlink-logo.png"
          alt="Gadstyle Shortlink"
          width={522}
          height={128}
          className="brand-logo header-brand-logo"
          priority
        />
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

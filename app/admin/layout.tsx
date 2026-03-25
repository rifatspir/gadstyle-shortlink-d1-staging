import { Header } from '@/components/Header';
import { SecurityStatusBanner } from '@/components/SecurityStatusBanner';
import { getSessionFromCookies } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="page-shell">
      <Header />
      <SecurityStatusBanner />
      {children}
    </main>
  );
}

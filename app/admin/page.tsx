import { AdminDashboardClient } from '@/components/AdminDashboardClient';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  return <AdminDashboardClient initialSearch={(params.q || '').trim()} />;
}

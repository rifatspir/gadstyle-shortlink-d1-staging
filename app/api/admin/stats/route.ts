import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/session';
import { fetchWorkerAdminStats } from '@/lib/worker-admin';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await fetchWorkerAdminStats();
    return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load stats.' }, { status: 500 });
  }
}

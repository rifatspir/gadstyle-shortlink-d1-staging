import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/session';
import { fetchWorkerRecentClicks } from '@/lib/worker-admin';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);

  try {
    const clicks = await fetchWorkerRecentClicks(Number.isFinite(limit) ? limit : 20);
    return NextResponse.json(clicks, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load recent clicks.' }, { status: 500 });
  }
}

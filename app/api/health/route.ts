import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await getDb().execute('SELECT 1');
    return Response.json({ ok: true, service: 'text', status: 'healthy' });
  } catch {
    return Response.json({ ok: false, status: 'unhealthy' }, { status: 500 });
  }
}

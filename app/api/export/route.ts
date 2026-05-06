import fs from 'node:fs';
import { NextRequest } from 'next/server';
import { getAdminStats, getDatabasePath, listAdminNotes } from '@/lib/db';
import { isAdminRequest, jsonError } from '@/lib/security';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!process.env.ADMIN_PASSWORD_HASH) return jsonError('Admin is disabled.', 404);
  if (!(await isAdminRequest(request))) return jsonError('Unauthorized.', 401);

  const format = request.nextUrl.searchParams.get('format');
  if (format === 'json') {
    const search = request.nextUrl.searchParams.get('q') || '';
    return Response.json({
      ok: true,
      stats: await getAdminStats(),
      notes: await listAdminNotes(search)
    });
  }

  const dbPath = getDatabasePath();
  if (!fs.existsSync(dbPath)) return jsonError('Database file not found.', 404);

  const file = fs.readFileSync(dbPath);
  return new Response(file, {
    headers: {
      'Content-Type': 'application/vnd.sqlite3',
      'Content-Disposition': 'attachment; filename="text.db"'
    }
  });
}

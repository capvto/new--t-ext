import { NextRequest } from 'next/server';
import { findNoteBySlug, noteToPublic, recordNoteEvent } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { getRequestIp, hashIp, jsonError, verifySecret } from '@/lib/security';
import { verifyEditCodeSchema } from '@/lib/validation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const ipHash = hashIp(getRequestIp(request));
  const limit = checkRateLimit(`verify:${slug}:${ipHash}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) return jsonError('Too many verification attempts. Try again later.', 429);

  const note = await findNoteBySlug(slug);
  if (!note) return jsonError('Note not found.', 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.');
  }

  const parsed = verifyEditCodeSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid verification payload.');

  const ok = await verifySecret(parsed.data.editCode, note.edit_code_hash);
  if (!ok) {
    await recordNoteEvent(note.id, 'verify_failed', ipHash);
    return jsonError('Invalid edit code.', 403);
  }

  await recordNoteEvent(note.id, 'verified', ipHash);
  return Response.json({ ok: true, note: noteToPublic(note) });
}

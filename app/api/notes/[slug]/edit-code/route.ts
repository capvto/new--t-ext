import { NextRequest } from 'next/server';
import { findNoteBySlug, recordNoteEvent, updateNoteEditCodeHash } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { getRequestIp, hashIp, hashSecret, jsonError, verifySecret } from '@/lib/security';
import { changeEditCodeSchema } from '@/lib/validation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const ipHash = hashIp(getRequestIp(request));
  const limit = checkRateLimit(`change-code:${slug}:${ipHash}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) return jsonError('Too many attempts. Try again later.', 429);

  const note = await findNoteBySlug(slug);
  if (!note) return jsonError('Note not found.', 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.');
  }

  const parsed = changeEditCodeSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid payload.');

  const { currentEditCode, newEditCode } = parsed.data;

  const ok = await verifySecret(currentEditCode, note.edit_code_hash);
  if (!ok) {
    await recordNoteEvent(note.id, 'edit_code_change_failed', ipHash);
    return jsonError('Invalid current edit code.', 403);
  }

  const newHash = await hashSecret(newEditCode);
  const now = new Date().toISOString();
  await updateNoteEditCodeHash({ id: note.id, editCodeHash: newHash, updatedAt: now });
  await recordNoteEvent(note.id, 'edit_code_changed', ipHash);

  return Response.json({ ok: true });
}

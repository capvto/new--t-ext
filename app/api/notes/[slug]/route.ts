import { NextRequest } from 'next/server';
import { deleteNoteById, findNoteBySlug, incrementViews, noteToPublic, recordNoteEvent, updateNoteContent } from '@/lib/db';
import { extractTitle } from '@/lib/markdown';
import { checkRateLimit } from '@/lib/rateLimit';
import { getRequestIp, hashIp, isAdminRequest, jsonError, verifySecret } from '@/lib/security';
import { updateNoteSchema, verifyEditCodeSchema } from '@/lib/validation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const note = await findNoteBySlug(slug);
  if (!note) return jsonError('Note not found.', 404);

  await incrementViews(slug);
  return Response.json({ ok: true, note: noteToPublic({ ...note, views: note.views + 1 }) });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const ipHash = hashIp(getRequestIp(request));
  const limit = checkRateLimit(`edit:${slug}:${ipHash}`, 30, 15 * 60 * 1000);
  if (!limit.allowed) return jsonError('Too many edit attempts. Try again later.', 429);

  const note = await findNoteBySlug(slug);
  if (!note) return jsonError('Note not found.', 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.');
  }

  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid update payload.');

  const input = parsed.data;
  const ok = await verifySecret(input.editCode, note.edit_code_hash);
  if (!ok) {
    await recordNoteEvent(note.id, 'edit_failed', ipHash);
    return jsonError('Invalid edit code.', 403);
  }

  const now = new Date().toISOString();
  const title = input.title || extractTitle(input.contentMarkdown);
  await updateNoteContent({ id: note.id, title, contentMarkdown: input.contentMarkdown, updatedAt: now });
  await recordNoteEvent(note.id, 'updated', ipHash);

  const updated = await findNoteBySlug(slug);
  if (!updated) return jsonError('Could not load updated note.', 500);

  return Response.json({ ok: true, note: noteToPublic(updated) });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const ipHash = hashIp(getRequestIp(request));
  const limit = checkRateLimit(`delete:${slug}:${ipHash}`, 20, 15 * 60 * 1000);
  if (!limit.allowed) return jsonError('Too many delete attempts. Try again later.', 429);

  const note = await findNoteBySlug(slug);
  if (!note) return jsonError('Note not found.', 404);

  if (!(await isAdminRequest(request))) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON body.');
    }

    const parsed = verifyEditCodeSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid delete payload.');

    const ok = await verifySecret(parsed.data.editCode, note.edit_code_hash);
    if (!ok) {
      await recordNoteEvent(note.id, 'delete_failed', ipHash);
      return jsonError('Invalid edit code.', 403);
    }
  }

  await recordNoteEvent(note.id, 'deleted', ipHash);
  await deleteNoteById(note.id);
  return Response.json({ ok: true });
}

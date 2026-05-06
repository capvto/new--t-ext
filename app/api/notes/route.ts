import { NextRequest } from 'next/server';
import { findNoteBySlug, insertNote, noteToPublic, recordNoteEvent } from '@/lib/db';
import { extractTitle } from '@/lib/markdown';
import { checkRateLimit } from '@/lib/rateLimit';
import { getRequestIp, hashIp, hashSecret, jsonError } from '@/lib/security';
import { createNoteSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const ipHash = hashIp(ip);
  const limit = checkRateLimit(`create:${ipHash}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return jsonError('Too many publish attempts. Try again later.', 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.');
  }

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid note payload.');
  }

  const input = parsed.data;
  if (await findNoteBySlug(input.slug)) return jsonError('This custom URL is already taken.', 409);

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const title = input.title || extractTitle(input.contentMarkdown);
  const hash = await hashSecret(input.editCode);

  try {
    await insertNote({
      id,
      slug: input.slug,
      title,
      contentMarkdown: input.contentMarkdown,
      editCodeHash: hash,
      createdAt: now,
      updatedAt: now
    });
    await recordNoteEvent(id, 'created', ipHash);
  } catch {
    return jsonError('This custom URL is already taken.', 409);
  }

  const note = await findNoteBySlug(input.slug);
  if (!note) return jsonError('Could not load created note.', 500);

  return Response.json({ ok: true, note: noteToPublic(note) }, { status: 201 });
}

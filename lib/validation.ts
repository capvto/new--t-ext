import { z } from 'zod';
import { MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from '@/lib/markdown';
import { normalizeSlug, slugError } from '@/lib/slug';

const slugSchema = z
  .string()
  .transform(normalizeSlug)
  .refine((value) => slugError(value) === null, (value) => ({
    message: slugError(value) || 'Invalid slug.'
  }));

const titleSchema = z
  .string()
  .trim()
  .max(MAX_TITLE_LENGTH, `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
  .optional()
  .transform((value) => (value ? value : undefined));

const contentSchema = z
  .string()
  .min(1, 'Markdown content is required.')
  .max(MAX_CONTENT_LENGTH, `Markdown content must be ${MAX_CONTENT_LENGTH} characters or fewer.`);

const editCodeSchema = z
  .string()
  .min(8, 'Edit code must be at least 8 characters.')
  .max(256, 'Edit code is too long.');

export const createNoteSchema = z.object({
  slug: slugSchema,
  title: titleSchema,
  contentMarkdown: contentSchema,
  editCode: editCodeSchema
});

export const updateNoteSchema = z.object({
  title: titleSchema,
  contentMarkdown: contentSchema,
  editCode: editCodeSchema
});

export const verifyEditCodeSchema = z.object({
  editCode: editCodeSchema
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type VerifyEditCodeInput = z.infer<typeof verifyEditCodeSchema>;

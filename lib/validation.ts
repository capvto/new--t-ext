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

export const editCodeSchema = z
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

export const changeEditCodeSchema = z
  .object({
    currentEditCode: editCodeSchema,
    newEditCode: editCodeSchema,
    confirmEditCode: editCodeSchema
  })
  .refine((v) => v.newEditCode === v.confirmEditCode, {
    message: 'New edit codes do not match.',
    path: ['confirmEditCode']
  })
  .refine((v) => v.currentEditCode !== v.newEditCode, {
    message: 'New edit code must be different from the current edit code.',
    path: ['newEditCode']
  });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type VerifyEditCodeInput = z.infer<typeof verifyEditCodeSchema>;
export type ChangeEditCodeInput = z.infer<typeof changeEditCodeSchema>;

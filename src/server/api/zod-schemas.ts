import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(4),
});
export type CreateTagSchema = z.infer<typeof createTagSchema>;

export const updateTagSchema = z.object({
  id: z.string(),
  name: z.string().min(4),
});
export type UpdateTagSchema = z.infer<typeof updateTagSchema>;

export const deleteTagSchema = z.object({
  id: z.string(),
});

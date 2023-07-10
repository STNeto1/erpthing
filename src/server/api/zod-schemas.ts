import { z } from "zod";

// ----- Tag -----
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

// ----- Item -----
export const createItemSchema = z.object({
  name: z.string().min(4),
  description: z.string().min(4),
  stock: z.number().min(0),
  price: z.number().min(0),
  tags: z.array(z.string()),
});
export type CreateItemSchema = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  id: z.string(),
  name: z.string().min(4),
  description: z.string().min(4),
  stock: z.number().min(0),
  price: z.number().min(0),
  tags: z.array(z.string()),
});
export type UpdateItemSchema = z.infer<typeof updateItemSchema>;

export const deleteItemSchema = z.object({
  id: z.string(),
});

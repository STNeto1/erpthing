import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(4),
});
export type CreateTagSchema = z.infer<typeof createTagSchema>;

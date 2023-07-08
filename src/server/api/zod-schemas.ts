import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string(),
});
export type CreateTagSchema = z.infer<typeof createTagSchema>;

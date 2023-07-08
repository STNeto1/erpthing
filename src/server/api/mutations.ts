import { createId } from "@paralleldrive/cuid2";
import { mutation$ } from "@prpc/solid";

import { db } from "~/db/connection";
import { tags } from "~/db/schema";
import { createTagSchema } from "~/server/api/zod-schemas";

export const createTagMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db.insert(tags).values({
      id: createId(),
      name: payload.name,
    });
  },
  key: "createTagMutation",
  schema: createTagSchema,
});

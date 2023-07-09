import { mutation$ } from "@prpc/solid";
import { ulid } from "ulid";

import { db } from "~/db/connection";
import { tags } from "~/db/schema";
import { createTagSchema } from "~/server/api/zod-schemas";

export const createTagMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db.insert(tags).values({
      id: ulid(),
      name: payload.name,
    });
  },
  key: "createTagMutation",
  schema: createTagSchema,
});

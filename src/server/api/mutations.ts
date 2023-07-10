import { mutation$ } from "@prpc/solid";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";

import { db } from "~/db/connection";
import { tags } from "~/db/schema";
import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "~/server/api/zod-schemas";

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

export const updateTagMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db
      .update(tags)
      .set({
        name: payload.name,
      })
      .where(eq(tags.id, payload.id));
  },
  key: "updateTagMutation",
  schema: updateTagSchema,
});

export const deleteTagMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db.delete(tags).where(eq(tags.id, payload.id));
  },
  key: "deleteTagMutation",
  schema: deleteTagSchema,
});

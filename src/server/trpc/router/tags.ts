import { eq, sql } from "drizzle-orm";
import { ulid } from "ulid";

import { db } from "~/db/connection";
import { itemsToTags, tags } from "~/db/schema";
import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "~/server/api/zod-schemas";
import { protectedProcedure, router } from "../utils";

export default router({
  searchTags: protectedProcedure.query(({}) => {
    return db
      .select({
        id: tags.id,
        name: tags.name,
        count: sql<number>`count(${itemsToTags.tagID})`.mapWith(Number),
      })
      .from(tags)
      .leftJoin(itemsToTags, eq(itemsToTags.tagID, tags.id))
      .groupBy(tags.id);
  }),
  createTag: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ input }) => {
      await db.insert(tags).values({
        id: ulid(),
        name: input.name,
      });
    }),
  updateTag: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ input }) => {
      await db
        .update(tags)
        .set({
          name: input.name,
        })
        .where(eq(tags.id, input.id));
    }),
  deleteTag: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ input }) => {
      await db.delete(tags).where(eq(tags.id, input.id));
    }),
});

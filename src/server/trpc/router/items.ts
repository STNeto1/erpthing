import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { items, itemsToTags, tags } from "~/db/schema";
import {
  createItemSchema,
  deleteItemSchema,
  updateItemSchema,
} from "~/server/api/zod-schemas";
import { protectedProcedure, router } from "../utils";

export default router({
  searchItems: protectedProcedure.query(async ({}) => {
    return db.query.items.findMany({
      where: isNull(items.deletedAt),
      with: {
        user: true,
        tags: true,
      },
    });
  }),
  showItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const result = await db.query.items.findFirst({
        where: and(eq(items.id, input.id), isNull(items.deletedAt)),
        with: {
          user: true,
          tags: {
            columns: {
              itemID: false,
              tagID: false,
            },
            with: {
              tag: true,
            },
          },
        },
      });

      if (!result) {
        throw new Error("Not found");
      }

      return result;
    }),
  createItem: protectedProcedure
    .input(createItemSchema)
    .mutation(async ({ input, ctx }) => {
      const authRequest = auth.handleRequest(ctx.req);
      const session = await authRequest.validate();

      await db.transaction(async (tx) => {
        const _tags = await tx
          .select()
          .from(tags)
          .where(inArray(tags.id, input.tags));
        if (_tags.length !== input.tags.length) {
          throw new Error("Invalid tags");
        }

        const itemID = ulid();

        await tx.insert(items).values({
          id: itemID,
          name: input.name,
          description: input.description,
          stock: input.stock,
          price: input.price,
          userID: session.user.userId,
        });

        await tx.insert(itemsToTags).values(
          input.tags.map((tagID) => ({
            itemID,
            tagID,
          })),
        );
      });
    }),
  updateItem: protectedProcedure
    .input(updateItemSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const _tags = await tx
          .select()
          .from(tags)
          .where(inArray(tags.id, input.tags));
        if (_tags.length !== input.tags.length) {
          throw new Error("Invalid tags");
        }

        await tx
          .update(items)
          .set({
            name: input.name,
            description: input.description,
            stock: input.stock,
            price: input.price,
          })
          .where(and(eq(items.id, input.id), isNull(items.deletedAt)));

        await tx.delete(itemsToTags).where(eq(itemsToTags.itemID, input.id));

        await tx.insert(itemsToTags).values(
          input.tags.map((tagID) => ({
            itemID: input.id,
            tagID,
          })),
        );
      });
    }),
  deleteItem: protectedProcedure
    .input(deleteItemSchema)
    .mutation(async ({ input }) => {
      await db
        .update(items)
        .set({
          deletedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(and(eq(items.id, input.id), isNull(items.deletedAt)));
    }),
});

import { mutation$ } from "@prpc/solid";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { ulid } from "ulid";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { items, itemsToTags, tags } from "~/db/schema";
import {
  createItemSchema,
  createTagSchema,
  deleteItemSchema,
  deleteTagSchema,
  updateItemSchema,
  updateTagSchema,
} from "~/server/api/zod-schemas";

// ----- Tag -----
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

// ----- Item -----
export const createItemMutation = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    await db.transaction(async (tx) => {
      const _tags = await tx
        .select()
        .from(tags)
        .where(inArray(tags.id, payload.tags));
      if (_tags.length !== payload.tags.length) {
        throw new Error("Invalid tags");
      }

      const itemID = ulid();

      await tx.insert(items).values({
        id: itemID,
        name: payload.name,
        description: payload.description,
        stock: payload.stock,
        price: payload.price,
        userID: session.user.userId,
      });

      await tx.insert(itemsToTags).values(
        payload.tags.map((tagID) => ({
          itemID,
          tagID,
        })),
      );
    });
  },
  key: "createItemMutation",
  schema: createItemSchema,
});

export const updateItemMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db.transaction(async (tx) => {
      const _tags = await tx
        .select()
        .from(tags)
        .where(inArray(tags.id, payload.tags));
      if (_tags.length !== payload.tags.length) {
        throw new Error("Invalid tags");
      }

      await tx
        .update(items)
        .set({
          name: payload.name,
          description: payload.description,
          stock: payload.stock,
          price: payload.price,
        })
        .where(and(eq(items.id, payload.id), isNull(items.deletedAt)));

      await tx.delete(itemsToTags).where(eq(itemsToTags.itemID, payload.id));

      await tx.insert(itemsToTags).values(
        payload.tags.map((tagID) => ({
          itemID: payload.id,
          tagID,
        })),
      );
    });
  },
  key: "updateItemMutation",
  schema: updateItemSchema,
});

export const deleteItemMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db
      .update(items)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(items.id, payload.id), isNull(items.deletedAt)));
  },
  key: "deleteItemsMutation",
  schema: deleteItemSchema,
});

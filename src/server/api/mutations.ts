import { mutation$ } from "@prpc/solid";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { ulid } from "ulid";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { items, itemsToTags, orderItems, orders, tags } from "~/db/schema";
import {
  createItemSchema,
  createOrderItemSchema,
  createOrderSchema,
  createTagSchema,
  deleteItemSchema,
  deleteOrderItemSchema,
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

// ----- Orders -----

export const createOrderMutation = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    await db.transaction(async (tx) => {
      const orderID = ulid();

      await tx.insert(orders).values({
        id: orderID,
        description: payload.description,
        userID: session.user.userId,
      });
    });
  },
  key: "createOrderMutation",
  schema: createOrderSchema,
});

export const createOrderItemMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, payload.orderID));
      if (!order) {
        throw new Error("Invalid order");
      }

      const [item] = await tx
        .select()
        .from(items)
        .where(eq(items.id, payload.itemID));
      if (!item) {
        throw new Error("Invalid item");
      }

      if (item.stock < payload.quantity) {
        throw new Error("Not enough stock");
      }

      const [existingOrderItem] = await tx
        .select()
        .from(orderItems)
        .where(
          and(
            eq(orderItems.orderID, payload.orderID),
            eq(orderItems.itemID, payload.itemID),
          ),
        );
      if (existingOrderItem) {
        throw new Error("Item already in order");
      }

      await tx.insert(orderItems).values({
        orderID: payload.orderID,
        itemID: payload.itemID,
        quantity: payload.quantity,
      });

      await tx
        .update(orders)
        .set({
          total: sql`total + ${item.price * payload.quantity}`,
        })
        .where(eq(orders.id, payload.orderID));

      await tx
        .update(items)
        .set({
          stock: item.stock - payload.quantity,
        })
        .where(eq(items.id, payload.itemID));
    });
  },
  key: "createOrderItemMutation",
  schema: createOrderItemSchema,
});

export const deleteOrderItemMutation = mutation$({
  mutationFn: async ({ payload }) => {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, payload.orderID));
      if (!order) {
        throw new Error("Invalid order");
      }

      const [item] = await tx
        .select()
        .from(items)
        .where(eq(items.id, payload.itemID));
      if (!item) {
        throw new Error("Invalid item");
      }

      const [orderItem] = await tx
        .select()
        .from(orderItems)
        .where(
          and(
            eq(orderItems.orderID, payload.orderID),
            eq(orderItems.itemID, payload.itemID),
          ),
        );

      if (!orderItem) {
        throw new Error("Order item not found");
      }

      await tx
        .update(orders)
        .set({
          total: sql`total - ${orderItem.quantity * item.price}`,
        })
        .where(eq(orders.id, payload.orderID));

      await tx
        .update(items)
        .set({
          stock: sql`stock + ${orderItem.quantity}`,
        })
        .where(eq(items.id, payload.itemID));

      await tx
        .delete(orderItems)
        .where(
          and(
            eq(orderItems.orderID, payload.orderID),
            eq(orderItems.itemID, payload.itemID),
          ),
        );
    });
  },
  key: "deleteOrderItemMutation",
  schema: deleteOrderItemSchema,
});

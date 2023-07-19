import { subDays } from "date-fns";
import { and, desc, eq, gte, isNull, like, sql, SQL } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { items, orderItems, orders } from "~/db/schema";
import {
  createOrderItemSchema,
  createOrderSchema,
  deleteOrderItemSchema,
  searchOrdersSchema,
  updateOrderItemSchema,
  updateOrderSchema,
} from "~/server/api/zod-schemas";
import { protectedProcedure, router } from "../utils";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export default router({
  metadata: protectedProcedure.query(async ({}) => {
    const tasks = [
      db
        .select({
          sum: sql<number>`sum(${orders.total})`.mapWith(Number),
        })
        .from(orders)
        .groupBy(orders.id)
        .where(eq(orders.status, "completed")),

      db
        .select({
          sum: sql<number>`sum(${orders.total})`.mapWith(Number),
        })
        .from(orders)
        .groupBy(orders.id)
        .where(
          and(
            eq(orders.status, "completed"),
            gte(orders.createdAt, subDays(new Date(), 7).toISOString()),
          ),
        ),

      db
        .select({
          sum: sql<number>`count(*)`.mapWith(Number),
        })
        .from(orders),

      db
        .select({
          sum: sql<number>`count(*)`.mapWith(Number),
        })
        .from(items)
        .where(isNull(items.deletedAt)),
    ];

    const [[rev], [weekRev], [ordersQty], [itemsQty]] = await Promise.all(
      tasks,
    );

    return {
      total: rev?.sum ?? 0,
      last7DaysTotal: weekRev?.sum ?? 0,
      orders: ordersQty?.sum ?? 0,
      items: itemsQty?.sum ?? 0,
    };
  }),
  latestOrders: protectedProcedure.query(async ({}) => {
    const latestOrders = await db.query.orders.findMany({
      with: {
        user: true,
      },
      limit: 10,
      orderBy: desc(orders.createdAt),
    });

    const [{ count }] = await db
      .select({
        count: sql<number>`count('*')`.mapWith(Number),
      })
      .from(orders)
      .groupBy(orders.id)
      .limit(1);

    return {
      latestOrders,
      count,
    };
  }),
  overview: protectedProcedure.query(async ({}) => {
    const result = await db
      .select({
        month: sql<string>`month(created_at)`.mapWith(String),
        sum: sql<number>`sum(total)`.mapWith(Number),
      })
      .from(orders)
      .groupBy(sql`MONTH(created_at)`)
      .orderBy(sql`MONTH(created_at)`);

    const data: Record<string, number> = {};
    result.forEach((elem) => {
      data[months[parseInt(elem.month, 10)]] = elem.sum;
    });

    return data;
  }),
  showOrder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const result = await db.query.orders.findFirst({
        where: eq(orders.id, input.id),
        with: {
          user: true,
          items: {
            with: {
              item: true,
            },
          },
        },
      });

      if (!result) {
        throw new Error("Not found");
      }

      return result;
    }),
  searchOrders: protectedProcedure
    .input(searchOrdersSchema)
    .query(async ({ input }) => {
      const where: SQL[] = [];

      if (input.description) {
        where.push(like(orders.description, `%${input.description}%`));
      }

      if (input.status) {
        where.push(eq(orders.status, input.status));
      }

      if (input.user) {
        where.push(eq(orders.userID, input.user));
      }

      return db.query.orders.findMany({
        where: and(...where),
        with: {
          user: true,
        },
      });
    }),
  createOrder: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      const authRequest = auth.handleRequest(ctx.req);
      const session = await authRequest.validate();

      await db.transaction(async (tx) => {
        const orderID = ulid();

        await tx.insert(orders).values({
          id: orderID,
          description: input.description,
          userID: session.user.userId,
        });
      });
    }),
  updateOrderAsPaid: protectedProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderID));

        if (!order) {
          throw new Error("Invalid order");
        }

        if (order.status !== "pending") {
          throw new Error("Invalid order status");
        }

        await tx
          .update(orders)
          .set({
            status: "paid",
          })
          .where(eq(orders.id, input.orderID));
      });
    }),
  updateOrderAsCompleted: protectedProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderID));

        if (!order) {
          throw new Error("Invalid order");
        }

        if (order.status !== "paid") {
          throw new Error("Invalid order status");
        }

        await tx
          .update(orders)
          .set({
            status: "completed",
          })
          .where(eq(orders.id, input.orderID));
      });
    }),
  updateOrderAsCancelled: protectedProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderID));

        if (!order) {
          throw new Error("Invalid order");
        }

        if (order.status !== "pending") {
          throw new Error("Invalid order status");
        }

        await tx
          .update(orders)
          .set({
            status: "cancelled",
          })
          .where(eq(orders.id, input.orderID));
      });
    }),
  createOrderItem: protectedProcedure
    .input(createOrderItemSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderID));
        if (!order) {
          throw new Error("Invalid order");
        }
        if (order.status !== "pending") {
          throw new Error("Order is not open");
        }

        const [item] = await tx
          .select()
          .from(items)
          .where(eq(items.id, input.itemID));
        if (!item) {
          throw new Error("Invalid item");
        }

        if (item.stock < input.quantity) {
          throw new Error("Not enough stock");
        }

        const [existingOrderItem] = await tx
          .select()
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderID, input.orderID),
              eq(orderItems.itemID, input.itemID),
            ),
          );
        if (existingOrderItem) {
          throw new Error("Item already in order");
        }

        await tx.insert(orderItems).values({
          orderID: input.orderID,
          itemID: input.itemID,
          quantity: input.quantity,
        });

        await tx
          .update(orders)
          .set({
            total: sql`total + ${item.price * input.quantity}`,
          })
          .where(eq(orders.id, input.orderID));

        await tx
          .update(items)
          .set({
            stock: item.stock - input.quantity,
          })
          .where(eq(items.id, input.itemID));
      });
    }),
  deleteOrderItem: protectedProcedure
    .input(deleteOrderItemSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderID));
        if (!order) {
          throw new Error("Invalid order");
        }
        if (order.status !== "pending") {
          throw new Error("Order is not open");
        }

        const [item] = await tx
          .select()
          .from(items)
          .where(eq(items.id, input.itemID));
        if (!item) {
          throw new Error("Invalid item");
        }

        const [orderItem] = await tx
          .select()
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderID, input.orderID),
              eq(orderItems.itemID, input.itemID),
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
          .where(eq(orders.id, input.orderID));

        await tx
          .update(items)
          .set({
            stock: sql`stock + ${orderItem.quantity}`,
          })
          .where(eq(items.id, input.itemID));

        await tx
          .delete(orderItems)
          .where(
            and(
              eq(orderItems.orderID, input.orderID),
              eq(orderItems.itemID, input.itemID),
            ),
          );
      });
    }),
  updateOrderItem: protectedProcedure
    .input(updateOrderItemSchema)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderID));
        if (!order) {
          throw new Error("Invalid order");
        }
        if (order.status !== "pending") {
          throw new Error("Order is not open");
        }

        const [item] = await tx
          .select()
          .from(items)
          .where(eq(items.id, input.itemID));
        if (!item) {
          throw new Error("Invalid item");
        }

        const [orderItem] = await tx
          .select()
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderID, input.orderID),
              eq(orderItems.itemID, input.itemID),
            ),
          );

        if (!orderItem) {
          throw new Error("Order item not found");
        }

        await tx
          .update(orders)
          .set({
            total: sql`total - ${orderItem.quantity * item.price} + ${
              input.quantity * item.price
            }`,
          })
          .where(eq(orders.id, input.orderID));

        await tx
          .update(items)
          .set({
            stock: sql`stock + ${orderItem.quantity} - ${input.quantity}`,
          })
          .where(eq(items.id, input.itemID));

        await tx
          .update(orderItems)
          .set({
            quantity: input.quantity,
          })
          .where(
            and(
              eq(orderItems.orderID, input.orderID),
              eq(orderItems.itemID, input.itemID),
            ),
          );
      });
    }),
});

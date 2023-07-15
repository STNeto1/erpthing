import { query$ } from "@prpc/solid";
import { and, eq, isNull, like, SQL, sql } from "drizzle-orm";
import { User } from "lucia";
import { z } from "zod";

import { searchOrdersSchema } from "rpc/zod-schemas";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { fetchUserFromId } from "~/db/core";
import { items, itemsToTags, orders, tags, users } from "~/db/schema";

export const userQuery = query$({
  queryFn: async ({ request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new Error("Not authenticated");
    }

    const luciaUser: User | null = await auth.getUser(session.user.userId);
    if (!luciaUser) {
      throw new Error("Not authenticated");
    }

    return fetchUserFromId(session.user.userId);
  },
  key: "user",
});

export const searchUsersQuery = query$({
  queryFn: async () => {
    return await db.select().from(users);
  },
  key: "usersQuery",
});

export const searchTagsQuery = query$({
  queryFn: async ({}) => {
    return db
      .select({
        id: tags.id,
        name: tags.name,
        count: sql<number>`count(${itemsToTags.tagID})`.mapWith(Number),
      })
      .from(tags)
      .leftJoin(itemsToTags, eq(itemsToTags.tagID, tags.id))
      .groupBy(tags.id);
  },
  key: "searchTags",
});

export const searchItemsQuery = query$({
  queryFn: async ({}) => {
    return db.query.items.findMany({
      where: isNull(items.deletedAt),
      with: {
        user: true,
        tags: true,
      },
    });
  },
  key: "searchItems",
});

export const showItemQuery = query$({
  queryFn: async ({ payload }) => {
    const result = await db.query.items.findFirst({
      where: and(eq(items.id, payload.id), isNull(items.deletedAt)),
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
  },
  key: "showItem",
  schema: z.object({
    id: z.string(),
  }),
});

export const searchOrdersQuery = query$({
  queryFn: async ({ payload }) => {
    const where: SQL[] = [];

    if (payload.description) {
      where.push(like(orders.description, `%${payload.description}%`));
    }

    if (payload.status) {
      where.push(eq(orders.status, payload.status));
    }

    if (payload.user) {
      where.push(eq(orders.userID, payload.user));
    }

    return db.query.orders.findMany({
      where: and(...where),
      with: {
        user: true,
      },
    });
  },
  key: "searchOrders",
  schema: searchOrdersSchema,
});

export const showOrderQuery = query$({
  queryFn: async ({ payload }) => {
    const result = await db.query.orders.findFirst({
      where: eq(orders.id, payload.id),
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
  },
  key: "showOrder",
  schema: z.object({
    id: z.string(),
  }),
});

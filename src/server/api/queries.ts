import { query$ } from "@prpc/solid";
import { and, eq, isNull } from "drizzle-orm";
import { User } from "lucia";
import { z } from "zod";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { fetchUserFromId } from "~/db/core";
import { items, orders, tags } from "~/db/schema";

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

export const searchTagsQuery = query$({
  queryFn: async ({}) => {
    return db.select().from(tags).orderBy(tags.id);
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
  queryFn: async ({}) => {
    return db.query.orders.findMany({
      with: {
        user: true,
      },
    });
  },
  key: "searchOrders",
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

import { query$ } from "@prpc/solid";
import { isNull } from "drizzle-orm";
import { User } from "lucia";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { fetchUserFromId } from "~/db/core";
import { items, tags } from "~/db/schema";

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

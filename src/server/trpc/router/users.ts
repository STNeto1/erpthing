import { TRPCError } from "@trpc/server";
import { User } from "lucia";

import { auth } from "~/auth/lucia.server";
import { db } from "~/db/connection";
import { fetchUserFromId } from "~/db/core";
import { users } from "~/db/schema";
import { protectedProcedure, router } from "../utils";

export default router({
  user: protectedProcedure.query(async ({ ctx }) => {
    const luciaUser: User | null = await auth.getUser(ctx.session.user.userId);
    if (!luciaUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return fetchUserFromId(ctx.session.user.userId);
  }),
  searchUsers: protectedProcedure.query(async () => {
    return await db.select().from(users);
  }),
});

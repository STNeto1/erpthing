import { initTRPC, TRPCError } from "@trpc/server";
import SuperJSON from "superjson";

import type { IContext } from "./context";

export const t = initTRPC.context<IContext>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this resource",
      });
    }
    return next({
      ctx: { ...ctx, session: ctx.session },
    });
  }),
);

import type { inferAsyncReturnType } from "@trpc/server";
import type { createSolidAPIHandlerContext } from "solid-start-trpc";

import { auth } from "~/auth/lucia.server";

export const createContextInner = async (
  opts: createSolidAPIHandlerContext,
) => {
  const authRequest = auth.handleRequest(opts.req);
  const session = await authRequest.validate();

  return {
    ...opts,
    session,
  };
};

export const createContext = async (opts: createSolidAPIHandlerContext) => {
  return await createContextInner(opts);
};

export type IContext = inferAsyncReturnType<typeof createContext>;

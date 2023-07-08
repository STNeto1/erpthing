import { query$ } from "@prpc/solid";
import { User } from "lucia";

import { auth } from "~/auth/lucia.server";
import { fetchUserFromId } from "~/db/core";

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

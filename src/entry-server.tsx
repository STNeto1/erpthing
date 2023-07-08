import { redirect } from "solid-start";
import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";

import { auth } from "~/auth/lucia.server";

const guestRoutes = ["/auth/sign-in", "/auth/sign-up"];

export default createHandler(
  ({ forward }) => {
    return async (event) => {
      const authRequest = auth.handleRequest(event.request);
      const session = await authRequest.validate();

      const pathname = new URL(event.request.url).pathname;

      if (session && guestRoutes.includes(pathname)) {
        return redirect("/");
      }

      if (!session && !guestRoutes.includes(pathname)) {
        return redirect("/auth/sign-in");
      }

      return forward(event);
    };
  },
  renderAsync((event) => <StartServer event={event} />),
);

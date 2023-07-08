import { redirect } from "solid-start";
import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";

import { auth } from "~/auth/lucia.server";

const protectedRoutes = ["/"];
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

      if (!session && protectedRoutes.includes(pathname)) {
        return redirect("/auth/sign-in");
      }

      return forward(event); // if we got here, and the pathname is inside the `protectedPaths` array - a user is logged in
    };
  },
  renderAsync((event) => <StartServer event={event} />),
);

import { router } from "../utils";
import items from "./items";
import orders from "./orders";
import tags from "./tags";
import users from "./users";

export const appRouter = router({
  items,
  orders,
  tags,
  users,
});

export type IAppRouter = typeof appRouter;

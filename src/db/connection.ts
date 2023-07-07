import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { serverEnv } from "~/env/server";
import * as schema from "./schema";

export const connection = connect({
  url: serverEnv.DATABASE_URL,
});

export const db = drizzle(connection, {
  logger: true,
  schema,
});

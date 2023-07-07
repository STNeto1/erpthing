import type { Config } from "drizzle-kit";

import { serverEnv } from "~/env/server";

export default {
  schema: "./src/db/schema.ts",
  driver: "mysql2",
  dbCredentials: {
    connectionString: serverEnv.DATABASE_URL,
  },
  tablesFilter: "erp_*",
} satisfies Config;

import { eq } from "drizzle-orm";

import { db } from "~/db/connection";
import { users } from "~/db/schema";

export const checkEmailInUsage = async (email: string) => {
  const result = await db.select().from(users).where(eq(users.email, email));

  return result.length > 0;
};

export const fetchUserFromId = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result.at(0);
};

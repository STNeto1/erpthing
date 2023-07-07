import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import {
  Adapter,
  InitializeAdapter,
  KeySchema,
  lucia,
  SessionSchema,
  UserSchema,
} from "lucia";
import { web } from "lucia/middleware";

import { db } from "~/db/connection";
import { DKey, DSession, DUser, keys, sessions, users } from "~/db/schema";

const mapSession = (data: DSession): SessionSchema => ({
  id: data.id,
  active_expires: data.activeExpires,
  idle_expires: data.idleExpires,
  user_id: data.userId,
});

const mapUser = (data: DUser): UserSchema => ({
  id: data.id,
  name: data.name,
  email: data.email,
});

const mapKey = (data: DKey): KeySchema => ({
  id: data.id,
  hashed_password: data.hashedPassword,
  user_id: data.userId,
});

const drizzleAdapter = (): InitializeAdapter<Adapter> => {
  const driver = {
    getSessionAndUser: async (
      sessionId: string,
    ): Promise<[SessionSchema, UserSchema] | [null, null]> => {
      const result = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
          user: true,
        },
      });

      if (!result) {
        return [null, null];
      }

      return [
        mapSession({
          id: result.id,
          userId: result.userId,
          activeExpires: result.activeExpires,
          idleExpires: result.idleExpires,
        }),
        mapUser(result.user),
      ];
    },
    getSession: async (sessionId: string): Promise<SessionSchema | null> => {
      const [result] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      return result ? mapSession(result) : null;
    },
    getSessionsByUserId: async (userId: string): Promise<SessionSchema[]> => {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId));

      return result.map(mapSession);
    },
    setSession: async (data: SessionSchema): Promise<void> => {
      await db.insert(sessions).values({
        userId: data.user_id,
        idleExpires: data.idle_expires,
        activeExpires: data.active_expires,
        id: data.id,
      });
    },
    updateSession: async (
      sessionId: string,
      data: Partial<SessionSchema>,
    ): Promise<void> => {
      await db
        .update(sessions)
        .set({
          userId: data.user_id,
          idleExpires: data.idle_expires,
          activeExpires: data.active_expires,
          id: data.id,
        })
        .where(eq(sessions.id, sessionId));
    },
    deleteSession: async (sessionId: string): Promise<void> => {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    },
    deleteSessionsByUserId: async (userId: string): Promise<void> => {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    },

    getUser: async (userId: string): Promise<UserSchema | null> => {
      const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return result ? mapUser(result) : null;
    },
    setUser: async (data: UserSchema, key: KeySchema | null): Promise<void> => {
      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          id: data.id,
          name: data.name,
          email: data.email,
        });

        if (key) {
          await db.insert(keys).values({
            userId: key.user_id,
            id: key.id,
            hashedPassword: key.hashed_password,
          });
        }
      });
    },
    updateUser: async (
      userId: string,
      data: Partial<UserSchema>,
    ): Promise<void> => {
      await db
        .update(users)
        .set({
          name: data.name,
          email: data.email,
        })
        .where(eq(users.id, userId));
    },
    deleteUser: async (userId: string): Promise<void> => {
      await db.delete(users).where(eq(users.id, userId));
    },

    getKey: async (keyId: string): Promise<KeySchema | null> => {
      const [result] = await db
        .select()
        .from(keys)
        .where(eq(keys.id, keyId))
        .limit(1);

      return result ? mapKey(result) : null;
    },
    getKeysByUserId: async (userId: string): Promise<KeySchema[]> => {
      const result = await db
        .select()
        .from(keys)
        .where(eq(keys.userId, userId));

      return result.map(mapKey);
    },
    setKey: async (data: KeySchema): Promise<void> => {
      await db.insert(keys).values({
        id: data.id,
        userId: data.user_id,
        hashedPassword: data.hashed_password,
      });
    },
    updateKey: async (
      keyId: string,
      data: Partial<KeySchema>,
    ): Promise<void> => {
      await db
        .update(keys)
        .set({
          userId: data.user_id,
          hashedPassword: data.hashed_password,
        })
        .where(eq(keys.id, keyId));
    },
    deleteKey: async (keyId: string): Promise<void> => {
      await db.delete(keys).where(eq(keys.id, keyId));
    },
    deleteKeysByUserId: async (userId: string): Promise<void> => {
      await db.delete(keys).where(eq(keys.userId, userId));
    },
  };

  return () => driver;
};

export type Auth = typeof auth;
export const auth = lucia({
  adapter: drizzleAdapter(),
  env: "DEV",
  middleware: web(),
  passwordHash: {
    generate: async (password) => {
      return createHash("sha256").update(password).digest("hex");
    },
    validate: async (password, hash) => {
      return createHash("sha256").update(password).digest("hex") === hash;
    },
  },
  sessionCookie: {
    expires: false,
    name: "erpt_sess",
  },
  csrfProtection: true,
});

import { InferModel, relations } from "drizzle-orm";
import { bigint, mysqlTableCreator, varchar } from "drizzle-orm/mysql-core";

const mysqlTable = mysqlTableCreator((name) => `erp_${name}`);

export const users = mysqlTable("auth_user", {
  id: varchar("id", {
    length: 50, // change this when using custom user ids
  }).primaryKey(),
  email: varchar("email", {
    length: 255,
  }).notNull(),
  name: varchar("name", {
    length: 255,
  }).notNull(),
});
export type DUser = InferModel<typeof users>;

export const sessions = mysqlTable("auth_session", {
  id: varchar("id", {
    length: 128,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 50,
  }).notNull(),
  activeExpires: bigint("active_expires", {
    mode: "number",
  }).notNull(),
  idleExpires: bigint("idle_expires", {
    mode: "number",
  }).notNull(),
});
export type DSession = InferModel<typeof sessions>;

export const keys = mysqlTable("auth_key", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 50,
  }).notNull(),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});
export type DKey = InferModel<typeof keys>;

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  keys: many(keys),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const keyRelations = relations(keys, ({ one }) => ({
  user: one(users, {
    fields: [keys.userId],
    references: [users.id],
  }),
}));

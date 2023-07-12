import { InferModel, relations } from "drizzle-orm";
import {
  bigint,
  float,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

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

export const tags = mysqlTable("tags", {
  id: varchar("id", {
    length: 26,
  }).primaryKey(),
  name: varchar("name", {
    length: 255,
  }).notNull(),
});
export type DTag = InferModel<typeof tags>;

export const items = mysqlTable("items", {
  id: varchar("id", {
    length: 26,
  }).primaryKey(),
  name: varchar("name", {
    length: 255,
  }).notNull(),
  description: text("description").notNull(),
  stock: int("stock").notNull(),
  price: float("price").notNull(),
  userID: varchar("user_id", {
    length: 50,
  }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
  }).defaultNow(),
  deletedAt: timestamp("deleted_at", {
    mode: "string",
  }),
});
export type DItem = InferModel<typeof items>;

export const itemsToTags = mysqlTable(
  "items_to_tags",
  {
    itemID: varchar("item_id", {
      length: 26,
    }),
    tagID: varchar("tag_id", {
      length: 26,
    }),
  },
  (t) => ({
    pk: primaryKey(t.itemID, t.tagID),
  }),
);
export type DItemsToTags = InferModel<typeof itemsToTags>;

export const orders = mysqlTable("orders", {
  id: varchar("id", {
    length: 26,
  }).primaryKey(),
  description: text("description").notNull(),
  total: float("total").notNull().default(0),
  status: varchar("status", {
    length: 255,
    enum: ["pending", "paid", "completed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  userID: varchar("user_id", {
    length: 50,
  }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
  }).defaultNow(),
});

export const orderItems = mysqlTable(
  "order_items",
  {
    orderID: varchar("order_id", {
      length: 26,
    }),
    itemID: varchar("item_id", {
      length: 26,
    }),
    quantity: int("quantity").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey(t.orderID, t.itemID),
  }),
);

// ---- Relations ----
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

export const itemsRelations = relations(items, ({ one, many }) => ({
  user: one(users, {
    fields: [items.userID],
    references: [users.id],
  }),
  tags: many(itemsToTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  items: many(itemsToTags),
}));

export const itemsToTagsRelations = relations(itemsToTags, ({ one }) => ({
  item: one(items, {
    fields: [itemsToTags.itemID],
    references: [items.id],
  }),
  tag: one(tags, {
    fields: [itemsToTags.tagID],
    references: [tags.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userID],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ many, one }) => ({
  order: one(orders, {
    fields: [orderItems.orderID],
    references: [orders.id],
  }),
  item: one(items, {
    fields: [orderItems.itemID],
    references: [items.id],
  }),
}));

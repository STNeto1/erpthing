import { z } from "zod";

import { orders } from "~/db/schema";

// ----- Tag -----
export const createTagSchema = z.object({
  name: z.string().min(4),
});
export type CreateTagSchema = z.infer<typeof createTagSchema>;

export const updateTagSchema = z.object({
  id: z.string(),
  name: z.string().min(4),
});
export type UpdateTagSchema = z.infer<typeof updateTagSchema>;

export const deleteTagSchema = z.object({
  id: z.string(),
});

// ----- Item -----
export const searchItemsSchema = z.object({
  description: z.optional(z.string()),
  user: z.optional(z.string()),
});
export type SearchItemsSchema = z.infer<typeof searchItemsSchema>;

export const createItemSchema = z.object({
  name: z.string().min(4),
  description: z.string().min(4),
  stock: z.number().min(0),
  price: z.number().min(0),
  tags: z.array(z.string()),
});
export type CreateItemSchema = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  id: z.string(),
  name: z.string().min(4),
  description: z.string().min(4),
  stock: z.number().min(0),
  price: z.number().min(0),
  tags: z.array(z.string()),
});
export type UpdateItemSchema = z.infer<typeof updateItemSchema>;

export const deleteItemSchema = z.object({
  id: z.string(),
});

// ----- Order -----
export const searchOrdersSchema = z.object({
  description: z.optional(z.string()),
  status: z.optional(z.enum(orders.status.enumValues)),
  user: z.optional(z.string()),
});
export type SearchOrdersSchema = z.infer<typeof searchOrdersSchema>;

export const createOrderSchema = z.object({
  description: z.string().min(4),
});
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  orderID: z.string().min(1),
});
export type UpdateOrderSchema = z.infer<typeof updateOrderSchema>;

export const createOrderItemSchema = z.object({
  orderID: z.string().min(1),
  itemID: z.string().min(1),
  quantity: z.number().min(1),
});
export type CreateOrderItemSchema = z.infer<typeof createOrderItemSchema>;

export const deleteOrderItemSchema = z.object({
  orderID: z.string().min(1),
  itemID: z.string().min(1),
});
export type DeleteOrderItemSchema = z.infer<typeof deleteOrderItemSchema>;

export const updateOrderItemSchema = z.object({
  orderID: z.string().min(1),
  itemID: z.string().min(1),
  quantity: z.number().min(1),
});
export type UpdateOrderItemSchema = z.infer<typeof updateOrderItemSchema>;

import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  assignee: varchar("assignee", { length: 100 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  priority: varchar("priority", { length: 2 }).notNull().default("P3"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  completed: timestamp("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completed: true,
}).extend({
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["P1", "P2", "P3", "P4"]).default("P3"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).partial().extend({
  dueDate: z.string().optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export const parseTaskSchema = z.object({
  input: z.string().min(1, "Task input is required"),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type ParseTaskInput = z.infer<typeof parseTaskSchema>;
export type Task = typeof tasks.$inferSelect;

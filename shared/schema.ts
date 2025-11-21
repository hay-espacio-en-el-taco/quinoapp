import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  specialistId: varchar("specialist_id"),
  targetCalories: integer("target_calories").default(2000),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  specialist: one(users, {
    fields: [users.specialistId],
    references: [users.id],
    relationName: "specialist_clients"
  }),
  clients: many(users, {
    relationName: "specialist_clients"
  }),
  schedules: many(schedules),
  complianceLogs: many(complianceLogs),
}));

export const meals = pgTable("meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  mealType: text("meal_type").notNull(),
  calories: integer("calories").notNull(),
  protein: decimal("protein", { precision: 5, scale: 1 }).notNull(),
  carbs: decimal("carbs", { precision: 5, scale: 1 }).notNull(),
  fats: decimal("fats", { precision: 5, scale: 1 }).notNull(),
  servingSize: text("serving_size"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealsRelations = relations(meals, ({ many }) => ({
  scheduleEntries: many(scheduleEntries),
}));

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").notNull(),
  instructions: jsonb("instructions").notNull(),
  calories: integer("calories").notNull(),
  protein: decimal("protein", { precision: 5, scale: 1 }).notNull(),
  carbs: decimal("carbs", { precision: 5, scale: 1 }).notNull(),
  fats: decimal("fats", { precision: 5, scale: 1 }).notNull(),
  servingSize: text("serving_size"),
  imageUrl: text("image_url"),
  mealType: text("meal_type"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipesRelations = relations(recipes, ({ one }) => ({
  creator: one(users, {
    fields: [recipes.createdBy],
    references: [users.id],
  }),
}));

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  user: one(users, {
    fields: [schedules.userId],
    references: [users.id],
  }),
  entries: many(scheduleEntries),
}));

export const scheduleEntries = pgTable("schedule_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scheduleId: varchar("schedule_id").notNull(),
  mealId: varchar("meal_id").notNull(),
  mealType: text("meal_type").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleEntriesRelations = relations(scheduleEntries, ({ one }) => ({
  schedule: one(schedules, {
    fields: [scheduleEntries.scheduleId],
    references: [schedules.id],
  }),
  meal: one(meals, {
    fields: [scheduleEntries.mealId],
    references: [meals.id],
  }),
}));

export const complianceLogs = pgTable("compliance_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mealId: varchar("meal_id").notNull(),
  mealType: text("meal_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceLogsRelations = relations(complianceLogs, ({ one }) => ({
  user: one(users, {
    fields: [complianceLogs.userId],
    references: [users.id],
  }),
  meal: one(meals, {
    fields: [complianceLogs.mealId],
    references: [meals.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceLogSchema = createInsertSchema(complianceLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

export type InsertScheduleEntry = z.infer<typeof insertScheduleEntrySchema>;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;

export type InsertComplianceLog = z.infer<typeof insertComplianceLogSchema>;
export type ComplianceLog = typeof complianceLogs.$inferSelect;

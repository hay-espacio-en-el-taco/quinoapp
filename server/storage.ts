import {
  users,
  meals,
  recipes,
  schedules,
  scheduleEntries,
  complianceLogs,
  type User,
  type InsertUser,
  type Meal,
  type InsertMeal,
  type Recipe,
  type InsertRecipe,
  type Schedule,
  type InsertSchedule,
  type ScheduleEntry,
  type InsertScheduleEntry,
  type ComplianceLog,
  type InsertComplianceLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserClients(specialistId: string): Promise<User[]>;
  getUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  updateUserPhone(userId: string, phoneNumber: string): Promise<User | undefined>;

  getMeal(id: string): Promise<Meal | undefined>;
  getMealsByType(mealType: string): Promise<Meal[]>;
  getMealsByCalorieRange(minCal: number, maxCal: number, mealType?: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  getAllMeals(): Promise<Meal[]>;
  
  getRecipe(id: string): Promise<Recipe | undefined>;
  getAllRecipes(): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  
  getActiveScheduleForUser(userId: string): Promise<Schedule | undefined>;
  getSchedule(id: string): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getScheduleEntries(scheduleId: string): Promise<ScheduleEntry[]>;
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  updateScheduleEntry(id: string, mealId: string): Promise<ScheduleEntry | undefined>;
  
  getComplianceLogs(userId: string, startDate?: Date, endDate?: Date): Promise<ComplianceLog[]>;
  createComplianceLog(log: InsertComplianceLog): Promise<ComplianceLog>;
  updateComplianceLog(id: string, status: string, completedAt?: Date): Promise<ComplianceLog | undefined>;
  getComplianceLogByUserAndDate(userId: string, mealType: string, scheduledDate: Date): Promise<ComplianceLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserClients(specialistId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.specialistId, specialistId));
  }

  async getUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.authProvider, provider),
        eq(users.authProviderId, providerId)
      )
    );
    return user || undefined;
  }

  async updateUserPhone(userId: string, phoneNumber: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ phoneNumber })
      .where(eq(users.id, userId))
      .returning();
    return updated || undefined;
  }

  async getMeal(id: string): Promise<Meal | undefined> {
    const [meal] = await db.select().from(meals).where(eq(meals.id, id));
    return meal || undefined;
  }

  async getMealsByType(mealType: string): Promise<Meal[]> {
    return db.select().from(meals).where(eq(meals.mealType, mealType));
  }

  async getMealsByCalorieRange(minCal: number, maxCal: number, mealType?: string): Promise<Meal[]> {
    if (mealType) {
      return db.select().from(meals).where(
        and(
          eq(meals.mealType, mealType),
          gte(meals.calories, minCal),
          lte(meals.calories, maxCal)
        )
      );
    }
    return db.select().from(meals).where(
      and(
        gte(meals.calories, minCal),
        lte(meals.calories, maxCal)
      )
    );
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async getAllMeals(): Promise<Meal[]> {
    return db.select().from(meals);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return db.select().from(recipes).orderBy(desc(recipes.createdAt));
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }

  async getActiveScheduleForUser(userId: string): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(
      and(
        eq(schedules.userId, userId),
        eq(schedules.isActive, true)
      )
    );
    return schedule || undefined;
  }

  async getSchedule(id: string): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule || undefined;
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db.insert(schedules).values(schedule).returning();
    return newSchedule;
  }

  async getScheduleEntries(scheduleId: string): Promise<ScheduleEntry[]> {
    return db.select().from(scheduleEntries).where(eq(scheduleEntries.scheduleId, scheduleId));
  }

  async createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry> {
    const [newEntry] = await db.insert(scheduleEntries).values(entry).returning();
    return newEntry;
  }

  async updateScheduleEntry(id: string, mealId: string): Promise<ScheduleEntry | undefined> {
    const [updated] = await db
      .update(scheduleEntries)
      .set({ mealId })
      .where(eq(scheduleEntries.id, id))
      .returning();
    return updated || undefined;
  }

  async getComplianceLogs(userId: string, startDate?: Date, endDate?: Date): Promise<ComplianceLog[]> {
    let query = db.select().from(complianceLogs).where(eq(complianceLogs.userId, userId));
    
    if (startDate && endDate) {
      return db.select().from(complianceLogs).where(
        and(
          eq(complianceLogs.userId, userId),
          gte(complianceLogs.scheduledDate, startDate),
          lte(complianceLogs.scheduledDate, endDate)
        )
      ).orderBy(desc(complianceLogs.scheduledDate));
    }
    
    return query.orderBy(desc(complianceLogs.scheduledDate));
  }

  async createComplianceLog(log: InsertComplianceLog): Promise<ComplianceLog> {
    const [newLog] = await db.insert(complianceLogs).values(log).returning();
    return newLog;
  }

  async updateComplianceLog(id: string, status: string, completedAt?: Date): Promise<ComplianceLog | undefined> {
    const [updated] = await db
      .update(complianceLogs)
      .set({ status, completedAt })
      .where(eq(complianceLogs.id, id))
      .returning();
    return updated || undefined;
  }

  async getComplianceLogByUserAndDate(userId: string, mealType: string, scheduledDate: Date): Promise<ComplianceLog | undefined> {
    const [log] = await db.select().from(complianceLogs).where(
      and(
        eq(complianceLogs.userId, userId),
        eq(complianceLogs.mealType, mealType),
        eq(complianceLogs.scheduledDate, scheduledDate)
      )
    );
    return log || undefined;
  }
}

export const storage = new DatabaseStorage();

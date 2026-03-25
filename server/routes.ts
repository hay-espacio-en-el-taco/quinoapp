import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { analyzeGroceryImage, generateRecipe } from "./openai";
import { z } from "zod";
import { startOfDay, addDays } from "date-fns";
import { requireAuth } from "./auth";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server>;
export async function registerRoutes(app: Express, skipServer?: boolean): Promise<Server | void>;
export async function registerRoutes(app: Express, skipServer?: boolean): Promise<Server | void> {
  // Health check endpoint for Docker (no auth required)
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Protect all /api routes except /api/auth/* and /api/health
  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth") || req.path === "/health") {
      return next();
    }
    requireAuth(req, res, next);
  });

  app.get("/api/schedule/today", async (req, res) => {
    try {
      const today = startOfDay(new Date());
      const schedule = await storage.getActiveScheduleForUser(req.user!.id);

      if (!schedule) {
        return res.json({
          meals: [],
          totalCalories: 0,
          consumedCalories: 0,
          targetCalories: 2000,
        });
      }

      const entries = await storage.getScheduleEntries(schedule.id);
      const todayDayOfWeek = today.getDay();
      const todayEntries = entries.filter(e => e.dayOfWeek === todayDayOfWeek);

      const mealsWithCompletion = await Promise.all(
        todayEntries.map(async (entry) => {
          const meal = await storage.getMeal(entry.mealId);
          const complianceLog = await storage.getComplianceLogByUserAndDate(
            req.user!.id,
            entry.mealType,
            today
          );

          return {
            mealType: entry.mealType,
            meal: meal!,
            completed: complianceLog?.status === "completed",
          };
        })
      );

      const totalCalories = mealsWithCompletion.reduce((sum, m) => sum + m.meal.calories, 0);
      const consumedCalories = mealsWithCompletion
        .filter(m => m.completed)
        .reduce((sum, m) => sum + m.meal.calories, 0);

      res.json({
        meals: mealsWithCompletion,
        totalCalories,
        consumedCalories,
        targetCalories: 2000,
      });
    } catch (error) {
      console.error("Error fetching today's schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.get("/api/meals/alternatives", async (req, res) => {
    try {
      const { mealType } = req.query;
      if (!mealType || typeof mealType !== "string") {
        return res.status(400).json({ error: "mealType is required" });
      }

      const schedule = await storage.getActiveScheduleForUser(req.user!.id);
      if (!schedule) {
        return res.json([]);
      }

      const entries = await storage.getScheduleEntries(schedule.id);
      const currentEntry = entries.find(e => e.mealType === mealType);

      if (!currentEntry) {
        return res.json([]);
      }

      const currentMeal = await storage.getMeal(currentEntry.mealId);
      if (!currentMeal) {
        return res.json([]);
      }

      const alternatives = await storage.getMealsByCalorieRange(
        currentMeal.calories - 50,
        currentMeal.calories + 50,
        mealType
      );

      const filtered = alternatives.filter(m => m.id !== currentMeal.id);
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching alternatives:", error);
      res.status(500).json({ error: "Failed to fetch alternatives" });
    }
  });

  app.post("/api/schedule/replace-meal", async (req, res) => {
    try {
      const { mealType, newMealId } = req.body;

      const schedule = await storage.getActiveScheduleForUser(req.user!.id);
      if (!schedule) {
        return res.status(404).json({ error: "No active schedule found" });
      }

      const entries = await storage.getScheduleEntries(schedule.id);
      const entryToUpdate = entries.find(e => e.mealType === mealType);

      if (!entryToUpdate) {
        return res.status(404).json({ error: "Meal entry not found" });
      }

      const updated = await storage.updateScheduleEntry(entryToUpdate.id, newMealId);
      res.json(updated);
    } catch (error) {
      console.error("Error replacing meal:", error);
      res.status(500).json({ error: "Failed to replace meal" });
    }
  });

  app.post("/api/compliance/complete", async (req, res) => {
    try {
      const { mealType } = req.body;
      const today = startOfDay(new Date());

      const schedule = await storage.getActiveScheduleForUser(req.user!.id);
      if (!schedule) {
        return res.status(404).json({ error: "No active schedule found" });
      }

      const entries = await storage.getScheduleEntries(schedule.id);
      const todayDayOfWeek = today.getDay();
      const entry = entries.find(e => e.mealType === mealType && e.dayOfWeek === todayDayOfWeek);

      if (!entry) {
        return res.status(404).json({ error: "Meal not found in schedule" });
      }

      let log = await storage.getComplianceLogByUserAndDate(req.user!.id, mealType, today);

      if (!log) {
        log = await storage.createComplianceLog({
          userId: req.user!.id,
          mealId: entry.mealId,
          mealType,
          scheduledDate: today,
          status: "completed",
          completedAt: new Date(),
        });
      } else {
        log = await storage.updateComplianceLog(log.id, "completed", new Date()) || log;
      }

      res.json(log);
    } catch (error) {
      console.error("Error completing meal:", error);
      res.status(500).json({ error: "Failed to complete meal" });
    }
  });

  app.get("/api/compliance/history", async (req, res) => {
    try {
      const logs = await storage.getComplianceLogs(req.user!.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching compliance history:", error);
      res.status(500).json({ error: "Failed to fetch compliance history" });
    }
  });

  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.post("/api/grocery/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const base64Image = req.file.buffer.toString("base64");
      const analysis = await analyzeGroceryImage(base64Image);

      const recipe = await generateRecipe(
        analysis.ingredients,
        analysis.suggestedMealType,
        500
      );

      const savedRecipe = await storage.createRecipe({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        calories: recipe.calories,
        protein: recipe.protein.toString(),
        carbs: recipe.carbs.toString(),
        fats: recipe.fats.toString(),
        servingSize: recipe.servingSize,
        mealType: analysis.suggestedMealType,
        createdBy: req.user!.id,
      });

      res.json({ recipe: savedRecipe });
    } catch (error) {
      console.error("Error analyzing grocery image:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.get("/api/specialist/stats", async (req, res) => {
    try {
      const user = await storage.getUserByEmail("user@nutriplan.com");
      if (!user) {
        return res.json({
          totalClients: 0,
          activePlans: 0,
          averageCompliance: 0,
          pendingReviews: 0,
        });
      }

      let specialistId = user.id;
      const specialist = await storage.getUserByEmail("specialist@nutriplan.com");
      if (specialist) {
        specialistId = specialist.id;
      }

      const clients = await storage.getUserClients(specialistId);

      let totalCompliance = 0;
      for (const client of clients) {
        const logs = await storage.getComplianceLogs(client.id);
        const completedLogs = logs.filter(l => l.status === "completed");
        const compliance = logs.length > 0 ? (completedLogs.length / logs.length) * 100 : 0;
        totalCompliance += compliance;
      }

      const avgCompliance = clients.length > 0 ? Math.round(totalCompliance / clients.length) : 0;

      res.json({
        totalClients: clients.length,
        activePlans: clients.length,
        averageCompliance: avgCompliance,
        pendingReviews: Math.floor(clients.length / 3),
      });
    } catch (error) {
      console.error("Error fetching specialist stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/specialist/clients", async (req, res) => {
    try {
      const user = await storage.getUserByEmail("user@nutriplan.com");
      if (!user) {
        return res.json([]);
      }

      let specialistId = user.id;
      const specialist = await storage.getUserByEmail("specialist@nutriplan.com");
      if (specialist) {
        specialistId = specialist.id;

        const client1 = await storage.getUserByEmail("client1@nutriplan.com");
        if (!client1) {
          await storage.createUser({
            username: "client1",
            password: "hashed_password",
            email: "client1@nutriplan.com",
            fullName: "John Smith",
            role: "user",
            specialistId: specialist.id,
            targetCalories: 2200,
          });
        }

        const client2 = await storage.getUserByEmail("client2@nutriplan.com");
        if (!client2) {
          await storage.createUser({
            username: "client2",
            password: "hashed_password",
            email: "client2@nutriplan.com",
            fullName: "Emma Williams",
            role: "user",
            specialistId: specialist.id,
            targetCalories: 1800,
          });
        }
      }

      const clients = await storage.getUserClients(specialistId);

      const clientsWithCompliance = await Promise.all(
        clients.map(async (client) => {
          const logs = await storage.getComplianceLogs(client.id);
          const completedLogs = logs.filter(l => l.status === "completed");
          const complianceRate = logs.length > 0
            ? Math.round((completedLogs.length / logs.length) * 100)
            : 0;

          return {
            ...client,
            complianceRate,
            lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          };
        })
      );

      res.json(clientsWithCompliance);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  if (skipServer) return;
  const httpServer = createServer(app);
  return httpServer;
}

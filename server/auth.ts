import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPgSimple from "connect-pg-simple";
import crypto from "crypto";
import { pool } from "./db";
import { storage } from "./storage";
import { phoneNumberSchema } from "../shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
      phoneNumber: string | null;
      authProvider: string | null;
      authProviderId: string | null;
      specialistId: string | null;
      targetCalories: number | null;
      password: string | null;
      createdAt: Date;
    }
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return hashPassword(password, salt) === hash;
}

function createHashedPassword(password: string): string {
  const salt = generateSalt();
  return `${salt}:${hashPassword(password, salt)}`;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
});

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  const isProduction = process.env.NODE_ENV === "production";

  app.set("trust proxy", 1);

  app.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "nutriplan-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        if (!verifyPassword(password, user.password)) {
          return done(null, false, { message: "Invalid username or password" });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    })
  );

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        const { password, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { username, email, password, fullName } = result.data;

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser({
        username,
        email,
        password: createHashedPassword(password),
        fullName,
        role: "user",
        authProvider: "local",
      });

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration succeeded but login failed" });
        }
        const { password: _, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as Express.User;
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // Update phone number
  app.post("/api/auth/phone", requireAuth, async (req, res) => {
    try {
      const result = phoneNumberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }
      const user = req.user as Express.User;
      const updated = await storage.updateUserPhone(user.id, result.data.phoneNumber);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating phone:", error);
      res.status(500).json({ message: "Failed to update phone number" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to destroy session" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
      });
    });
  });
}

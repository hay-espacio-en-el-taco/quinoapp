import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import { phoneNumberSchema } from "@shared/schema";

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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

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
        secure: false,
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

  const appUrl = process.env.APP_URL || "http://localhost:5000";

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${appUrl}/api/auth/google/callback`,
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByProviderId("google", profile.id);
            if (!user) {
              const email = profile.emails?.[0]?.value;
              if (!email) {
                return done(new Error("No email provided by Google"));
              }
              // Check if user with this email already exists
              user = await storage.getUserByEmail(email);
              if (!user) {
                user = await storage.createUser({
                  username: email.split("@")[0] + "_google",
                  email,
                  fullName: profile.displayName || email.split("@")[0],
                  authProvider: "google",
                  authProviderId: profile.id,
                  role: "user",
                });
              }
            }
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `${appUrl}/api/auth/facebook/callback`,
          profileFields: ["id", "emails", "name", "displayName"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByProviderId("facebook", profile.id);
            if (!user) {
              const email = profile.emails?.[0]?.value;
              if (!email) {
                return done(new Error("No email provided by Facebook. Please ensure your Facebook account has a verified email."));
              }
              user = await storage.getUserByEmail(email);
              if (!user) {
                const displayName = profile.displayName ||
                  [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(" ") ||
                  email.split("@")[0];
                user = await storage.createUser({
                  username: email.split("@")[0] + "_facebook",
                  email,
                  fullName: displayName,
                  authProvider: "facebook",
                  authProviderId: profile.id,
                  role: "user",
                });
              }
            }
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  // Auth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      const user = req.user as Express.User;
      if (!user.phoneNumber) {
        return res.redirect("/collect-phone");
      }
      res.redirect("/");
    }
  );

  app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

  app.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => {
      const user = req.user as Express.User;
      if (!user.phoneNumber) {
        return res.redirect("/collect-phone");
      }
      res.redirect("/");
    }
  );

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as Express.User;
    // Don't send password to client
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

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

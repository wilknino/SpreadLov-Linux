var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";

// server/storage.ts
import session2 from "express-session";
import createMemoryStore from "memorystore";

// server/pg-storage.ts
import { eq, and, or, desc } from "drizzle-orm";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  conversations: () => conversations,
  insertConversationSchema: () => insertConversationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertUserSchema: () => insertUserSchema,
  messages: () => messages,
  notifications: () => notifications,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender").notNull(),
  profilePhoto: text("profile_photo"),
  age: integer("age").notNull(),
  location: text("location"),
  bio: text("bio"),
  photos: json("photos"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  filterGender: text("filter_gender"),
  filterLocation: text("filter_location"),
  filterAgeMin: integer("filter_age_min"),
  filterAgeMax: integer("filter_age_max"),
  emailVerified: boolean("email_verified").default(false),
  verificationCode: text("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  lastCodeSentAt: timestamp("last_code_sent_at")
});
var conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content"),
  imageUrl: text("image_url"),
  timestamp: timestamp("timestamp").defaultNow()
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(),
  // 'profile_view' | 'message_received'
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  // optional, for message notifications
  isRead: boolean("is_read").default(false),
  data: json("data"),
  // additional metadata
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
  emailVerified: true,
  verificationCode: true,
  verificationCodeExpiry: true,
  lastCodeSentAt: true
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  age: z.number().int().min(18, "Age must be at least 18").max(99, "Age must be at most 99"),
  location: z.string().max(100, "Location must be at most 100 characters").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  photos: z.array(z.string().url("Invalid URL")).max(5, "Maximum 5 photos allowed").optional()
});
var insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
}).extend({
  content: z.string().optional(),
  imageUrl: z.string().optional()
}).refine((data) => data.content || data.imageUrl, {
  message: "Message must contain either text content or an image"
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true
}).extend({
  type: z.enum(["profile_view", "message_received"]),
  data: z.record(z.any()).optional()
});

// server/pg-storage.ts
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
var db = drizzle(pool, { schema: schema_exports });

// server/pg-storage.ts
var PgSession = ConnectPgSimple(session);
var PgStorage = class {
  db;
  sessionStore;
  constructor() {
    this.db = db;
    this.sessionStore = new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true
    });
  }
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(user) {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }
  async updateUser(id, updates) {
    const result = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getConversation(user1Id, user2Id) {
    const result = await this.db.select().from(conversations).where(
      or(
        and(eq(conversations.participant1Id, user1Id), eq(conversations.participant2Id, user2Id)),
        and(eq(conversations.participant1Id, user2Id), eq(conversations.participant2Id, user1Id))
      )
    ).limit(1);
    return result[0];
  }
  async createConversation(conversation) {
    const result = await this.db.insert(conversations).values(conversation).returning();
    return result[0];
  }
  async getUserConversations(userId) {
    const userConversations = await this.db.select().from(conversations).where(
      or(
        eq(conversations.participant1Id, userId),
        eq(conversations.participant2Id, userId)
      )
    ).orderBy(desc(conversations.lastMessageAt));
    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
        const otherUser = await this.getUser(otherUserId);
        const conversationMessages = await this.getMessages(conv.id);
        const lastMessage = conversationMessages[conversationMessages.length - 1];
        return {
          ...conv,
          otherUser,
          lastMessage
        };
      })
    );
    return enrichedConversations;
  }
  async getMessages(conversationId) {
    const result = await this.db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.timestamp);
    return result;
  }
  async createMessage(message) {
    const result = await this.db.insert(messages).values(message).returning();
    await this.db.update(conversations).set({ lastMessageAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, message.conversationId));
    return result[0];
  }
  async getAllUsers() {
    const result = await this.db.select().from(users);
    return result;
  }
  async getOnlineUsers() {
    const result = await this.db.select().from(users).where(eq(users.isOnline, true)).orderBy(desc(users.lastSeen));
    return result;
  }
  async setUserOnlineStatus(userId, isOnline) {
    await this.db.update(users).set({
      isOnline,
      lastSeen: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  // Notification methods
  async getUserNotifications(userId) {
    const userNotifications = await this.db.select({
      notification: notifications,
      fromUser: users
    }).from(notifications).leftJoin(users, eq(notifications.fromUserId, users.id)).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    return userNotifications.map(({ notification, fromUser }) => ({
      ...notification,
      fromUser
    }));
  }
  async createNotification(notification) {
    const result = await this.db.insert(notifications).values(notification).returning();
    return result[0];
  }
  async markNotificationAsRead(notificationId) {
    await this.db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
  }
  async markAllNotificationsAsRead(userId) {
    await this.db.update(notifications).set({ isRead: true }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }
  async deleteNotification(notificationId) {
    await this.db.delete(notifications).where(eq(notifications.id, notificationId));
  }
  async getUnreadNotificationCount(userId) {
    const result = await this.db.select({ count: notifications.id }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }
  // Email verification methods
  async setVerificationCode(userId, code, expiry) {
    await this.db.update(users).set({
      verificationCode: code,
      verificationCodeExpiry: expiry
    }).where(eq(users.id, userId));
  }
  async verifyCode(userId, code) {
    const user = await this.getUser(userId);
    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return false;
    }
    const now = /* @__PURE__ */ new Date();
    const isCodeValid = user.verificationCode === code && user.verificationCodeExpiry > now;
    return isCodeValid;
  }
  async markEmailAsVerified(userId) {
    await this.db.update(users).set({
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpiry: null
    }).where(eq(users.id, userId));
  }
  async canResendCode(userId) {
    const user = await this.getUser(userId);
    if (!user || !user.lastCodeSentAt) {
      return true;
    }
    const now = /* @__PURE__ */ new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1e3);
    return user.lastCodeSentAt < oneMinuteAgo;
  }
  async updateLastCodeSentAt(userId) {
    await this.db.update(users).set({ lastCodeSentAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
  }
  async updateUserVerification(userId, verified) {
    const result = await this.db.update(users).set({
      emailVerified: verified,
      verificationCode: verified ? null : void 0,
      verificationCodeExpiry: verified ? null : void 0
    }).where(eq(users.id, userId)).returning();
    if (!result[0]) {
      throw new Error("User not found");
    }
    return result[0];
  }
  async updateUserVerificationCode(userId, code, expiry) {
    await this.db.update(users).set({
      verificationCode: code,
      verificationCodeExpiry: expiry,
      lastCodeSentAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
};

// server/storage.ts
var MemoryStore = createMemoryStore(session2);
var storage = new PgStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session3 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// server/email.ts
import nodemailer from "nodemailer";
function generateVerificationCode() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
function getEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-mail.outlook.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER || "spreadlov@outlook.com",
      pass: process.env.SMTP_PASS
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false
    }
  });
}
async function sendVerificationEmail(to, code, firstName) {
  const transporter = getEmailTransporter();
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logo-icon {
          font-size: 32px;
          color: #667eea;
        }
        .header-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .code-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code-label {
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .code {
          font-size: 42px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .expiry {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px 20px;
          margin: 30px 0;
          border-radius: 6px;
        }
        .expiry-text {
          color: #92400e;
          font-size: 14px;
          margin: 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        .security-note {
          background-color: #f3f4f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .security-text {
          color: #4b5563;
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">\u2764\uFE0F</span>
          </div>
          <h1 class="header-title">SpreadLov</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${firstName},</p>
          
          <p class="message">
            Welcome to SpreadLov! We're excited to have you join our community. 
            To complete your registration, please verify your email address using the code below:
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Verification Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="expiry">
            <p class="expiry-text">
              \u23F0 This code will expire in 10 minutes. Please enter it soon to complete your registration.
            </p>
          </div>
          
          <div class="security-note">
            <p class="security-text">
              \u{1F512} <strong>Security Tip:</strong> Never share this code with anyone. SpreadLov will never ask you 
              for this code via phone, email, or any other method outside of the verification page.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">Spread love and connect with amazing people</p>
          <p class="footer-text" style="color: #9ca3af;">\xA9 2025 SpreadLov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || "spreadlov@outlook.com"}>`,
    to,
    subject: "Verify Your Email - SpreadLov",
    html: htmlContent
  });
}

// server/auth.ts
function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    age: user.age,
    location: user.location,
    bio: user.bio,
    profilePhoto: user.profilePhoto,
    photos: user.photos,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified
  };
}
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session3(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }
      const hashedPassword = await hashPassword(req.body.password);
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1e3);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        emailVerified: false,
        verificationCode: code,
        verificationCodeExpiry: expiry,
        lastCodeSentAt: null
        // Email not sent yet
      });
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.status(201).json(toPublicUser(user));
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Failed to register user" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        res.status(200).json(toPublicUser(user));
      });
    })(req, res, next);
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(toPublicUser(req.user));
  });
  app2.post("/api/verify-email", async (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Verification code is required" });
    }
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Please login to verify your email" });
      }
      const user = req.user;
      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified"
        });
      }
      const now = /* @__PURE__ */ new Date();
      const isCodeValid = user.verificationCode === code && user.verificationCodeExpiry && new Date(user.verificationCodeExpiry) > now;
      if (!isCodeValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code"
        });
      }
      const updatedUser = await storage.updateUserVerification(user.id, true);
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("Session update error after verification:", err);
        }
      });
      res.json({
        success: true,
        message: "Email verified successfully",
        user: toPublicUser(updatedUser)
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
  app2.post("/api/resend-verification", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Please login to resend verification code" });
      }
      const user = req.user;
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      const now = /* @__PURE__ */ new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1e3);
      const lastSent = user.lastCodeSentAt ? new Date(user.lastCodeSentAt) : /* @__PURE__ */ new Date(0);
      if (lastSent > oneMinuteAgo) {
        const timeLeft = Math.ceil((6e4 - (now.getTime() - lastSent.getTime())) / 1e3);
        return res.status(429).json({
          message: `Please wait ${timeLeft} seconds before requesting a new code`,
          timeLeft
        });
      }
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1e3);
      await storage.updateUserVerificationCode(user.id, code, expiry);
      try {
        await sendVerificationEmail(user.email, code, user.firstName);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError.message);
        return res.status(500).json({
          message: "Failed to send verification email. Please try again later."
        });
      }
      res.json({
        success: true,
        message: "Verification code sent successfully"
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: error.message || "Failed to resend verification code" });
    }
  });
  app2.post("/api/auto-send-verification", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        console.log("Auto-send: User not authenticated");
        return res.status(401).json({ message: "Please login first" });
      }
      const user = req.user;
      console.log(`Auto-send verification for user: ${user.email} (ID: ${user.id})`);
      if (user.emailVerified) {
        console.log("Auto-send: User already verified");
        return res.status(400).json({ message: "Email is already verified" });
      }
      const now = /* @__PURE__ */ new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1e3);
      const lastSent = user.lastCodeSentAt ? new Date(user.lastCodeSentAt) : /* @__PURE__ */ new Date(0);
      console.log(`Auto-send: Last code sent at: ${lastSent}, One minute ago: ${oneMinuteAgo}`);
      if (lastSent > oneMinuteAgo) {
        console.log("Auto-send: Code already sent recently, skipping");
        return res.json({
          success: true,
          message: "Code already sent recently",
          alreadySent: true
        });
      }
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1e3);
      console.log(`Auto-send: Generating new code: ${code} (expires: ${expiry})`);
      await storage.updateUserVerificationCode(user.id, code, expiry);
      console.log("Auto-send: Updated user verification code in database");
      try {
        console.log(`Auto-send: Attempting to send email to ${user.email}...`);
        await sendVerificationEmail(user.email, code, user.firstName);
        console.log(`Auto-send: \u2705 Email sent successfully to ${user.email}`);
      } catch (emailError) {
        console.error("Auto-send: \u274C Failed to send verification email:", emailError);
        console.error("Auto-send: Error details:", emailError.message);
        return res.status(500).json({
          message: "Failed to send verification email. Please try again later."
        });
      }
      res.json({
        success: true,
        message: "Verification code sent successfully"
      });
    } catch (error) {
      console.error("Auto-send verification error:", error);
      res.status(500).json({ message: error.message || "Failed to send verification code" });
    }
  });
}

// server/routes.ts
import { parse as parseCookie } from "cookie";
function toPublicUser2(user) {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    age: user.age,
    location: user.location,
    bio: user.bio,
    profilePhoto: user.profilePhoto,
    photos: user.photos,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen
  };
}
var upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  }
});
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app2.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { gender, location, ageMin, ageMax } = req.query;
      let users2 = await storage.getAllUsers();
      users2 = users2.filter((user) => user.id !== req.user.id);
      users2 = users2.filter((user) => user.emailVerified === true);
      if (gender && gender !== "") {
        users2 = users2.filter((user) => user.gender === gender);
      }
      if (location && location !== "") {
        users2 = users2.filter(
          (user) => user.location && user.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      if (ageMin) {
        const minAge = parseInt(ageMin);
        if (!isNaN(minAge) && minAge >= 18) {
          users2 = users2.filter((user) => user.age >= minAge);
        }
      }
      if (ageMax) {
        const maxAge = parseInt(ageMax);
        if (!isNaN(maxAge) && maxAge <= 99) {
          users2 = users2.filter((user) => user.age <= maxAge);
        }
      }
      res.json(users2.map(toPublicUser2));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/online", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { gender, location, ageMin, ageMax } = req.query;
      let users2 = await storage.getOnlineUsers();
      users2 = users2.filter((user) => user.id !== req.user.id);
      users2 = users2.filter((user) => user.emailVerified === true);
      if (gender && gender !== "") {
        users2 = users2.filter((user) => user.gender === gender);
      }
      if (location && location !== "") {
        users2 = users2.filter(
          (user) => user.location && user.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      if (ageMin) {
        const minAge = parseInt(ageMin);
        if (!isNaN(minAge) && minAge >= 18) {
          users2 = users2.filter((user) => user.age >= minAge);
        }
      }
      if (ageMax) {
        const maxAge = parseInt(ageMax);
        if (!isNaN(maxAge) && maxAge <= 99) {
          users2 = users2.filter((user) => user.age <= maxAge);
        }
      }
      res.json(users2.map(toPublicUser2));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });
  app2.get("/api/users/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { userId } = req.params;
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Use /api/user for your own profile" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      try {
        const notification = await storage.createNotification({
          userId,
          type: "profile_view",
          fromUserId: req.user.id
        });
        const fromUser = await storage.getUser(req.user.id);
        if (fromUser) {
          const sent = sendToUser(userId, {
            type: "newNotification",
            notification: {
              id: notification.id,
              type: "profile_view",
              fromUserId: req.user.id,
              fromUserName: fromUser.firstName,
              fromUserPhoto: fromUser.profilePhoto,
              message: `${fromUser.firstName} viewed your profile.`,
              createdAt: notification.createdAt
            }
          });
          if (sent) {
            console.log(`Profile view notification sent to user ${userId} from ${fromUser.firstName}`);
          }
        }
      } catch (notificationError) {
        console.error("Failed to create profile view notification:", notificationError);
      }
      res.json(toPublicUser2(user));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  app2.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const conversations2 = await storage.getUserConversations(req.user.id);
      const safeConversations = conversations2.map((conv) => ({
        ...conv,
        otherUser: toPublicUser2(conv.otherUser)
      }));
      res.json(safeConversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/conversations/:userId/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { userId } = req.params;
      let conversation = await storage.getConversation(req.user.id, userId);
      if (!conversation) {
        conversation = await storage.createConversation({
          participant1Id: req.user.id,
          participant2Id: userId
        });
      }
      const messages2 = await storage.getMessages(conversation.id);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const updates = req.body;
      delete updates.id;
      delete updates.password;
      const updatedUser = await storage.updateUser(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(toPublicUser2(updatedUser));
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/user/filters", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        gender: user.filterGender || "",
        location: user.filterLocation || "",
        ageMin: user.filterAgeMin || 20,
        ageMax: user.filterAgeMax || 40
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch filters" });
    }
  });
  app2.patch("/api/user/filters", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { gender, location, ageMin, ageMax } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        filterGender: gender || null,
        filterLocation: location || null,
        filterAgeMin: ageMin || null,
        filterAgeMax: ageMax || null
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        gender: updatedUser.filterGender || "",
        location: updatedUser.filterLocation || "",
        ageMin: updatedUser.filterAgeMin || 20,
        ageMax: updatedUser.filterAgeMax || 40
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save filters" });
    }
  });
  app2.delete("/api/user/filters", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const updatedUser = await storage.updateUser(req.user.id, {
        filterGender: null,
        filterLocation: null,
        filterAgeMin: null,
        filterAgeMax: null
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        gender: "",
        location: "",
        ageMin: 20,
        ageMax: 40
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset filters" });
    }
  });
  app2.post("/api/upload/profile", upload.single("profilePicture"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const profilePhotoUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await storage.updateUser(req.user.id, { profilePhoto: profilePhotoUrl });
      res.json({
        profilePhoto: profilePhotoUrl,
        user: updatedUser ? toPublicUser2(updatedUser) : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  app2.post("/api/upload/message", upload.single("messageImage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.post("/api/upload/photos", upload.array("photos", 5), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const existingPhotos = currentUser.photos && Array.isArray(currentUser.photos) ? currentUser.photos : [];
      const newPhotoUrls = req.files.map((file) => `/uploads/${file.filename}`);
      const allPhotos = [...existingPhotos, ...newPhotoUrls];
      if (allPhotos.length > 5) {
        return res.status(400).json({
          message: `Maximum 5 photos allowed. You currently have ${existingPhotos.length} photos.`,
          maxPhotos: 5,
          currentCount: existingPhotos.length,
          attemptedUpload: newPhotoUrls.length
        });
      }
      const updatedUser = await storage.updateUser(req.user.id, { photos: allPhotos });
      res.json({
        photos: allPhotos,
        newPhotos: newPhotoUrls,
        user: updatedUser ? toPublicUser2(updatedUser) : null
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });
  app2.delete("/api/photos", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { photoUrl } = req.body;
      if (!photoUrl) {
        return res.status(400).json({ message: "Photo URL is required" });
      }
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const existingPhotos = currentUser.photos && Array.isArray(currentUser.photos) ? currentUser.photos : [];
      const updatedPhotos = existingPhotos.filter((photo) => photo !== photoUrl);
      if (existingPhotos.length === updatedPhotos.length) {
        return res.status(404).json({ message: "Photo not found in gallery" });
      }
      const updatedUser = await storage.updateUser(req.user.id, { photos: updatedPhotos });
      res.json({
        photos: updatedPhotos,
        user: updatedUser ? toPublicUser2(updatedUser) : null
      });
    } catch (error) {
      console.error("Photo delete error:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const notifications2 = await storage.getUserNotifications(req.user.id);
      res.json(notifications2.map((notification) => ({
        ...notification,
        fromUser: toPublicUser2(notification.fromUser)
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.get("/api/notifications/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const count = await storage.getUnreadNotificationCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });
  app2.post("/api/notifications/mark-read/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  app2.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const connectedUsers = /* @__PURE__ */ new Map();
  const activeChatWindows = /* @__PURE__ */ new Map();
  function broadcastToAll(message) {
    connectedUsers.forEach(({ ws }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
  function sendToUser(userId, message) {
    const userConnection = connectedUsers.get(userId);
    if (userConnection && userConnection.ws.readyState === WebSocket.OPEN) {
      userConnection.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
  app2.post("/api/logout", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id.toString();
    const userConnection = connectedUsers.get(userId);
    if (userConnection) {
      userConnection.ws.close();
      connectedUsers.delete(userId);
      activeChatWindows.delete(userId);
      await storage.setUserOnlineStatus(userId, false);
      broadcastToAll({
        type: "userOffline",
        userId
      });
    }
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  wss.on("connection", async (ws, req) => {
    let userId = null;
    try {
      const cookies = parseCookie(req.headers.cookie || "");
      const sessionId = cookies["connect.sid"];
      if (!sessionId) {
        console.log("WebSocket connection rejected: no session cookie");
        ws.close(1008, "Authentication required");
        return;
      }
      const actualSessionId = sessionId.startsWith("s:") ? sessionId.slice(2).split(".")[0] : sessionId;
      const sessionData = await new Promise((resolve, reject) => {
        storage.sessionStore.get(actualSessionId, (err, session4) => {
          if (err) reject(err);
          else resolve(session4);
        });
      });
      if (!sessionData || !sessionData.passport?.user) {
        console.log("WebSocket connection rejected: invalid or unauthenticated session");
        ws.close(1008, "Authentication required");
        return;
      }
      const authenticatedUserId = sessionData.passport.user;
      userId = authenticatedUserId;
      const user = await storage.getUser(authenticatedUserId);
      if (!user) {
        console.log("WebSocket connection rejected: user not found");
        ws.close(1008, "User not found");
        return;
      }
      connectedUsers.set(authenticatedUserId, { ws, userId: authenticatedUserId });
      await storage.setUserOnlineStatus(authenticatedUserId, true);
      console.log(`User ${user.username} (${userId}) connected via WebSocket`);
      broadcastToAll({
        type: "userOnline",
        userId
      });
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      ws.close(1011, "Authentication failed");
      return;
    }
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          // Remove the vulnerable 'auth' case - authentication now happens on connection
          case "openChatWindow":
            if (!userId) return;
            const { otherUserId: openUserId } = message;
            if (!activeChatWindows.has(userId)) {
              activeChatWindows.set(userId, /* @__PURE__ */ new Set());
            }
            activeChatWindows.get(userId).add(openUserId);
            console.log(`User ${userId} opened chat window with ${openUserId}`);
            break;
          case "closeChatWindow":
            if (!userId) return;
            const { otherUserId: closeUserId } = message;
            if (activeChatWindows.has(userId)) {
              activeChatWindows.get(userId).delete(closeUserId);
              if (activeChatWindows.get(userId).size === 0) {
                activeChatWindows.delete(userId);
              }
            }
            console.log(`User ${userId} closed chat window with ${closeUserId}`);
            break;
          case "sendMessage":
            if (!userId) return;
            const { receiverId, content, imageUrl } = message;
            let conversation = await storage.getConversation(userId, receiverId);
            if (!conversation) {
              conversation = await storage.createConversation({
                participant1Id: userId,
                participant2Id: receiverId
              });
            }
            const newMessage = await storage.createMessage({
              conversationId: conversation.id,
              senderId: userId,
              content,
              imageUrl
            });
            const receiverConnection = connectedUsers.get(receiverId);
            if (receiverConnection && receiverConnection.ws.readyState === WebSocket.OPEN) {
              const senderUser = await storage.getUser(userId);
              receiverConnection.ws.send(JSON.stringify({
                type: "newMessage",
                message: newMessage,
                sender: senderUser ? toPublicUser2(senderUser) : null
              }));
            }
            const senderHasChatOpen = activeChatWindows.has(userId) && activeChatWindows.get(userId).has(receiverId);
            const receiverHasChatOpen = activeChatWindows.has(receiverId) && activeChatWindows.get(receiverId).has(userId);
            const bothActivelyChatting = senderHasChatOpen && receiverHasChatOpen;
            if (!bothActivelyChatting) {
              try {
                const notification = await storage.createNotification({
                  userId: receiverId,
                  type: "message_received",
                  fromUserId: userId,
                  conversationId: conversation.id
                });
                const senderUser = await storage.getUser(userId);
                if (senderUser && receiverConnection && receiverConnection.ws.readyState === WebSocket.OPEN) {
                  receiverConnection.ws.send(JSON.stringify({
                    type: "newNotification",
                    notification: {
                      id: notification.id,
                      type: "message_received",
                      fromUserId: userId,
                      fromUserName: senderUser.firstName,
                      fromUserPhoto: senderUser.profilePhoto,
                      message: `${senderUser.firstName} sent you a message.`,
                      createdAt: notification.createdAt
                    }
                  }));
                }
              } catch (notificationError) {
                console.error("Failed to create message notification:", notificationError);
              }
            }
            ws.send(JSON.stringify({
              type: "messageConfirmed",
              message: newMessage
            }));
            break;
          case "typing":
            if (!userId) return;
            const { receiverId: typingReceiverId, isTyping } = message;
            const typingReceiverConnection = connectedUsers.get(typingReceiverId);
            if (typingReceiverConnection && typingReceiverConnection.ws.readyState === WebSocket.OPEN) {
              typingReceiverConnection.ws.send(JSON.stringify({
                type: "userTyping",
                userId,
                isTyping
              }));
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", async () => {
      if (userId) {
        connectedUsers.delete(userId);
        await storage.setUserOnlineStatus(userId, false);
        activeChatWindows.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
        broadcastToAll({
          type: "userOffline",
          userId
        });
      }
    });
  });
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared"),
      "@assets": path2.resolve(__dirname, "attached_assets")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    allowedHosts: true,
    hmr: {
      port: 5e3,
      host: "0.0.0.0"
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path3.dirname(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: false,
      allowedHosts: true
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`
\u274C ERROR: Port ${port} is already in use.`);
      console.error(`Please either:`);
      console.error(`  1. Stop the process using port ${port}, or`);
      console.error(`  2. Set a different PORT in your .env file
`);
      process.exit(1);
    } else {
      console.error("Server error:", error);
      process.exit(1);
    }
  });
})();

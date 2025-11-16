var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import express2 from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path3 from "path";

// server/storage.ts
import session2 from "express-session";
import createMemoryStore from "memorystore";

// server/pg-storage.ts
import { eq, and, or, desc, sql as sql2, ne, lt } from "drizzle-orm";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accountDeletionCodes: () => accountDeletionCodes,
  chatConsents: () => chatConsents,
  conversations: () => conversations,
  insertAccountDeletionCodeSchema: () => insertAccountDeletionCodeSchema,
  insertChatConsentSchema: () => insertChatConsentSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertProfileLikeSchema: () => insertProfileLikeSchema,
  insertSubscriberSchema: () => insertSubscriberSchema,
  insertUserSchema: () => insertUserSchema,
  messages: () => messages,
  notifications: () => notifications,
  profileLikes: () => profileLikes,
  subscribers: () => subscribers,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender").notNull(),
  profilePhoto: text("profile_photo"),
  age: integer("age").notNull(),
  dateOfBirth: text("date_of_birth"),
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
  lastCodeSentAt: timestamp("last_code_sent_at"),
  passwordResetCode: text("password_reset_code"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  passwordResetRequestedAt: timestamp("password_reset_requested_at"),
  googleId: text("google_id").unique(),
  authProvider: text("auth_provider").default("local"),
  needsProfileCompletion: boolean("needs_profile_completion").default(false),
  fcmToken: text("fcm_token")
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
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false)
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
var chatConsents = pgTable("chat_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  responderId: varchar("responder_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  // 'pending' | 'accepted' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var profileLikes = pgTable("profile_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  likerId: varchar("liker_id").notNull().references(() => users.id),
  likedUserId: varchar("liked_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  uniqueLikerLiked: unique().on(table.likerId, table.likedUserId)
}));
var accountDeletionCodes = pgTable("account_deletion_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attemptCount: integer("attempt_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  unsubscribeToken: text("unsubscribe_token").notNull(),
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
  lastCodeSentAt: true,
  passwordResetCode: true,
  passwordResetExpiry: true,
  passwordResetRequestedAt: true,
  googleId: true,
  authProvider: true
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character").optional(),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other"]),
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
  timestamp: true,
  isRead: true
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
  type: z.enum(["profile_view", "message_received", "profile_like"]),
  data: z.record(z.any()).optional()
});
var insertChatConsentSchema = createInsertSchema(chatConsents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true
}).extend({
  requesterId: z.string(),
  responderId: z.string()
});
var insertProfileLikeSchema = createInsertSchema(profileLikes).omit({
  id: true,
  createdAt: true
}).extend({
  likerId: z.string(),
  likedUserId: z.string()
});
var insertAccountDeletionCodeSchema = createInsertSchema(accountDeletionCodes).omit({
  id: true,
  createdAt: true
}).extend({
  email: z.string().email(),
  code: z.string(),
  expiresAt: z.date()
});
var insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
  unsubscribeToken: true
}).extend({
  email: z.string().email("Invalid email address")
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
  async getUserByGoogleId(googleId) {
    const result = await this.db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
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
    const result = await this.db.select().from(users).where(sql2`${users.isOnline} = true`).orderBy(desc(users.lastSeen));
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
    try {
      const result = await this.db.insert(notifications).values(notification).returning();
      return result[0];
    } catch (error) {
      if (error.code === "23505") {
        const existing = await this.findExistingNotification(
          notification.userId,
          notification.fromUserId,
          notification.type,
          notification.conversationId ?? void 0
        );
        if (existing) {
          return await this.updateNotificationTimestamp(existing.id);
        }
      }
      throw error;
    }
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
  async findExistingNotification(userId, fromUserId, type, conversationId) {
    let conditions = [
      eq(notifications.userId, userId),
      eq(notifications.fromUserId, fromUserId),
      eq(notifications.type, type)
    ];
    if (conversationId) {
      conditions.push(eq(notifications.conversationId, conversationId));
    }
    const result = await this.db.select().from(notifications).where(and(...conditions)).limit(1);
    return result[0];
  }
  async updateNotificationTimestamp(notificationId) {
    const result = await this.db.update(notifications).set({
      createdAt: /* @__PURE__ */ new Date(),
      isRead: false
    }).where(eq(notifications.id, notificationId)).returning();
    const updatedNotification = result[0];
    if (updatedNotification) {
      try {
        await pool.query(
          `SELECT pg_notify('new_notification', $1)`,
          [JSON.stringify({
            notification_id: updatedNotification.id,
            user_id: updatedNotification.userId,
            type: updatedNotification.type,
            from_user_id: updatedNotification.fromUserId,
            conversation_id: updatedNotification.conversationId
          })]
        );
      } catch (error) {
        console.error("Failed to send notification update event:", error);
      }
    }
    return updatedNotification;
  }
  async getUnreadMessageNotificationCount(userId) {
    const result = await this.db.select({ count: notifications.id }).from(notifications).where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false),
      eq(notifications.type, "message_received")
    ));
    return result.length;
  }
  async getUnreadProfileViewNotificationCount(userId) {
    const result = await this.db.select({ count: notifications.id }).from(notifications).where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false),
      eq(notifications.type, "profile_view")
    ));
    return result.length;
  }
  async markMessageNotificationsAsReadFromUser(userId, fromUserId) {
    await this.db.update(notifications).set({ isRead: true }).where(and(
      eq(notifications.userId, userId),
      eq(notifications.fromUserId, fromUserId),
      eq(notifications.type, "message_received"),
      eq(notifications.isRead, false)
    ));
  }
  async markMessagesAsReadInConversation(conversationId, receiverId) {
    await this.db.update(messages).set({ isRead: true }).where(and(
      eq(messages.conversationId, conversationId),
      ne(messages.senderId, receiverId),
      // Don't mark own messages as read
      eq(messages.isRead, false)
    ));
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
  // Password reset methods
  async setPasswordResetCode(email, code, expiry) {
    await this.db.update(users).set({
      passwordResetCode: code,
      passwordResetExpiry: expiry,
      passwordResetRequestedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.email, email));
  }
  async verifyPasswordResetCode(email, code) {
    const user = await this.getUserByEmail(email);
    if (!user || !user.passwordResetCode || !user.passwordResetExpiry) {
      return false;
    }
    const now = /* @__PURE__ */ new Date();
    const isCodeValid = user.passwordResetCode === code && user.passwordResetExpiry > now;
    return isCodeValid;
  }
  async updatePassword(userId, newPassword) {
    await this.db.update(users).set({
      password: newPassword,
      passwordResetCode: null,
      passwordResetExpiry: null,
      passwordResetRequestedAt: null
    }).where(eq(users.id, userId));
  }
  async canRequestPasswordReset(email) {
    const user = await this.getUserByEmail(email);
    if (!user || !user.passwordResetRequestedAt) {
      return true;
    }
    const now = /* @__PURE__ */ new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1e3);
    return user.passwordResetRequestedAt < oneMinuteAgo;
  }
  async clearPasswordResetCode(userId) {
    await this.db.update(users).set({
      passwordResetCode: null,
      passwordResetExpiry: null
    }).where(eq(users.id, userId));
  }
  // Chat consent methods
  async getChatConsent(requesterId, responderId) {
    const result = await this.db.select().from(chatConsents).where(
      or(
        and(eq(chatConsents.requesterId, requesterId), eq(chatConsents.responderId, responderId)),
        and(eq(chatConsents.requesterId, responderId), eq(chatConsents.responderId, requesterId))
      )
    ).limit(1);
    return result[0];
  }
  async createChatConsent(consent) {
    const result = await this.db.insert(chatConsents).values(consent).returning();
    return result[0];
  }
  async updateConsentStatus(consentId, status) {
    const result = await this.db.update(chatConsents).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(chatConsents.id, consentId)).returning();
    return result[0];
  }
  async checkChatPermission(senderId, receiverId) {
    const consent = await this.getChatConsent(senderId, receiverId);
    if (!consent) {
      return { allowed: false, status: "no_consent" };
    }
    if (consent.status === "accepted") {
      return { allowed: true, status: "accepted", consent };
    }
    if (consent.status === "rejected") {
      return { allowed: false, status: "rejected", consent };
    }
    return { allowed: false, status: "pending", consent };
  }
  // Profile Like Methods
  async likeProfile(likerId, likedUserId) {
    const existing = await this.db.select().from(profileLikes).where(
      and(
        eq(profileLikes.likerId, likerId),
        eq(profileLikes.likedUserId, likedUserId)
      )
    ).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const result = await this.db.insert(profileLikes).values({ likerId, likedUserId }).returning();
    return result[0];
  }
  async unlikeProfile(likerId, likedUserId) {
    await this.db.delete(profileLikes).where(
      and(
        eq(profileLikes.likerId, likerId),
        eq(profileLikes.likedUserId, likedUserId)
      )
    );
  }
  async checkIfLiked(likerId, likedUserId) {
    const result = await this.db.select().from(profileLikes).where(
      and(
        eq(profileLikes.likerId, likerId),
        eq(profileLikes.likedUserId, likedUserId)
      )
    ).limit(1);
    return result.length > 0;
  }
  async getUserLikes(userId) {
    const likes = await this.db.select().from(profileLikes).where(eq(profileLikes.likedUserId, userId)).orderBy(desc(profileLikes.createdAt));
    const enrichedLikes = await Promise.all(
      likes.map(async (like) => {
        const likerUser = await this.getUser(like.likerId);
        return {
          ...like,
          likerUser
        };
      })
    );
    return enrichedLikes;
  }
  async getLikesCount(userId) {
    const result = await this.db.select({ count: sql2`count(*)` }).from(profileLikes).where(eq(profileLikes.likedUserId, userId));
    return Number(result[0]?.count || 0);
  }
  // Subscriber Methods
  async addSubscriber(email) {
    const unsubscribeToken = Array.from(
      { length: 32 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const result = await this.db.insert(subscribers).values({ email, unsubscribeToken }).returning();
    return result[0];
  }
  async getSubscriberByEmail(email) {
    const result = await this.db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    return result[0];
  }
  async getAllSubscribers() {
    return await this.db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  }
  async getSubscriberByToken(token) {
    const result = await this.db.select().from(subscribers).where(eq(subscribers.unsubscribeToken, token)).limit(1);
    return result[0];
  }
  async deleteSubscriber(token) {
    await this.db.delete(subscribers).where(eq(subscribers.unsubscribeToken, token));
  }
  // Account Deletion Methods
  async createAccountDeletionCode(email, code, expiresAt) {
    await this.db.insert(accountDeletionCodes).values({ email, code, expiresAt });
  }
  async verifyAccountDeletionCode(email, code) {
    const result = await this.db.select().from(accountDeletionCodes).where(
      and(
        eq(accountDeletionCodes.email, email),
        eq(accountDeletionCodes.code, code),
        sql2`${accountDeletionCodes.expiresAt} > NOW()`
      )
    ).limit(1);
    return result.length > 0;
  }
  async deleteAllUserData(email) {
    const user = await this.getUserByEmail(email);
    if (!user) return;
    await this.db.transaction(async (tx) => {
      await tx.delete(messages).where(eq(messages.senderId, user.id));
      await tx.delete(notifications).where(
        or(
          eq(notifications.userId, user.id),
          eq(notifications.fromUserId, user.id)
        )
      );
      await tx.delete(chatConsents).where(
        or(
          eq(chatConsents.requesterId, user.id),
          eq(chatConsents.responderId, user.id)
        )
      );
      await tx.delete(conversations).where(
        or(
          eq(conversations.participant1Id, user.id),
          eq(conversations.participant2Id, user.id)
        )
      );
      await tx.delete(profileLikes).where(
        or(
          eq(profileLikes.likerId, user.id),
          eq(profileLikes.likedUserId, user.id)
        )
      );
      await tx.delete(accountDeletionCodes).where(eq(accountDeletionCodes.email, email));
      await tx.delete(users).where(eq(users.id, user.id));
    });
  }
  async cleanupExpiredDeletionCodes() {
    await this.db.delete(accountDeletionCodes).where(lt(accountDeletionCodes.expiresAt, /* @__PURE__ */ new Date()));
  }
};

// server/storage.ts
var MemoryStore = createMemoryStore(session2);
var storage = new PgStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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
async function sendPasswordResetEmail(to, code, firstName) {
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
        .alert-box {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .alert-text {
          color: #991b1b;
          font-size: 14px;
          margin: 0;
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
            We received a request to reset your password. Use the verification code below to set a new password for your account:
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Password Reset Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="expiry">
            <p class="expiry-text">
              \u23F0 This code will expire in 10 minutes. Please enter it soon to reset your password.
            </p>
          </div>

          <div class="alert-box">
            <p class="alert-text">
              \u26A0\uFE0F If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div class="security-note">
            <p class="security-text">
              \u{1F512} <strong>Security Tip:</strong> Never share this code with anyone. SpreadLov will never ask you 
              for this code via phone or any other method outside of the password reset page.
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
    subject: "Reset Your Password - SpreadLov",
    html: htmlContent
  });
}
async function sendAccountDeletionEmail(to, code, firstName) {
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
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
          color: #ef4444;
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
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
        .alert-box {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .alert-text {
          color: #991b1b;
          font-size: 14px;
          margin: 0;
          font-weight: 600;
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
            <span class="logo-icon">\u26A0\uFE0F</span>
          </div>
          <h1 class="header-title">Account Deletion Request</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${firstName},</p>
          
          <p class="message">
            We received a request to permanently delete your SpreadLov account. This action cannot be undone. 
            To confirm this deletion, please use the verification code below:
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Deletion Code</div>
            <div class="code">${code}</div>
          </div>
          
          <div class="expiry">
            <p class="expiry-text">
              \u23F0 This code will expire in 10 minutes. If you don't complete the deletion within this time, you'll need to request a new code.
            </p>
          </div>

          <div class="alert-box">
            <p class="alert-text">
              \u{1F6A8} WARNING: Account deletion is permanent and irreversible!
            </p>
            <p style="color: #991b1b; font-size: 13px; margin: 10px 0 0 0;">
              Once confirmed, all your data including profile, messages, photos, and connections will be permanently deleted from our system.
            </p>
          </div>
          
          <div class="security-note">
            <p class="security-text">
              \u{1F512} <strong>Security Tip:</strong> If you didn't request account deletion, please ignore this email and consider changing your password immediately. Your account will remain active.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">We're sorry to see you go</p>
          <p class="footer-text" style="color: #9ca3af;">\xA9 2025 SpreadLov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || "spreadlov@outlook.com"}>`,
    to,
    subject: "Account Deletion Verification - SpreadLov",
    html: htmlContent
  });
}
async function sendSupportEmail(firstName, lastName, userEmail, message) {
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
        .info-section {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 120px;
        }
        .info-value {
          color: #1f2937;
        }
        .message-section {
          background-color: #f3f4f6;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .message-label {
          color: #667eea;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .message-text {
          color: #1f2937;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">\u{1F4AC}</span>
          </div>
          <h1 class="header-title">Support & Feedback</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Support Message Received</h2>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">From:</span>
              <span class="info-value">${firstName} ${lastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${userEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${(/* @__PURE__ */ new Date()).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  })}</span>
            </div>
          </div>

          <div class="message-section">
            <div class="message-label">Message</div>
            <div class="message-text">${message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">This is an automated message from SpreadLov Support System</p>
          <p class="footer-text" style="color: #9ca3af;">\xA9 2025 SpreadLov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || "spreadlov@outlook.com"}>`,
    to: "spreadlov.aid@gmail.com",
    replyTo: userEmail,
    subject: `Support Request from ${firstName} ${lastName}`,
    html: htmlContent
  });
}
async function sendSubscribeEmail(to, unsubscribeToken) {
  const transporter = getEmailTransporter();
  const baseUrl = process.env.BASE_URL || "https://spreadlov.com";
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;
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
        .welcome {
          font-size: 24px;
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .benefits {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
        }
        .benefits-title {
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .benefit-item {
          color: #4b5563;
          font-size: 15px;
          margin: 10px 0;
          padding-left: 25px;
          position: relative;
        }
        .benefit-item:before {
          content: "\u{1F49C}";
          position: absolute;
          left: 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 13px;
          margin: 8px 0;
          line-height: 1.5;
        }
        .unsubscribe-link {
          color: #9ca3af;
          font-size: 12px;
          text-decoration: underline;
          margin-top: 15px;
          display: inline-block;
        }
        .social-links {
          margin: 20px 0;
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
          <h2 class="welcome">Welcome to SpreadLov! \u{1F495}</h2>
          
          <p class="message">
            Thank you for subscribing to our newsletter! We're thrilled to have you join our community of singles looking for meaningful connections.
          </p>
          
          <p class="message">
            You're now part of an exclusive group that will be the first to know about:
          </p>
          
          <div class="benefits">
            <div class="benefits-title">What You'll Receive:</div>
            <div class="benefit-item">Early access to exciting new features</div>
            <div class="benefit-item">Expert dating tips and relationship advice</div>
            <div class="benefit-item">Success stories from our community</div>
            <div class="benefit-item">Exclusive promotions and special offers</div>
            <div class="benefit-item">Updates on events and community activities</div>
          </div>
          
          <p class="message" style="text-align: center;">
            <a href="${baseUrl}" class="cta-button">Visit SpreadLov</a>
          </p>
          
          <p class="message">
            We respect your inbox and promise to only send you valuable content that helps you in your journey to find love.
          </p>
          
          <p class="message" style="color: #9ca3af; font-size: 14px; text-align: center;">
            Questions or feedback? Reply to this email \u2013 we'd love to hear from you!
          </p>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            <strong>SpreadLov</strong><br>
            Where Real Connections Happen
          </p>
          <p class="footer-text">
            You're receiving this email because you subscribed to SpreadLov updates.
          </p>
          <a href="${unsubscribeUrl}" class="unsubscribe-link">Unsubscribe</a>
          <p class="footer-text" style="color: #9ca3af; margin-top: 20px;">
            \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} SpreadLov. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: `"SpreadLov" <${process.env.SMTP_USER || "spreadlov@outlook.com"}>`,
    to,
    subject: "Welcome to SpreadLov! \u{1F495}",
    html: htmlContent
  });
}

// server/auth.ts
import { fromZodError } from "zod-validation-error";
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
    emailVerified: user.emailVerified,
    needsProfileCompletion: user.needsProfileCompletion
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
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // ✅ 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // ✅ only secure in production
      sameSite: "lax"
      // ✅ prevents CSRF but allows normal usage
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session3(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password || !await comparePasswords(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    })
  );
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_REDIRECT_URI || "/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByGoogleId(profile.id);
            if (user) {
              return done(null, user);
            }
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await storage.getUserByEmail(email);
              if (user) {
                user = await storage.updateUser(user.id, {
                  googleId: profile.id,
                  authProvider: "google",
                  emailVerified: true
                  // Google accounts are pre-verified
                });
                return done(null, user);
              }
            }
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }
            const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
            let username = baseUsername;
            let counter = 1;
            while (await storage.getUserByUsername(username)) {
              username = `${baseUsername}${counter}`;
              counter++;
            }
            const newUser = await storage.createUser({
              username,
              email,
              password: void 0,
              // No password for Google users
              firstName: profile.name?.givenName || "User",
              lastName: profile.name?.familyName || "",
              gender: "prefer_not_to_say",
              age: 18,
              // Temporary default, will be updated in profile completion
              profilePhoto: profile.photos?.[0]?.value,
              googleId: profile.id,
              authProvider: "google",
              emailVerified: true,
              // Google accounts are pre-verified
              needsProfileCompletion: true
              // Flag to show profile completion modal
            });
            return done(null, newUser);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      const validatedData = validationResult.data;
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (!validatedData.password) {
        return res.status(400).json({ message: "Password is required" });
      }
      const hashedPassword = await hashPassword(validatedData.password);
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1e3);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        emailVerified: false,
        verificationCode: code,
        verificationCodeExpiry: expiry,
        lastCodeSentAt: /* @__PURE__ */ new Date()
        // Mark email as sent
      });
      try {
        await sendVerificationEmail(user.email, code, user.firstName);
        console.log(`\u2705 Verification email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError.message);
      }
      res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
        email: user.email
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
      if (user.authProvider === "local" && !user.emailVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in. Check your inbox for the verification code.",
          requiresVerification: true,
          email: user.email
        });
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
    const { code, email } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Verification code is required" });
    }
    try {
      let user;
      if (req.isAuthenticated() && req.user) {
        user = req.user;
      } else if (email) {
        user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ message: "User not found with this email" });
        }
      } else {
        return res.status(400).json({ message: "Email is required for verification" });
      }
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
          console.error("Login error after verification:", err);
          return res.status(500).json({ message: "Verification successful but login failed" });
        }
        res.json({
          success: true,
          message: "Email verified successfully. You are now logged in.",
          user: toPublicUser(updatedUser)
        });
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
  app2.post("/api/resend-verification", async (req, res) => {
    try {
      let user;
      const { email } = req.body;
      if (req.isAuthenticated() && req.user) {
        user = req.user;
      } else if (email) {
        user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ message: "User not found with this email" });
        }
      } else {
        return res.status(400).json({ message: "Email is required" });
      }
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
  app2.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (user) {
        const canRequest = await storage.canRequestPasswordReset(email);
        if (canRequest) {
          const code = generateVerificationCode();
          const expiry = new Date(Date.now() + 10 * 60 * 1e3);
          await storage.setPasswordResetCode(email, code, expiry);
          try {
            await sendPasswordResetEmail(user.email, code, user.firstName);
          } catch (emailError) {
            console.error("Failed to send password reset email:", emailError);
          }
        }
      }
      res.json({
        success: true,
        message: "If an account with that email exists, a password reset code has been sent."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.post("/api/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ message: "Email, code, and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid reset code or email" });
      }
      const isCodeValid = await storage.verifyPasswordResetCode(email, code);
      if (!isCodeValid) {
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updatePassword(user.id, hashedPassword);
      res.json({
        success: true,
        message: "Password reset successfully. You can now log in with your new password."
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app2.get(
      "/api/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email"]
      })
    );
    app2.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/?error=google_auth_failed"
      }),
      (req, res) => {
        res.redirect("/");
      }
    );
  } else {
    app2.get("/api/auth/google", (req, res) => {
      res.status(404).json({ message: "Google OAuth is not configured" });
    });
    app2.get("/api/auth/google/callback", (req, res) => {
      res.status(404).json({ message: "Google OAuth is not configured" });
    });
  }
}

// server/routes.ts
import { parse as parseCookie } from "cookie";

// server/fcm-service.ts
import admin from "firebase-admin";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
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
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"]
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return "assets/[name]-[hash][extname]";
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    minify: "esbuild",
    target: "esnext"
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
  },
  css: {
    devSourcemap: false
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
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
      const clientTemplate = path2.resolve(
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
  const distPath = path2.resolve(__dirname2, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/fcm-service.ts
var isInitialized = false;
function initializeFirebase() {
  if (isInitialized) {
    return;
  }
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      log("\u26A0\uFE0F  Firebase credentials not configured. FCM push notifications will be disabled.");
      log("   Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to enable.");
      return;
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    isInitialized = true;
    log("\u2705 Firebase Admin initialized successfully");
  } catch (error) {
    log(`\u274C Failed to initialize Firebase Admin: ${error}`);
  }
}
async function sendPushNotification(fcmToken, title, body, data) {
  if (!isInitialized) {
    log("\u26A0\uFE0F  Firebase not initialized. Skipping push notification.");
    return false;
  }
  try {
    let deepLink = "/";
    if (data?.type === "profile_view" || data?.type === "profile_like") {
      deepLink = `/profile/${data.fromUserId}`;
    } else if (data?.type === "message_received" && data?.fromUserId) {
      deepLink = `/chat/${data.fromUserId}`;
    }
    log(`\u{1F4E4} Sending FCM notification - Type: ${data?.type}, User: ${data?.fromUserName}, Photo: ${data?.fromUserPhoto}, ConversationId: ${data?.conversationId}`);
    const message = {
      token: fcmToken,
      // ❌ REMOVED: notification field (system would auto-display without our custom handling)
      data: {
        title,
        // ✅ Move title to data
        body,
        // ✅ Move body to data
        type: data?.type || "notification",
        fromUserId: data?.fromUserId || "",
        fromUserName: data?.fromUserName || "",
        fromUserPhoto: data?.fromUserPhoto || "",
        // ✅ This will now be used!
        conversationId: data?.conversationId || "",
        // ✅ Now included!
        deep_link: deepLink,
        click_action: deepLink
      },
      android: {
        priority: "high"
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            "content-available": 1
            // Ensure iOS also triggers onMessageReceived
          }
        }
      }
    };
    const response = await admin.messaging().send(message);
    log(`\u2705 Push notification sent successfully: ${response}`);
    return true;
  } catch (error) {
    log(`\u274C Error sending push notification: ${error.message}`);
    const invalidTokenErrors = [
      "messaging/invalid-registration-token",
      "messaging/registration-token-not-registered",
      "messaging/invalid-argument"
    ];
    const isInvalidToken = invalidTokenErrors.some((code) => error.code === code) || error.message?.includes("not found") || // ✅ Catches "Requested entity was not found"
    error.message?.includes("registration token") || error.message?.includes("Requested entity");
    if (isInvalidToken) {
      log("\u{1F5D1}\uFE0F  Invalid FCM token detected - will be removed by webhook handler");
    }
    return false;
  }
}

// server/notification-webhook.ts
import { eq as eq2 } from "drizzle-orm";
var WEBHOOK_SECRET = process.env.NOTIFICATION_WEBHOOK_SECRET || "default-webhook-secret-change-in-production";
async function handleNotificationWebhook(req, res) {
  try {
    const authHeader = req.headers["x-webhook-secret"];
    if (authHeader !== WEBHOOK_SECRET) {
      log("\u26A0\uFE0F  Unauthorized notification webhook attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { notification_id } = req.body;
    if (!notification_id) {
      return res.status(400).json({ error: "Missing notification_id" });
    }
    const notification = await db.query.notifications.findFirst({
      where: eq2(notifications.id, notification_id),
      with: {
        user: true,
        fromUser: true
      }
    });
    if (!notification) {
      log(`\u26A0\uFE0F  Notification ${notification_id} not found`);
      return res.status(404).json({ error: "Notification not found" });
    }
    const recipientUser = await db.query.users.findFirst({
      where: eq2(users.id, notification.userId)
    });
    const fromUser = await db.query.users.findFirst({
      where: eq2(users.id, notification.fromUserId)
    });
    if (!recipientUser || !recipientUser.fcmToken) {
      log(`\u26A0\uFE0F  User ${notification.userId} has no FCM token registered`);
      return res.status(200).json({
        message: "No FCM token available",
        sent: false
      });
    }
    if (!fromUser) {
      log(`\u26A0\uFE0F  From user ${notification.fromUserId} not found`);
      return res.status(404).json({ error: "From user not found" });
    }
    let title = "SpreadLov";
    let body = "You have a new notification";
    switch (notification.type) {
      case "profile_view":
        title = "Profile View";
        body = `${fromUser.firstName} viewed your profile.`;
        break;
      case "message_received":
        title = "New Message";
        body = `${fromUser.firstName} sent you a message.`;
        break;
      case "profile_like":
        title = "New Like";
        body = `${fromUser.firstName} liked your profile!`;
        break;
    }
    log(`\u{1F4EC} New notification received: ${notification.type} for user ${notification.userId}`);
    const success = await sendPushNotification(
      recipientUser.fcmToken,
      title,
      body,
      {
        type: notification.type,
        fromUserId: notification.fromUserId,
        fromUserName: fromUser.firstName,
        fromUserPhoto: fromUser.profilePhoto || void 0,
        conversationId: notification.conversationId || void 0
      }
    );
    if (success === false) {
      log(`\u{1F5D1}\uFE0F  Removing invalid FCM token for user ${recipientUser.id} (${recipientUser.firstName} ${recipientUser.lastName})`);
      try {
        await db.update(users).set({ fcmToken: null }).where(eq2(users.id, recipientUser.id));
        log(`\u2705 Successfully cleared invalid FCM token for user ${recipientUser.id}`);
      } catch (dbError) {
        log(`\u274C Failed to clear FCM token from database: ${dbError}`);
      }
    }
    log(`\u{1F4EC} Notification webhook processed: ${notification.type} for user ${notification.userId}, sent: ${success}`);
    return res.status(200).json({
      message: "Notification processed",
      sent: success,
      type: notification.type
    });
  } catch (error) {
    log(`\u274C Error in notification webhook: ${error}`);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// server/routes.ts
function toPublicUser2(user) {
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
    emailVerified: user.emailVerified,
    needsProfileCompletion: user.needsProfileCompletion
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
  initializeFirebase();
  setupAuth(app2);
  app2.use("/uploads", express2.static(path3.join(process.cwd(), "uploads")));
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
        const existingNotification = await storage.findExistingNotification(
          userId,
          req.user.id,
          "profile_view"
        );
        let notification;
        let isNewNotification = false;
        let wasRead = false;
        if (existingNotification) {
          wasRead = existingNotification.isRead ?? false;
          notification = await storage.updateNotificationTimestamp(existingNotification.id);
        } else {
          notification = await storage.createNotification({
            userId,
            type: "profile_view",
            fromUserId: req.user.id
          });
          isNewNotification = true;
        }
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
          if (isNewNotification || wasRead) {
            sendToUser(userId, {
              type: "notificationCountUpdate",
              action: "increment"
            });
          }
          if (sent) {
            console.log(`\u2705 Profile view notification sent to user ${userId} from ${fromUser.firstName}`);
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
        ageMin: user.filterAgeMin || 18,
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
        ageMin: updatedUser.filterAgeMin || 18,
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
        ageMin: 18,
        ageMax: 40
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset filters" });
    }
  });
  app2.post("/api/user/fcm-token", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { fcmToken } = req.body;
      if (!fcmToken || typeof fcmToken !== "string" || fcmToken.trim() === "") {
        return res.status(400).json({ message: "Valid FCM token is required" });
      }
      const updatedUser = await storage.updateUser(req.user.id, {
        fcmToken: fcmToken.trim()
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`\u2705 FCM token registered for user ${req.user.id} (${updatedUser.firstName} ${updatedUser.lastName})`);
      res.json({
        message: "FCM token registered successfully",
        success: true
      });
    } catch (error) {
      console.error("Failed to register FCM token:", error);
      res.status(500).json({ message: "Failed to register FCM token" });
    }
  });
  app2.delete("/api/user/fcm-token", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const updatedUser = await storage.updateUser(req.user.id, {
        fcmToken: null
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`\u{1F504} FCM token removed for user ${req.user.id} (${updatedUser.firstName} ${updatedUser.lastName})`);
      res.json({
        message: "FCM token removed successfully",
        success: true
      });
    } catch (error) {
      console.error("Failed to remove FCM token:", error);
      res.status(500).json({ message: "Failed to remove FCM token" });
    }
  });
  app2.patch("/api/user/complete-profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { birthdate, gender } = req.body;
      if (!birthdate || !gender) {
        return res.status(400).json({ message: "Birthdate and gender are required" });
      }
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ message: "Invalid birthdate format" });
      }
      const today = /* @__PURE__ */ new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {
        age--;
      }
      if (age < 18 || isNaN(age)) {
        return res.status(400).json({ message: "You must be at least 18 years old" });
      }
      const updatedUser = await storage.updateUser(req.user.id, {
        age,
        gender,
        needsProfileCompletion: false
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        success: true,
        user: toPublicUser2(updatedUser)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });
  app2.post("/api/user/fcm-token", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { fcmToken } = req.body;
      if (!fcmToken || typeof fcmToken !== "string") {
        return res.status(400).json({ message: "Valid FCM token is required" });
      }
      const updatedUser = await storage.updateUser(req.user.id, {
        fcmToken
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        success: true,
        message: "FCM token registered successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to register FCM token" });
    }
  });
  app2.post("/api/fcm/notify", handleNotificationWebhook);
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
      const count = await storage.getUnreadProfileViewNotificationCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });
  app2.get("/api/messages/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const count = await storage.getUnreadMessageNotificationCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message unread count" });
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
  app2.post("/api/likes/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { userId } = req.params;
      const likerId = req.user.id;
      if (likerId === userId) {
        return res.status(400).json({ message: "You cannot like your own profile" });
      }
      const like = await storage.likeProfile(likerId, userId);
      const existingNotification = await storage.findExistingNotification(
        userId,
        likerId,
        "profile_like"
      );
      let notification;
      let isNewNotification = false;
      let wasRead = false;
      if (existingNotification) {
        wasRead = existingNotification.isRead ?? false;
        notification = await storage.updateNotificationTimestamp(existingNotification.id);
      } else {
        notification = await storage.createNotification({
          userId,
          type: "profile_like",
          fromUserId: likerId
        });
        isNewNotification = true;
      }
      const fromUser = await storage.getUser(likerId);
      if (fromUser) {
        const sent = sendToUser(userId, {
          type: "newNotification",
          notification: {
            id: notification.id,
            type: "profile_like",
            fromUserId: likerId,
            fromUserName: fromUser.firstName,
            fromUserPhoto: fromUser.profilePhoto,
            message: `${fromUser.firstName} liked your profile.`,
            createdAt: notification.createdAt
          }
        });
        if (isNewNotification || wasRead) {
          sendToUser(userId, {
            type: "notificationCountUpdate",
            action: "increment"
          });
        }
        if (sent) {
          console.log(`Profile like notification sent to user ${userId} from ${fromUser.firstName}`);
        }
      }
      res.json(like);
    } catch (error) {
      console.error("Error liking profile:", error);
      res.status(500).json({ message: "Failed to like profile" });
    }
  });
  app2.delete("/api/likes/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { userId } = req.params;
      const likerId = req.user.id;
      await storage.unlikeProfile(likerId, userId);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error unliking profile:", error);
      res.status(500).json({ message: "Failed to unlike profile" });
    }
  });
  app2.get("/api/likes/check/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { userId } = req.params;
      const likerId = req.user.id;
      const isLiked = await storage.checkIfLiked(likerId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });
  app2.get("/api/likes/received", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user.id;
      const likes = await storage.getUserLikes(userId);
      const safeLikes = likes.map((like) => ({
        ...like,
        likerUser: toPublicUser2(like.likerUser)
      }));
      res.json(safeLikes);
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });
  app2.get("/api/likes/count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user.id;
      const count = await storage.getLikesCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching likes count:", error);
      res.status(500).json({ message: "Failed to fetch likes count" });
    }
  });
  app2.get("/api/consent/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { userId } = req.params;
      const incomingConsent = await storage.getChatConsent(userId, req.user.id);
      if (incomingConsent && incomingConsent.status === "pending" && incomingConsent.requesterId === userId && incomingConsent.responderId === req.user.id) {
        const requester = await storage.getUser(incomingConsent.requesterId);
        console.log("[Consent API] Found incoming pending consent - current user is responder", {
          consentId: incomingConsent.id,
          requesterId: incomingConsent.requesterId,
          responderId: incomingConsent.responderId
        });
        res.json({
          status: "pending",
          allowed: false,
          consent: incomingConsent,
          requester
        });
        return;
      }
      const permission = await storage.checkChatPermission(req.user.id, userId);
      console.log("[Consent API] General permission check:", {
        currentUser: req.user.id,
        otherUser: userId,
        permission
      });
      if (permission.status === "pending" && permission.consent && permission.consent.requesterId === req.user.id) {
        res.json({
          status: "waiting",
          allowed: false,
          consent: permission.consent
        });
        return;
      }
      if (permission.status === "no_consent") {
        res.json({ status: null, allowed: true });
        return;
      }
      res.json(permission);
    } catch (error) {
      console.error("[Consent API] Error:", error);
      res.status(500).json({ message: "Failed to check consent status" });
    }
  });
  app2.post("/api/consent/accept", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { consentId, requesterId } = req.body;
      if (!consentId) {
        return res.status(400).json({ message: "Consent ID is required" });
      }
      const updatedConsent = await storage.updateConsentStatus(consentId, "accepted");
      const requesterConnection = connectedUsers.get(requesterId);
      if (requesterConnection && requesterConnection.ws.readyState === WebSocket.OPEN) {
        requesterConnection.ws.send(JSON.stringify({
          type: "consentAccepted",
          responderId: req.user.id,
          consent: updatedConsent
        }));
      }
      res.json({ consent: updatedConsent });
    } catch (error) {
      console.error("Accept consent error:", error);
      res.status(500).json({ message: "Failed to accept consent" });
    }
  });
  app2.post("/api/consent/reject", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { consentId, requesterId } = req.body;
      if (!consentId) {
        return res.status(400).json({ message: "Consent ID is required" });
      }
      const updatedConsent = await storage.updateConsentStatus(consentId, "rejected");
      const requesterConnection = connectedUsers.get(requesterId);
      if (requesterConnection && requesterConnection.ws.readyState === WebSocket.OPEN) {
        requesterConnection.ws.send(JSON.stringify({
          type: "consentRejected",
          responderId: req.user.id,
          consent: updatedConsent
        }));
      }
      res.json({ consent: updatedConsent });
    } catch (error) {
      console.error("Reject consent error:", error);
      res.status(500).json({ message: "Failed to reject consent" });
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
  app2.post("/api/support/send", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { firstName, lastName, email, message } = req.body;
      if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (message.trim().length === 0) {
        return res.status(400).json({ message: "Message cannot be empty" });
      }
      if (message.length > 2e3) {
        return res.status(400).json({ message: "Message is too long (max 2000 characters)" });
      }
      const sanitizedMessage = message.trim();
      const sanitizedFirstName = firstName.trim();
      const sanitizedLastName = lastName.trim();
      const sanitizedEmail = email.trim();
      if (sanitizedEmail !== req.user.email) {
        return res.status(403).json({ message: "Email mismatch" });
      }
      await sendSupportEmail(
        sanitizedFirstName,
        sanitizedLastName,
        sanitizedEmail,
        sanitizedMessage
      );
      res.json({
        success: true,
        message: "Support message sent successfully"
      });
    } catch (error) {
      console.error("Support email error:", error);
      res.status(500).json({ message: "Failed to send support message" });
    }
  });
  app2.post("/api/account/request-delete", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }
      const sanitizedEmail = email.trim().toLowerCase();
      const user = await storage.getUserByEmail(sanitizedEmail);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }
      await storage.cleanupExpiredDeletionCodes();
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await storage.createAccountDeletionCode(sanitizedEmail, code, expiresAt);
      await sendAccountDeletionEmail(sanitizedEmail, code, user.firstName);
      res.json({
        success: true,
        message: "Verification code sent to your email address"
      });
    } catch (error) {
      console.error("Account deletion request error:", error);
      res.status(500).json({ message: "Failed to process deletion request" });
    }
  });
  app2.post("/api/account/verify-delete", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || typeof email !== "string" || !code || typeof code !== "string") {
        return res.status(400).json({ message: "Email and verification code are required" });
      }
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedCode = code.trim();
      const isValid = await storage.verifyAccountDeletionCode(sanitizedEmail, sanitizedCode);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      await storage.deleteAllUserData(sanitizedEmail);
      res.json({
        success: true,
        message: "Your account and all associated data have been permanently deleted"
      });
      setImmediate(() => {
        if (req.session) {
          req.logout((err) => {
            if (err) {
              console.error("Error logging out after account deletion:", err);
            }
            if (req.session) {
              req.session.destroy((err2) => {
                if (err2) {
                  console.error("Error destroying session after account deletion:", err2);
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error("Account deletion verification error:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
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
            const openConversation = await storage.getConversation(userId, openUserId);
            if (openConversation) {
              await storage.markMessagesAsReadInConversation(openConversation.id, userId);
            }
            await storage.markMessageNotificationsAsReadFromUser(userId, openUserId);
            sendToUser(userId, {
              type: "messageNotificationsRead",
              fromUserId: openUserId
            });
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
            console.log(`[WebSocket] sendMessage from ${userId} to ${receiverId}, content: "${content}"`);
            const permission = await storage.checkChatPermission(userId, receiverId);
            console.log(`[WebSocket] Chat permission check:`, permission);
            if (permission.status === "rejected") {
              ws.send(JSON.stringify({
                type: "consentRejected",
                receiverId,
                message: "Chat request declined"
              }));
              return;
            }
            if (permission.status === "pending") {
              ws.send(JSON.stringify({
                type: "consentPending",
                receiverId,
                message: "Waiting for consent"
              }));
              return;
            }
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
            const senderUser = await storage.getUser(userId);
            if (receiverConnection && receiverConnection.ws.readyState === WebSocket.OPEN) {
              receiverConnection.ws.send(JSON.stringify({
                type: "newMessage",
                message: newMessage,
                sender: senderUser ? toPublicUser2(senderUser) : null
              }));
            }
            ws.send(JSON.stringify({
              type: "messageConfirmed",
              message: newMessage
            }));
            if (permission.status === "no_consent") {
              console.log(`[WebSocket] Creating consent: requester=${userId}, responder=${receiverId}`);
              console.log(`[WebSocket] Connected users count: ${connectedUsers.size}`);
              console.log(`[WebSocket] Connected user IDs:`, Array.from(connectedUsers.keys()));
              const newConsent = await storage.createChatConsent({
                requesterId: userId,
                responderId: receiverId
              });
              console.log(`[WebSocket] Consent created:`, newConsent);
              const freshReceiverConnection = connectedUsers.get(receiverId);
              console.log(`[WebSocket] Receiver ${receiverId} connection status:`, {
                exists: !!freshReceiverConnection,
                wsState: freshReceiverConnection?.ws.readyState,
                senderUserExists: !!senderUser
              });
              if (freshReceiverConnection && freshReceiverConnection.ws.readyState === WebSocket.OPEN && senderUser) {
                console.log(`[WebSocket] \u2705 Sending consentRequest to receiver ${receiverId}`);
                freshReceiverConnection.ws.send(JSON.stringify({
                  type: "consentRequest",
                  consent: newConsent,
                  requester: toPublicUser2(senderUser),
                  firstMessage: newMessage
                }));
                console.log(`[WebSocket] \u2705 consentRequest sent successfully to ${receiverId}`);
              } else {
                console.log(`[WebSocket] \u274C Cannot send to receiver ${receiverId}:`, {
                  receiverConnected: !!freshReceiverConnection,
                  wsReady: freshReceiverConnection?.ws.readyState === WebSocket.OPEN,
                  senderUserExists: !!senderUser
                });
              }
              console.log(`[WebSocket] Sending consentPending to sender ${userId}`);
              ws.send(JSON.stringify({
                type: "consentPending",
                receiverId,
                message: "Waiting for consent"
              }));
              return;
            }
            const senderHasChatOpen = activeChatWindows.has(userId) && activeChatWindows.get(userId).has(receiverId);
            const receiverHasChatOpen = activeChatWindows.has(receiverId) && activeChatWindows.get(receiverId).has(userId);
            const bothActivelyChatting = senderHasChatOpen && receiverHasChatOpen;
            if (!bothActivelyChatting) {
              try {
                const existingNotification = await storage.findExistingNotification(
                  receiverId,
                  userId,
                  "message_received",
                  conversation.id
                );
                let notification;
                if (existingNotification) {
                  notification = await storage.updateNotificationTimestamp(existingNotification.id);
                } else {
                  notification = await storage.createNotification({
                    userId: receiverId,
                    type: "message_received",
                    fromUserId: userId,
                    conversationId: conversation.id
                  });
                }
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
                  receiverConnection.ws.send(JSON.stringify({
                    type: "messageCountUpdate",
                    action: "increment"
                  }));
                }
              } catch (notificationError) {
                console.error("Failed to create message notification:", notificationError);
              }
            }
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
  app2.post("/api/subscribe", async (req, res) => {
    try {
      const result = insertSubscriberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.errors[0]?.message || "Invalid email address"
        });
      }
      const { email } = result.data;
      const existingSubscriber = await storage.getSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(400).json({
          message: "You're already subscribed to our newsletter!"
        });
      }
      const subscriber = await storage.addSubscriber(email);
      try {
        await sendSubscribeEmail(email, subscriber.unsubscribeToken);
      } catch (emailError) {
        console.error("Failed to send subscribe email:", emailError);
      }
      res.status(201).json({
        message: "Successfully subscribed! Check your email for a welcome message."
      });
    } catch (error) {
      console.error("Error subscribing:", error);
      if (error.code === "23505") {
        return res.status(400).json({
          message: "You're already subscribed to our newsletter!"
        });
      }
      res.status(500).json({
        message: "Failed to subscribe. Please try again later."
      });
    }
  });
  app2.get("/api/unsubscribe", async (req, res) => {
    try {
      const token = req.query.token;
      if (!token) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invalid Link - SpreadLov</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
              .container { background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
              h1 { color: #dc2626; margin: 0 0 16px 0; }
              p { color: #4b5563; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Invalid Unsubscribe Link</h1>
              <p>This unsubscribe link is invalid or has expired.</p>
            </div>
          </body>
          </html>
        `);
      }
      const subscriber = await storage.getSubscriberByToken(token);
      if (!subscriber) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Unsubscribed - SpreadLov</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
              .container { background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
              h1 { color: #1f2937; margin: 0 0 16px 0; }
              p { color: #4b5563; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Already Unsubscribed</h1>
              <p>This email address has already been unsubscribed from our newsletter.</p>
            </div>
          </body>
          </html>
        `);
      }
      await storage.deleteSubscriber(token);
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed Successfully - SpreadLov</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #1f2937; margin: 0 0 16px 0; }
            p { color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
            .email { font-weight: 600; color: #667eea; }
            a { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
            a:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">\u2713</div>
            <h1>Successfully Unsubscribed</h1>
            <p>You've been unsubscribed from the SpreadLov newsletter.</p>
            <p class="email">${subscriber.email}</p>
            <p style="font-size: 14px; color: #6b7280;">We're sorry to see you go. You can always resubscribe anytime!</p>
            <a href="https://spreadlov.com">Return to SpreadLov</a>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - SpreadLov</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
            h1 { color: #dc2626; margin: 0 0 16px 0; }
            p { color: #4b5563; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p>An error occurred while processing your request. Please try again later.</p>
          </div>
        </body>
        </html>
      `);
    }
  });
  return httpServer;
}

// server/notification-listener.ts
import { Pool as Pool2 } from "pg";
import { eq as eq3 } from "drizzle-orm";
var listenerPool = null;
function getFullPhotoUrl(photoPath) {
  if (!photoPath) return "";
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }
  const baseUrl = process.env.BASE_URL || "https://spreadlov.com";
  const fullUrl = photoPath.startsWith("/") ? `${baseUrl}${photoPath}` : `${baseUrl}/${photoPath}`;
  log(`\u{1F517} Converted photo URL: ${photoPath} \u2192 ${fullUrl}`);
  return fullUrl;
}
async function startNotificationListener() {
  if (listenerPool) {
    log("\u26A0\uFE0F  Notification listener already running");
    return;
  }
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      log("\u26A0\uFE0F  DATABASE_URL not configured. Notification listener will not start.");
      return;
    }
    listenerPool = new Pool2({
      connectionString: databaseUrl
    });
    const client = await listenerPool.connect();
    await client.query("LISTEN new_notification");
    log("\u2705 PostgreSQL notification listener started");
    client.on("notification", async (msg) => {
      if (msg.channel === "new_notification" && msg.payload) {
        try {
          const payload = JSON.parse(msg.payload);
          const { notification_id, user_id, type, from_user_id, conversation_id } = payload;
          log(`\u{1F4EC} New notification received: ${type} for user ${user_id}`);
          const recipientUser = await db.query.users.findFirst({
            where: eq3(users.id, user_id)
          });
          const fromUser = await db.query.users.findFirst({
            where: eq3(users.id, from_user_id)
          });
          if (!recipientUser || !recipientUser.fcmToken) {
            log(`\u26A0\uFE0F  User ${user_id} has no FCM token registered`);
            return;
          }
          if (!fromUser) {
            log(`\u26A0\uFE0F  From user ${from_user_id} not found`);
            return;
          }
          const notification = await db.query.notifications.findFirst({
            where: eq3(notifications.id, notification_id)
          });
          let title = "SpreadLov";
          let body = "You have a new notification";
          if (type === "profile_view") {
            title = "Profile View";
            body = `${fromUser.firstName} viewed your profile.`;
          } else if (type === "profile_like") {
            title = "New Like";
            body = `${fromUser.firstName} liked your profile!`;
          } else if (type === "message_received") {
            title = "New Message";
            body = `${fromUser.firstName} sent you a message`;
          }
          const fullPhotoUrl = getFullPhotoUrl(fromUser.profilePhoto);
          log(`\u{1F4E4} Preparing to send push - From: ${fromUser.firstName} ${fromUser.lastName}, Photo: ${fullPhotoUrl}`);
          const success = await sendPushNotification(
            recipientUser.fcmToken,
            title,
            body,
            {
              type,
              fromUserId: from_user_id,
              fromUserName: `${fromUser.firstName} ${fromUser.lastName}`,
              fromUserPhoto: fullPhotoUrl,
              conversationId: conversation_id || notification?.conversationId || void 0
            }
          );
          if (success === false) {
            log(`\u{1F5D1}\uFE0F  Removing invalid FCM token for user ${user_id} (${recipientUser.firstName} ${recipientUser.lastName})`);
            try {
              await db.update(users).set({ fcmToken: null }).where(eq3(users.id, user_id));
              log(`\u2705 Successfully cleared invalid FCM token for user ${user_id}`);
            } catch (dbError) {
              log(`\u274C Failed to clear FCM token from database: ${dbError}`);
            }
          }
        } catch (error) {
          log(`\u274C Error processing notification: ${error}`);
        }
      }
    });
    client.on("error", (err) => {
      log(`\u274C PostgreSQL listener error: ${err}`);
    });
  } catch (error) {
    log(`\u274C Failed to start notification listener: ${error}`);
  }
}
async function stopNotificationListener() {
  if (listenerPool) {
    await listenerPool.end();
    listenerPool = null;
    log("\u{1F6D1} PostgreSQL notification listener stopped");
  }
}
process.on("SIGINT", async () => {
  await stopNotificationListener();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await stopNotificationListener();
  process.exit(0);
});

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  const host = req.get("host");
  if (host && host.startsWith("www.")) {
    const protocol = req.protocol || "https";
    const newUrl = `${protocol}://${host.substring(4)}${req.originalUrl}`;
    return res.redirect(301, newUrl);
  }
  next();
});
app.get("*.php", (req, res) => {
  const path4 = req.path.toLowerCase();
  const redirectMap = {
    "/index.php": "/",
    "/home.php": "/",
    "/subscribe.php": "/subscribe",
    "/subscription.php": "/subscribe",
    "/terms.php": "/terms",
    "/tos.php": "/terms",
    "/termsofservice.php": "/terms",
    "/privacy.php": "/terms",
    "/privacy_policy.php": "/terms",
    "/privacypolicy.php": "/terms",
    "/privacy-policy.php": "/terms",
    "/safety.php": "/safety-standards",
    "/safety-standards.php": "/safety-standards",
    "/login.php": "/auth",
    "/signin.php": "/auth",
    "/signup.php": "/auth",
    "/register.php": "/auth",
    "/auth.php": "/auth",
    "/discover.php": "/discover",
    "/messages.php": "/messages",
    "/chat.php": "/chat",
    "/chat3.php": "/chat",
    "/profile.php": "/profile",
    "/myprofile.php": "/profile",
    "/my-profile.php": "/profile",
    "/notifications.php": "/notifications",
    "/404.php": "/",
    "/error.php": "/"
  };
  const newPath = redirectMap[path4] || "/";
  res.redirect(301, newPath);
});
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
    startNotificationListener();
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

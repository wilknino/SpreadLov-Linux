import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
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
  fcmToken: text("fcm_token"),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content"),
  imageUrl: text("image_url"),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'profile_view' | 'message_received'
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  conversationId: varchar("conversation_id").references(() => conversations.id), // optional, for message notifications
  isRead: boolean("is_read").default(false),
  data: json("data"), // additional metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatConsents = pgTable("chat_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  responderId: varchar("responder_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // 'pending' | 'accepted' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profileLikes = pgTable("profile_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  likerId: varchar("liker_id").notNull().references(() => users.id),
  likedUserId: varchar("liked_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueLikerLiked: unique().on(table.likerId, table.likedUserId),
}));

export const accountDeletionCodes = pgTable("account_deletion_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attemptCount: integer("attempt_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  unsubscribeToken: text("unsubscribe_token").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
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
  authProvider: true,
}).extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .optional(),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other"]),
  age: z.number().int().min(18, "Age must be at least 18").max(99, "Age must be at most 99"),
  location: z.string().max(100, "Location must be at most 100 characters").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  photos: z.array(z.string().url("Invalid URL")).max(5, "Maximum 5 photos allowed").optional(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
  isRead: true,
}).extend({
  content: z.string().optional(),
  imageUrl: z.string().optional(),
}).refine((data) => data.content || data.imageUrl, {
  message: "Message must contain either text content or an image",
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
}).extend({
  type: z.enum(["profile_view", "message_received", "profile_like"]),
  data: z.record(z.any()).optional(),
});

export const insertChatConsentSchema = createInsertSchema(chatConsents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  requesterId: z.string(),
  responderId: z.string(),
});

export const insertProfileLikeSchema = createInsertSchema(profileLikes).omit({
  id: true,
  createdAt: true,
}).extend({
  likerId: z.string(),
  likedUserId: z.string(),
});

export const insertAccountDeletionCodeSchema = createInsertSchema(accountDeletionCodes).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email(),
  code: z.string(),
  expiresAt: z.date(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
  unsubscribeToken: true,
}).extend({
  email: z.string().email("Invalid email address"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertChatConsent = z.infer<typeof insertChatConsentSchema>;
export type ChatConsent = typeof chatConsents.$inferSelect;
export type InsertProfileLike = z.infer<typeof insertProfileLikeSchema>;
export type ProfileLike = typeof profileLikes.$inferSelect;
export type InsertAccountDeletionCode = z.infer<typeof insertAccountDeletionCodeSchema>;
export type AccountDeletionCode = typeof accountDeletionCodes.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

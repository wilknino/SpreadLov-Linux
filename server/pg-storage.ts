import { eq, and, or, desc } from "drizzle-orm";
import { 
  users, 
  conversations, 
  messages,
  notifications,
  chatConsents,
  type User, 
  type InsertUser, 
  type Conversation, 
  type InsertConversation, 
  type Message, 
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type ChatConsent,
  type InsertChatConsent
} from "@shared/schema";
import type { IStorage } from "./storage";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { db, pool } from "./db";

const PgSession = ConnectPgSimple(session);

export class PgStorage implements IStorage {
  private db;
  public sessionStore: any;

  constructor() {
    this.db = db;
    
    // Set up PostgreSQL session store
    this.sessionStore = new PgSession({
      pool: pool as any,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined> {
    const result = await this.db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.participant1Id, user1Id), eq(conversations.participant2Id, user2Id)),
          and(eq(conversations.participant1Id, user2Id), eq(conversations.participant2Id, user1Id))
        )
      )
      .limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; lastMessage?: Message }>> {
    const userConversations = await this.db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
        const otherUser = await this.getUser(otherUserId);
        const conversationMessages = await this.getMessages(conv.id);
        const lastMessage = conversationMessages[conversationMessages.length - 1];
        
        return {
          ...conv,
          otherUser: otherUser!,
          lastMessage,
        };
      })
    );

    return enrichedConversations;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const result = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
    return result;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await this.db.insert(messages).values(message).returning();
    
    // Update conversation's last message time
    await this.db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.db.select().from(users);
    return result;
  }

  async getOnlineUsers(): Promise<User[]> {
    const result = await this.db.select().from(users).where(eq(users.isOnline, true)).orderBy(desc(users.lastSeen));
    return result;
  }

  async setUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.db
      .update(users)
      .set({ 
        isOnline, 
        lastSeen: new Date() 
      })
      .where(eq(users.id, userId));
  }

  // Notification methods
  async getUserNotifications(userId: string): Promise<Array<Notification & { fromUser: User }>> {
    const userNotifications = await this.db
      .select({
        notification: notifications,
        fromUser: users,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.fromUserId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return userNotifications.map(({ notification, fromUser }) => ({
      ...notification,
      fromUser: fromUser!,
    }));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await this.db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.db.delete(notifications).where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  // Email verification methods
  async setVerificationCode(userId: string, code: string, expiry: Date): Promise<void> {
    await this.db
      .update(users)
      .set({
        verificationCode: code,
        verificationCodeExpiry: expiry,
      })
      .where(eq(users.id, userId));
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return false;
    }

    const now = new Date();
    const isCodeValid = user.verificationCode === code && user.verificationCodeExpiry > now;
    return isCodeValid;
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      })
      .where(eq(users.id, userId));
  }

  async canResendCode(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.lastCodeSentAt) {
      return true;
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    return user.lastCodeSentAt < oneMinuteAgo;
  }

  async updateLastCodeSentAt(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ lastCodeSentAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserVerification(userId: string, verified: boolean): Promise<User> {
    const result = await this.db
      .update(users)
      .set({
        emailVerified: verified,
        verificationCode: verified ? null : undefined,
        verificationCodeExpiry: verified ? null : undefined,
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    return result[0];
  }

  async updateUserVerificationCode(userId: string, code: string, expiry: Date): Promise<void> {
    await this.db
      .update(users)
      .set({
        verificationCode: code,
        verificationCodeExpiry: expiry,
        lastCodeSentAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Password reset methods
  async setPasswordResetCode(email: string, code: string, expiry: Date): Promise<void> {
    await this.db
      .update(users)
      .set({
        passwordResetCode: code,
        passwordResetExpiry: expiry,
        passwordResetRequestedAt: new Date(),
      })
      .where(eq(users.email, email));
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.passwordResetCode || !user.passwordResetExpiry) {
      return false;
    }

    const now = new Date();
    const isCodeValid = user.passwordResetCode === code && user.passwordResetExpiry > now;
    return isCodeValid;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        password: newPassword,
        passwordResetCode: null,
        passwordResetExpiry: null,
        passwordResetRequestedAt: null,
      })
      .where(eq(users.id, userId));
  }

  async canRequestPasswordReset(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.passwordResetRequestedAt) {
      return true;
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    return user.passwordResetRequestedAt < oneMinuteAgo;
  }

  async clearPasswordResetCode(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        passwordResetCode: null,
        passwordResetExpiry: null,
      })
      .where(eq(users.id, userId));
  }

  // Chat consent methods
  async getChatConsent(requesterId: string, responderId: string): Promise<ChatConsent | undefined> {
    const result = await this.db
      .select()
      .from(chatConsents)
      .where(
        or(
          and(eq(chatConsents.requesterId, requesterId), eq(chatConsents.responderId, responderId)),
          and(eq(chatConsents.requesterId, responderId), eq(chatConsents.responderId, requesterId))
        )
      )
      .limit(1);
    return result[0];
  }

  async createChatConsent(consent: InsertChatConsent): Promise<ChatConsent> {
    const result = await this.db.insert(chatConsents).values(consent).returning();
    return result[0];
  }

  async updateConsentStatus(consentId: string, status: string): Promise<ChatConsent> {
    const result = await this.db
      .update(chatConsents)
      .set({ status, updatedAt: new Date() })
      .where(eq(chatConsents.id, consentId))
      .returning();
    return result[0];
  }

  async checkChatPermission(senderId: string, receiverId: string): Promise<{ allowed: boolean; status?: string; consent?: ChatConsent }> {
    const consent = await this.getChatConsent(senderId, receiverId);
    
    if (!consent) {
      return { allowed: false, status: 'no_consent' };
    }

    if (consent.status === 'accepted') {
      return { allowed: true, status: 'accepted', consent };
    }

    if (consent.status === 'rejected') {
      return { allowed: false, status: 'rejected', consent };
    }

    // pending status
    return { allowed: false, status: 'pending', consent };
  }
}
import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type Notification, type InsertNotification, type ChatConsent, type InsertChatConsent, type ProfileLike, type InsertProfileLike, type AccountDeletionCode, type InsertAccountDeletionCode, type Subscriber, type InsertSubscriber } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; lastMessage?: Message }>>;
  
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  getAllUsers(): Promise<User[]>;
  getOnlineUsers(): Promise<User[]>;
  setUserOnlineStatus(userId: string, isOnline: boolean): Promise<void>;
  
  // Notification methods
  getUserNotifications(userId: string): Promise<Array<Notification & { fromUser: User }>>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  getUnreadMessageNotificationCount(userId: string): Promise<number>;
  getUnreadProfileViewNotificationCount(userId: string): Promise<number>;
  markMessageNotificationsAsReadFromUser(userId: string, fromUserId: string): Promise<void>;
  markMessagesAsReadInConversation(conversationId: string, receiverId: string): Promise<void>;
  findExistingNotification(userId: string, fromUserId: string, type: string, conversationId?: string): Promise<Notification | undefined>;
  updateNotificationTimestamp(notificationId: string): Promise<Notification>;
  
  // Email verification methods
  setVerificationCode(userId: string, code: string, expiry: Date): Promise<void>;
  verifyCode(userId: string, code: string): Promise<boolean>;
  markEmailAsVerified(userId: string): Promise<void>;
  canResendCode(userId: string): Promise<boolean>;
  updateLastCodeSentAt(userId: string): Promise<void>;
  updateUserVerification(userId: string, verified: boolean): Promise<User>;
  updateUserVerificationCode(userId: string, code: string, expiry: Date): Promise<void>;
  
  // Password reset methods
  setPasswordResetCode(email: string, code: string, expiry: Date): Promise<void>;
  verifyPasswordResetCode(email: string, code: string): Promise<boolean>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  canRequestPasswordReset(email: string): Promise<boolean>;
  clearPasswordResetCode(userId: string): Promise<void>;
  
  // Chat consent methods
  getChatConsent(requesterId: string, responderId: string): Promise<ChatConsent | undefined>;
  createChatConsent(consent: InsertChatConsent): Promise<ChatConsent>;
  updateConsentStatus(consentId: string, status: string): Promise<ChatConsent>;
  checkChatPermission(senderId: string, receiverId: string): Promise<{ allowed: boolean; status?: string; consent?: ChatConsent }>;
  
  // Profile like methods
  likeProfile(likerId: string, likedUserId: string): Promise<ProfileLike>;
  unlikeProfile(likerId: string, likedUserId: string): Promise<void>;
  checkIfLiked(likerId: string, likedUserId: string): Promise<boolean>;
  getUserLikes(userId: string): Promise<Array<ProfileLike & { likerUser: User }>>;
  getLikesCount(userId: string): Promise<number>;
  
  // Account deletion methods
  createAccountDeletionCode(email: string, code: string, expiresAt: Date): Promise<void>;
  verifyAccountDeletionCode(email: string, code: string): Promise<boolean>;
  deleteAllUserData(email: string): Promise<void>;
  cleanupExpiredDeletionCodes(): Promise<void>;
  
  // Subscriber methods
  addSubscriber(email: string): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getSubscriberByToken(token: string): Promise<Subscriber | undefined>;
  deleteSubscriber(token: string): Promise<void>;
  getAllSubscribers(): Promise<Subscriber[]>;
  
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private notifications: Map<string, Notification>;
  private chatConsents: Map<string, ChatConsent>;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.chatConsents = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      password: insertUser.password || null,
      isOnline: false,
      lastSeen: new Date(),
      createdAt: new Date(),
      profilePhoto: insertUser.profilePhoto || null,
      dateOfBirth: null,
      location: insertUser.location || null,
      bio: insertUser.bio || null,
      photos: insertUser.photos || null,
      filterGender: insertUser.filterGender || null,
      filterLocation: insertUser.filterLocation || null,
      filterAgeMin: insertUser.filterAgeMin || null,
      filterAgeMax: insertUser.filterAgeMax || null,
      emailVerified: false,
      verificationCode: null,
      verificationCodeExpiry: null,
      lastCodeSentAt: null,
      passwordResetCode: null,
      passwordResetExpiry: null,
      passwordResetRequestedAt: null,
      googleId: null,
      authProvider: "local",
      fcmToken: null,
      needsProfileCompletion: false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      (conv) => 
        (conv.participant1Id === user1Id && conv.participant2Id === user2Id) ||
        (conv.participant1Id === user2Id && conv.participant2Id === user1Id)
    );
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      lastMessageAt: new Date(),
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; lastMessage?: Message }>> {
    const userConversations = Array.from(this.conversations.values()).filter(
      (conv) => conv.participant1Id === userId || conv.participant2Id === userId
    );

    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
        const otherUser = await this.getUser(otherUserId);
        const messages = await this.getMessages(conv.id);
        const lastMessage = messages[messages.length - 1];
        
        return {
          ...conv,
          otherUser: otherUser!,
          lastMessage,
        };
      })
    );

    return enrichedConversations.sort((a, b) => 
      new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
    );
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      content: insertMessage.content || null,
      imageUrl: insertMessage.imageUrl || null,
      isRead: false,
    };
    this.messages.set(id, message);
    
    // Update conversation's last message time
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      this.conversations.set(insertMessage.conversationId, {
        ...conversation,
        lastMessageAt: new Date(),
      });
    }
    
    return message;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isOnline);
  }

  async setUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        isOnline,
        lastSeen: new Date(),
      });
    }
  }

  // Notification methods
  async getUserNotifications(userId: string): Promise<Array<Notification & { fromUser: User }>> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    const enrichedNotifications = await Promise.all(
      userNotifications.map(async (notification) => {
        const fromUser = await this.getUser(notification.fromUserId);
        return {
          ...notification,
          fromUser: fromUser!,
        };
      })
    );

    return enrichedNotifications;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      data: insertNotification.data || null,
      conversationId: insertNotification.conversationId || null,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      this.notifications.set(notificationId, {
        ...notification,
        isRead: true,
      });
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .forEach(notification => {
        this.notifications.set(notification.id, {
          ...notification,
          isRead: true,
        });
      });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications.delete(notificationId);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }

  async getUnreadMessageNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        !notification.isRead && 
        notification.type === 'message_received'
      )
      .length;
  }

  async getUnreadProfileViewNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        !notification.isRead && 
        notification.type === 'profile_view'
      )
      .length;
  }

  async markMessageNotificationsAsReadFromUser(userId: string, fromUserId: string): Promise<void> {
    Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        notification.fromUserId === fromUserId && 
        notification.type === 'message_received' && 
        !notification.isRead
      )
      .forEach(notification => {
        this.notifications.set(notification.id, { ...notification, isRead: true });
      });
  }

  async markMessagesAsReadInConversation(conversationId: string, receiverId: string): Promise<void> {
    Array.from(this.messages.values())
      .filter(message => 
        message.conversationId === conversationId && 
        message.senderId !== receiverId && 
        !message.isRead
      )
      .forEach(message => {
        this.messages.set(message.id, { ...message, isRead: true });
      });
  }

  async findExistingNotification(userId: string, fromUserId: string, type: string, conversationId?: string): Promise<Notification | undefined> {
    return Array.from(this.notifications.values()).find(notification => {
      const basicMatch = notification.userId === userId &&
                        notification.fromUserId === fromUserId &&
                        notification.type === type;
      
      if (conversationId) {
        return basicMatch && notification.conversationId === conversationId;
      }
      
      return basicMatch;
    });
  }

  async updateNotificationTimestamp(notificationId: string): Promise<Notification> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }
    
    const updatedNotification: Notification = {
      ...notification,
      createdAt: new Date(),
      isRead: false,
    };
    
    this.notifications.set(notificationId, updatedNotification);
    return updatedNotification;
  }

  // Email verification methods
  async setVerificationCode(userId: string, code: string, expiry: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        verificationCode: code,
        verificationCodeExpiry: expiry,
      });
    }
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return false;
    }

    const now = new Date();
    const isCodeValid = user.verificationCode === code && user.verificationCodeExpiry > now;
    return isCodeValid;
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      });
    }
  }

  async canResendCode(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.lastCodeSentAt) {
      return true;
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    return user.lastCodeSentAt < oneMinuteAgo;
  }

  async updateLastCodeSentAt(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        lastCodeSentAt: new Date(),
      });
    }
  }

  async updateUserVerification(userId: string, verified: boolean): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = {
      ...user,
      emailVerified: verified,
      verificationCode: verified ? null : user.verificationCode,
      verificationCodeExpiry: verified ? null : user.verificationCodeExpiry,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserVerificationCode(userId: string, code: string, expiry: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        verificationCode: code,
        verificationCodeExpiry: expiry,
        lastCodeSentAt: new Date(),
      });
    }
  }

  // Password reset methods
  async setPasswordResetCode(email: string, code: string, expiry: Date): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (user) {
      this.users.set(user.id, {
        ...user,
        passwordResetCode: code,
        passwordResetExpiry: expiry,
        passwordResetRequestedAt: new Date(),
      });
    }
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
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        password: newPassword,
        passwordResetCode: null,
        passwordResetExpiry: null,
        passwordResetRequestedAt: null,
      });
    }
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
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        passwordResetCode: null,
        passwordResetExpiry: null,
      });
    }
  }

  // Chat consent methods
  async getChatConsent(requesterId: string, responderId: string): Promise<ChatConsent | undefined> {
    return Array.from(this.chatConsents.values()).find(
      (consent) =>
        (consent.requesterId === requesterId && consent.responderId === responderId) ||
        (consent.requesterId === responderId && consent.responderId === requesterId)
    );
  }

  async createChatConsent(insertConsent: InsertChatConsent): Promise<ChatConsent> {
    const id = randomUUID();
    const consent: ChatConsent = {
      ...insertConsent,
      id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatConsents.set(id, consent);
    return consent;
  }

  async updateConsentStatus(consentId: string, status: string): Promise<ChatConsent> {
    const consent = this.chatConsents.get(consentId);
    if (!consent) {
      throw new Error("Consent not found");
    }
    const updatedConsent = {
      ...consent,
      status,
      updatedAt: new Date(),
    };
    this.chatConsents.set(consentId, updatedConsent);
    return updatedConsent;
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

  // Profile like methods
  async likeProfile(likerId: string, likedUserId: string): Promise<ProfileLike> {
    throw new Error("Method not implemented in MemStorage");
  }

  async unlikeProfile(likerId: string, likedUserId: string): Promise<void> {
    throw new Error("Method not implemented in MemStorage");
  }

  async checkIfLiked(likerId: string, likedUserId: string): Promise<boolean> {
    return false;
  }

  async getUserLikes(userId: string): Promise<Array<ProfileLike & { likerUser: User }>> {
    return [];
  }

  async getLikesCount(userId: string): Promise<number> {
    return 0;
  }

  // Account deletion methods
  async createAccountDeletionCode(email: string, code: string, expiresAt: Date): Promise<void> {
    // In-memory implementation - not persistent
  }

  async verifyAccountDeletionCode(email: string, code: string): Promise<boolean> {
    return false;
  }

  async deleteAllUserData(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) return;

    // Delete all related data
    Array.from(this.messages.values())
      .filter(msg => msg.senderId === user.id)
      .forEach(msg => this.messages.delete(msg.id));
    
    Array.from(this.notifications.values())
      .filter(notif => notif.userId === user.id || notif.fromUserId === user.id)
      .forEach(notif => this.notifications.delete(notif.id));
    
    Array.from(this.chatConsents.values())
      .filter(consent => consent.requesterId === user.id || consent.responderId === user.id)
      .forEach(consent => this.chatConsents.delete(consent.id));
    
    Array.from(this.conversations.values())
      .filter(conv => conv.participant1Id === user.id || conv.participant2Id === user.id)
      .forEach(conv => this.conversations.delete(conv.id));
    
    this.users.delete(user.id);
  }

  async cleanupExpiredDeletionCodes(): Promise<void> {
    // In-memory implementation - no cleanup needed
  }

  // Subscriber methods
  async addSubscriber(email: string): Promise<Subscriber> {
    throw new Error("Method not implemented in MemStorage");
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return undefined;
  }

  async getSubscriberByToken(token: string): Promise<Subscriber | undefined> {
    return undefined;
  }

  async deleteSubscriber(token: string): Promise<void> {
    // No-op in memory storage
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return [];
  }
}

import { PgStorage } from "./pg-storage";

// Use PostgreSQL storage for production
export const storage = new PgStorage();

import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendSupportEmail, sendAccountDeletionEmail, generateVerificationCode, sendSubscribeEmail } from "./email";
import { insertMessageSchema, insertConversationSchema, insertNotificationSchema, insertSubscriberSchema, type User } from "@shared/schema";
import { parse } from "url";
import { parse as parseCookie } from "cookie";
import { initializeFirebase } from "./fcm-service";
import { handleNotificationWebhook } from "./notification-webhook";

// Helper to convert user to safe public profile
function toPublicUser(user: User) {
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

interface AuthenticatedRequest extends Request {
  user?: User;
  file?: Express.Multer.File;
  isAuthenticated: any; // Passport.js method - using any to avoid complex typing issues
  logout: any; // Passport.js method - using any to avoid complex typing issues
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Firebase for push notifications
  initializeFirebase();

  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Get all users with optional filters (for discovery page)
  app.get("/api/users", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { gender, location, ageMin, ageMax } = req.query;
      
      let users = await storage.getAllUsers();
      
      // Filter out current user
      users = users.filter(user => user.id !== req.user!.id);
      
      // Only show email-verified users to others (unverified users can't be discovered)
      users = users.filter(user => user.emailVerified === true);
      
      // Apply filters with validation
      if (gender && gender !== '') {
        users = users.filter(user => user.gender === gender);
      }
      
      if (location && location !== '') {
        users = users.filter(user => 
          user.location && user.location.toLowerCase().includes((location as string).toLowerCase())
        );
      }
      
      if (ageMin) {
        const minAge = parseInt(ageMin as string);
        if (!isNaN(minAge) && minAge >= 18) {
          users = users.filter(user => user.age >= minAge);
        }
      }
      
      if (ageMax) {
        const maxAge = parseInt(ageMax as string);
        if (!isNaN(maxAge) && maxAge <= 99) {
          users = users.filter(user => user.age <= maxAge);
        }
      }
      
      // Return safe public profile data
      res.json(users.map(toPublicUser));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get online users with optional filters (for discovery page)
  app.get("/api/users/online", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { gender, location, ageMin, ageMax } = req.query;
      
      let users = await storage.getOnlineUsers();
      
      // Filter out current user
      users = users.filter(user => user.id !== req.user!.id);
      
      // Only show email-verified users to others (unverified users can't be discovered)
      users = users.filter(user => user.emailVerified === true);
      
      // Apply filters with validation
      if (gender && gender !== '') {
        users = users.filter(user => user.gender === gender);
      }
      
      if (location && location !== '') {
        users = users.filter(user => 
          user.location && user.location.toLowerCase().includes((location as string).toLowerCase())
        );
      }
      
      if (ageMin) {
        const minAge = parseInt(ageMin as string);
        if (!isNaN(minAge) && minAge >= 18) {
          users = users.filter(user => user.age >= minAge);
        }
      }
      
      if (ageMax) {
        const maxAge = parseInt(ageMax as string);
        if (!isNaN(maxAge) && maxAge <= 99) {
          users = users.filter(user => user.age <= maxAge);
        }
      }
      
      res.json(users.map(toPublicUser));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });

  // Get specific user profile by ID
app.get("/api/users/:userId", async (req: AuthenticatedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  try {
    const { userId } = req.params;
    
    // Prevent users from accessing their own profile through this endpoint
    if (userId === req.user!.id) {
      return res.status(400).json({ message: "Use /api/user for your own profile" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create or update profile view notification to avoid duplicates
    try {
      // Check if notification already exists from this user
      const existingNotification = await storage.findExistingNotification(
        userId,
        req.user!.id,
        "profile_view"
      );
      
      let notification;
      let isNewNotification = false;
      let wasRead = false;
      
      if (existingNotification) {
        // Store whether the notification was read before updating
        wasRead = existingNotification.isRead ?? false;
        // Update timestamp of existing notification instead of creating new one
        notification = await storage.updateNotificationTimestamp(existingNotification.id);
      } else {
        // Create new notification (trigger will fire and send push notification)
        notification = await storage.createNotification({
          userId: userId,
          type: "profile_view",
          fromUserId: req.user!.id,
        });
        isNewNotification = true;
      }
      
      // Send real-time notification to viewed user if they're online
      const fromUser = await storage.getUser(req.user!.id);
      if (fromUser) {
        const sent = sendToUser(userId, {
          type: 'newNotification',
          notification: {
            id: notification.id,
            type: 'profile_view',
            fromUserId: req.user!.id,
            fromUserName: fromUser.firstName,
            fromUserPhoto: fromUser.profilePhoto,
            message: `${fromUser.firstName} viewed your profile.`,
            createdAt: notification.createdAt
          }
        });
        
        // Only increment counter if: new notification OR existing was already read
        if (isNewNotification || wasRead) {
          sendToUser(userId, {
            type: 'notificationCountUpdate',
            action: 'increment'
          });
        }
        
        if (sent) {
          console.log(`✅ Profile view notification sent to user ${userId} from ${fromUser.firstName}`);
        }
      }
    } catch (notificationError) {
      // Don't fail the request if notification creation fails
      console.error('Failed to create profile view notification:', notificationError);
    }
    
    res.json(toPublicUser(user));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});
  // Get user conversations
  app.get("/api/conversations", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const conversations = await storage.getUserConversations(req.user!.id);
      // Sanitize user data in conversations
      const safeConversations = conversations.map(conv => ({
        ...conv,
        otherUser: toPublicUser(conv.otherUser)
      }));
      res.json(safeConversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:userId/messages", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { userId } = req.params;
      let conversation = await storage.getConversation(req.user!.id, userId);
      
      if (!conversation) {
        // Create conversation if it doesn't exist
        conversation = await storage.createConversation({
          participant1Id: req.user!.id,
          participant2Id: userId,
        });
      }
      
      const messages = await storage.getMessages(conversation.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Update user profile
  app.patch("/api/profile", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const updates = req.body;
      delete updates.id; // Prevent ID modification
      delete updates.password; // Prevent password change through this route
      
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(toPublicUser(updatedUser));
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get user's saved filter preferences
  app.get("/api/user/filters", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        gender: user.filterGender || "",
        location: user.filterLocation || "",
        ageMin: user.filterAgeMin || 18,
        ageMax: user.filterAgeMax || 40,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch filters" });
    }
  });

  // Save/update user's filter preferences
  app.patch("/api/user/filters", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { gender, location, ageMin, ageMax } = req.body;
      
      const updatedUser = await storage.updateUser(req.user!.id, {
        filterGender: gender || null,
        filterLocation: location || null,
        filterAgeMin: ageMin || null,
        filterAgeMax: ageMax || null,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        gender: updatedUser.filterGender || "",
        location: updatedUser.filterLocation || "",
        ageMin: updatedUser.filterAgeMin || 18,
        ageMax: updatedUser.filterAgeMax || 40,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save filters" });
    }
  });

  // Reset user's filter preferences to default
  app.delete("/api/user/filters", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const updatedUser = await storage.updateUser(req.user!.id, {
        filterGender: null,
        filterLocation: null,
        filterAgeMin: null,
        filterAgeMax: null,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        gender: "",
        location: "",
        ageMin: 18,
        ageMax: 40,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset filters" });
    }
  });

// Register or update FCM token for push notifications
app.post("/api/user/fcm-token", async (req: AuthenticatedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim() === '') {
      return res.status(400).json({ message: "Valid FCM token is required" });
    }
    
    // Update user's FCM token in database
    const updatedUser = await storage.updateUser(req.user!.id, {
      fcmToken: fcmToken.trim(),
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`✅ FCM token registered for user ${req.user!.id} (${updatedUser.firstName} ${updatedUser.lastName})`);
    
    res.json({ 
      message: "FCM token registered successfully",
      success: true 
    });
  } catch (error) {
    console.error('Failed to register FCM token:', error);
    res.status(500).json({ message: "Failed to register FCM token" });
  }
});

// Remove FCM token (for logout)
app.delete("/api/user/fcm-token", async (req: AuthenticatedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  try {
    const updatedUser = await storage.updateUser(req.user!.id, {
      fcmToken: null,
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`🔄 FCM token removed for user ${req.user!.id} (${updatedUser.firstName} ${updatedUser.lastName})`);
    
    res.json({ 
      message: "FCM token removed successfully",
      success: true 
    });
  } catch (error) {
    console.error('Failed to remove FCM token:', error);
    res.status(500).json({ message: "Failed to remove FCM token" });
  }
});

  // Complete Google OAuth profile (birthdate and gender)
  app.patch("/api/user/complete-profile", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { birthdate, gender } = req.body;
      
      // Validate required fields
      if (!birthdate || !gender) {
        return res.status(400).json({ message: "Birthdate and gender are required" });
      }
      
      // Validate birthdate format
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ message: "Invalid birthdate format" });
      }
      
      // Calculate age from birthdate
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Validate age (must be 18+)
      if (age < 18 || isNaN(age)) {
        return res.status(400).json({ message: "You must be at least 18 years old" });
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(req.user!.id, {
        age,
        gender,
        needsProfileCompletion: false,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        success: true,
        user: toPublicUser(updatedUser)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });

  // Register FCM token for push notifications (Android app)
  app.post("/api/user/fcm-token", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { fcmToken } = req.body;
      
      if (!fcmToken || typeof fcmToken !== 'string') {
        return res.status(400).json({ message: "Valid FCM token is required" });
      }
      
      const updatedUser = await storage.updateUser(req.user!.id, {
        fcmToken,
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

  // FCM webhook endpoint (called by PostgreSQL trigger)
  app.post("/api/fcm/notify", handleNotificationWebhook);

  // Upload profile picture
  app.post("/api/upload/profile", upload.single('profilePicture'), async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const profilePhotoUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await storage.updateUser(req.user!.id, { profilePhoto: profilePhotoUrl });
      
      res.json({ 
        profilePhoto: profilePhotoUrl, 
        user: updatedUser ? toPublicUser(updatedUser) : null 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Upload message image
  app.post("/api/upload/message", upload.single('messageImage'), async (req: AuthenticatedRequest, res: Response) => {
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

  // Multiple photos upload for profile gallery (max 5 photos)
  app.post("/api/upload/photos", upload.array('photos', 5), async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      // Get current user to check existing photos
      const currentUser = await storage.getUser(req.user!.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get existing photos count
      const existingPhotos = currentUser.photos && Array.isArray(currentUser.photos) ? currentUser.photos : [];
      const newPhotoUrls = req.files.map(file => `/uploads/${file.filename}`);
      
      // Ensure total photos don't exceed 5 (including existing ones)
      const allPhotos = [...existingPhotos, ...newPhotoUrls];
      if (allPhotos.length > 5) {
        return res.status(400).json({ 
          message: `Maximum 5 photos allowed. You currently have ${existingPhotos.length} photos.`,
          maxPhotos: 5,
          currentCount: existingPhotos.length,
          attemptedUpload: newPhotoUrls.length
        });
      }
      
      // Update user with new photos array
      const updatedUser = await storage.updateUser(req.user!.id, { photos: allPhotos });
      
      res.json({ 
        photos: allPhotos,
        newPhotos: newPhotoUrls,
        user: updatedUser ? toPublicUser(updatedUser) : null 
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });

  // Delete a photo from user's gallery
  app.delete("/api/photos", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { photoUrl } = req.body;
      
      if (!photoUrl) {
        return res.status(400).json({ message: "Photo URL is required" });
      }
      
      const currentUser = await storage.getUser(req.user!.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const existingPhotos = currentUser.photos && Array.isArray(currentUser.photos) ? currentUser.photos : [];
      const updatedPhotos = existingPhotos.filter(photo => photo !== photoUrl);
      
      if (existingPhotos.length === updatedPhotos.length) {
        return res.status(404).json({ message: "Photo not found in gallery" });
      }
      
      const updatedUser = await storage.updateUser(req.user!.id, { photos: updatedPhotos });
      
      res.json({ 
        photos: updatedPhotos,
        user: updatedUser ? toPublicUser(updatedUser) : null 
      });
    } catch (error) {
      console.error('Photo delete error:', error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications.map(notification => ({
        ...notification,
        fromUser: toPublicUser(notification.fromUser),
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Only count profile view notifications (exclude messages)
      const count = await storage.getUnreadProfileViewNotificationCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.get("/api/messages/unread-count", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const count = await storage.getUnreadMessageNotificationCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message unread count" });
    }
  });

  app.post("/api/notifications/mark-read/:id", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Profile Like Routes
  app.post("/api/likes/:userId", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { userId } = req.params;
      const likerId = req.user!.id;

      // Prevent liking own profile
      if (likerId === userId) {
        return res.status(400).json({ message: "You cannot like your own profile" });
      }

      // Create the like
      const like = await storage.likeProfile(likerId, userId);

      // Create or update profile like notification to avoid duplicates
      const existingNotification = await storage.findExistingNotification(
        userId,
        likerId,
        "profile_like"
      );
      
      let notification;
      let isNewNotification = false;
      let wasRead = false;
      
      if (existingNotification) {
        // Store whether the notification was read before updating
        wasRead = existingNotification.isRead ?? false;
        // Update timestamp of existing notification instead of creating new one
        notification = await storage.updateNotificationTimestamp(existingNotification.id);
      } else {
        // Create new notification for the liked user
        notification = await storage.createNotification({
          userId: userId,
          type: 'profile_like',
          fromUserId: likerId,
        });
        isNewNotification = true;
      }

      // Send real-time notification to liked user if they're online
      const fromUser = await storage.getUser(likerId);
      if (fromUser) {
        const sent = sendToUser(userId, {
          type: 'newNotification',
          notification: {
            id: notification.id,
            type: 'profile_like',
            fromUserId: likerId,
            fromUserName: fromUser.firstName,
            fromUserPhoto: fromUser.profilePhoto,
            message: `${fromUser.firstName} liked your profile.`,
            createdAt: notification.createdAt
          }
        });
        
        // Only increment counter if: new notification OR existing was already read
        if (isNewNotification || wasRead) {
          sendToUser(userId, {
            type: 'notificationCountUpdate',
            action: 'increment'
          });
        }
        
        if (sent) {
          console.log(`Profile like notification sent to user ${userId} from ${fromUser.firstName}`);
        }
      }

      res.json(like);
    } catch (error) {
      console.error('Error liking profile:', error);
      res.status(500).json({ message: "Failed to like profile" });
    }
  });

  app.delete("/api/likes/:userId", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { userId } = req.params;
      const likerId = req.user!.id;

      await storage.unlikeProfile(likerId, userId);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error unliking profile:', error);
      res.status(500).json({ message: "Failed to unlike profile" });
    }
  });

  app.get("/api/likes/check/:userId", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { userId } = req.params;
      const likerId = req.user!.id;

      const isLiked = await storage.checkIfLiked(likerId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error('Error checking like status:', error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  app.get("/api/likes/received", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const likes = await storage.getUserLikes(userId);
      
      // Return likes with safe public user data
      const safeLikes = likes.map(like => ({
        ...like,
        likerUser: toPublicUser(like.likerUser)
      }));

      res.json(safeLikes);
    } catch (error) {
      console.error('Error fetching likes:', error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.get("/api/likes/count", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const count = await storage.getLikesCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching likes count:', error);
      res.status(500).json({ message: "Failed to fetch likes count" });
    }
  });

  // Chat consent routes
  app.get("/api/consent/:userId", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { userId } = req.params;
      
      // First check if there's a consent where WE are the RESPONDER (someone sent us a request)
      // This means: requesterId = userId (the other person), responderId = current user
      const incomingConsent = await storage.getChatConsent(userId, req.user!.id);
      
      if (incomingConsent && 
          incomingConsent.status === 'pending' && 
          incomingConsent.requesterId === userId && 
          incomingConsent.responderId === req.user!.id) {
        // We are the responder - return with requester info for Accept/Reject UI
        const requester = await storage.getUser(incomingConsent.requesterId);
        console.log('[Consent API] Found incoming pending consent - current user is responder', {
          consentId: incomingConsent.id,
          requesterId: incomingConsent.requesterId,
          responderId: incomingConsent.responderId
        });
        res.json({ 
          status: 'pending', 
          allowed: false,
          consent: incomingConsent, 
          requester 
        });
        return;
      }
      
      // Otherwise, check general permission (could be requester, accepted, rejected, or no consent)
      const permission = await storage.checkChatPermission(req.user!.id, userId);
      console.log('[Consent API] General permission check:', {
        currentUser: req.user!.id,
        otherUser: userId,
        permission
      });
      
      // If we're the requester and status is pending, return that we're waiting
      if (permission.status === 'pending' && permission.consent && 
          permission.consent.requesterId === req.user!.id) {
        res.json({ 
          status: 'waiting',
          allowed: false, 
          consent: permission.consent 
        });
        return;
      }
      
      // For no_consent, return null status to allow first message
      if (permission.status === 'no_consent') {
        res.json({ status: null, allowed: true });
        return;
      }
      
      res.json(permission);
    } catch (error) {
      console.error('[Consent API] Error:', error);
      res.status(500).json({ message: "Failed to check consent status" });
    }
  });

  app.post("/api/consent/accept", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { consentId, requesterId } = req.body;
      
      if (!consentId) {
        return res.status(400).json({ message: "Consent ID is required" });
      }
      
      const updatedConsent = await storage.updateConsentStatus(consentId, 'accepted');
      
      // Notify the requester via WebSocket
      const requesterConnection = connectedUsers.get(requesterId);
      if (requesterConnection && requesterConnection.ws.readyState === WebSocket.OPEN) {
        requesterConnection.ws.send(JSON.stringify({
          type: 'consentAccepted',
          responderId: req.user!.id,
          consent: updatedConsent,
        }));
      }
      
      res.json({ consent: updatedConsent });
    } catch (error) {
      console.error('Accept consent error:', error);
      res.status(500).json({ message: "Failed to accept consent" });
    }
  });

  app.post("/api/consent/reject", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { consentId, requesterId } = req.body;
      
      if (!consentId) {
        return res.status(400).json({ message: "Consent ID is required" });
      }
      
      const updatedConsent = await storage.updateConsentStatus(consentId, 'rejected');
      
      // Notify the requester via WebSocket
      const requesterConnection = connectedUsers.get(requesterId);
      if (requesterConnection && requesterConnection.ws.readyState === WebSocket.OPEN) {
        requesterConnection.ws.send(JSON.stringify({
          type: 'consentRejected',
          responderId: req.user!.id,
          consent: updatedConsent,
        }));
      }
      
      res.json({ consent: updatedConsent });
    } catch (error) {
      console.error('Reject consent error:', error);
      res.status(500).json({ message: "Failed to reject consent" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedUsers = new Map<string, { ws: WebSocket; userId: string }>();
  const activeChatWindows = new Map<string, Set<string>>(); // userId -> Set of otherUserIds they have chat windows open with
  
  function broadcastToAll(message: any) {
    connectedUsers.forEach(({ ws }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  function sendToUser(userId: string, message: any) {
    const userConnection = connectedUsers.get(userId);
    if (userConnection && userConnection.ws.readyState === WebSocket.OPEN) {
      userConnection.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Logout route - placed here to access connectedUsers
  app.post("/api/logout", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id.toString();
    
    // Close WebSocket connection if exists
    const userConnection = connectedUsers.get(userId);
    if (userConnection) {
      userConnection.ws.close();
      connectedUsers.delete(userId);
      
      // Clear all active chat windows for this user during logout
      activeChatWindows.delete(userId);
      
      await storage.setUserOnlineStatus(userId, false);
      
      // Broadcast user offline status
      broadcastToAll({
        type: 'userOffline',
        userId,
      });
    }
    
    // Logout from session
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Support/Feedback route
  app.post("/api/support/send", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { firstName, lastName, email, message } = req.body;

      // Validate input
      if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate message length
      if (message.trim().length === 0) {
        return res.status(400).json({ message: "Message cannot be empty" });
      }

      if (message.length > 2000) {
        return res.status(400).json({ message: "Message is too long (max 2000 characters)" });
      }

      // Sanitize input (basic sanitization)
      const sanitizedMessage = message.trim();
      const sanitizedFirstName = firstName.trim();
      const sanitizedLastName = lastName.trim();
      const sanitizedEmail = email.trim();

      // Verify the email matches the authenticated user's email
      if (sanitizedEmail !== req.user!.email) {
        return res.status(403).json({ message: "Email mismatch" });
      }

      // Send support email
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

  // Account Deletion: Request deletion code
  app.post("/api/account/request-delete", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }

      const sanitizedEmail = email.trim().toLowerCase();

      const user = await storage.getUserByEmail(sanitizedEmail);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }

      await storage.cleanupExpiredDeletionCodes();

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

  // Account Deletion: Verify code and delete account
  app.post("/api/account/verify-delete", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;

      if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
        return res.status(400).json({ message: "Email and verification code are required" });
      }

      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedCode = code.trim();

      const isValid = await storage.verifyAccountDeletionCode(sanitizedEmail, sanitizedCode);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      await storage.deleteAllUserData(sanitizedEmail);

      // Send success response FIRST (while session still exists)
      res.json({ 
        success: true, 
        message: "Your account and all associated data have been permanently deleted" 
      });

      // THEN destroy the session asynchronously to prevent "Failed to deserialize" errors
      // This happens after the response is sent, so it won't affect the client
      setImmediate(() => {
        if (req.session) {
          req.logout((err) => {
            if (err) {
              console.error("Error logging out after account deletion:", err);
            }
            
            if (req.session) {
              req.session.destroy((err) => {
                if (err) {
                  console.error("Error destroying session after account deletion:", err);
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

  wss.on('connection', async (ws: WebSocket, req: Request) => {
    let userId: string | null = null;
    
    // Secure WebSocket authentication: verify session instead of trusting client
    try {
      const cookies = parseCookie(req.headers.cookie || '');
      const sessionId = cookies['connect.sid'];
      
      if (!sessionId) {
        console.log('WebSocket connection rejected: no session cookie');
        ws.close(1008, 'Authentication required');
        return;
      }
      
      // Extract session ID from signed cookie (remove 's:' prefix and signature)
      const actualSessionId = sessionId.startsWith('s:') ? sessionId.slice(2).split('.')[0] : sessionId;
      
      // Get session from store
      const sessionData = await new Promise<any>((resolve, reject) => {
        storage.sessionStore.get(actualSessionId, (err: any, session: any) => {
          if (err) reject(err);
          else resolve(session);
        });
      });
      
      if (!sessionData || !sessionData.passport?.user) {
        console.log('WebSocket connection rejected: invalid or unauthenticated session');
        ws.close(1008, 'Authentication required');
        return;
      }
      
      // Get user ID from authenticated session - now guaranteed to be string
      const authenticatedUserId = sessionData.passport.user as string;
      userId = authenticatedUserId;
      const user = await storage.getUser(authenticatedUserId);
      
      if (!user) {
        console.log('WebSocket connection rejected: user not found');
        ws.close(1008, 'User not found');
        return;
      }
      
      // Successfully authenticated - set up connection
      connectedUsers.set(authenticatedUserId, { ws, userId: authenticatedUserId });
      await storage.setUserOnlineStatus(authenticatedUserId, true);
      
      console.log(`User ${user.username} (${userId}) connected via WebSocket`);
      
      // Broadcast user online status
      broadcastToAll({
        type: 'userOnline',
        userId,
      });
      
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1011, 'Authentication failed');
      return;
    }

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          // Remove the vulnerable 'auth' case - authentication now happens on connection
            
          case 'openChatWindow':
            if (!userId) return;
            
            const { otherUserId: openUserId } = message;
            if (!activeChatWindows.has(userId)) {
              activeChatWindows.set(userId, new Set());
            }
            activeChatWindows.get(userId)!.add(openUserId);
            console.log(`User ${userId} opened chat window with ${openUserId}`);
            
            // Get the conversation to mark messages as read
            const openConversation = await storage.getConversation(userId, openUserId);
            if (openConversation) {
              // Mark all messages in this conversation as read (for the current user)
              await storage.markMessagesAsReadInConversation(openConversation.id, userId);
            }
            
            // Mark all message notifications from this user as read
            await storage.markMessageNotificationsAsReadFromUser(userId, openUserId);
            
            // Notify the user to update their message counter in real-time
            sendToUser(userId, {
              type: 'messageNotificationsRead',
              fromUserId: openUserId,
            });
            break;
            
          case 'closeChatWindow':
            if (!userId) return;
            
            const { otherUserId: closeUserId } = message;
            if (activeChatWindows.has(userId)) {
              activeChatWindows.get(userId)!.delete(closeUserId);
              if (activeChatWindows.get(userId)!.size === 0) {
                activeChatWindows.delete(userId);
              }
            }
            console.log(`User ${userId} closed chat window with ${closeUserId}`);
            break;
            
          case 'sendMessage':
            if (!userId) return;
            
            const { receiverId, content, imageUrl } = message;
            console.log(`[WebSocket] sendMessage from ${userId} to ${receiverId}, content: "${content}"`);
            
            // Check chat permission
            const permission = await storage.checkChatPermission(userId, receiverId);
            console.log(`[WebSocket] Chat permission check:`, permission);
            
            // If consent is rejected, block message
            if (permission.status === 'rejected') {
              ws.send(JSON.stringify({
                type: 'consentRejected',
                receiverId,
                message: 'Chat request declined',
              }));
              return;
            }
            
            // If consent is pending, block message
            if (permission.status === 'pending') {
              ws.send(JSON.stringify({
                type: 'consentPending',
                receiverId,
                message: 'Waiting for consent',
              }));
              return;
            }
            
            // At this point, either no_consent (first message) or accepted (approved chat)
            // Get or create conversation
            let conversation = await storage.getConversation(userId, receiverId);
            if (!conversation) {
              conversation = await storage.createConversation({
                participant1Id: userId,
                participant2Id: receiverId,
              });
            }
            
            // Create and save the message
            const newMessage = await storage.createMessage({
              conversationId: conversation.id,
              senderId: userId,
              content,
              imageUrl,
            });
            
            // Send message to receiver if online
            const receiverConnection = connectedUsers.get(receiverId);
            const senderUser = await storage.getUser(userId);
            if (receiverConnection && receiverConnection.ws.readyState === WebSocket.OPEN) {
              receiverConnection.ws.send(JSON.stringify({
                type: 'newMessage',
                message: newMessage,
                sender: senderUser ? toPublicUser(senderUser) : null,
              }));
            }
            
            // Confirm to sender
            ws.send(JSON.stringify({
              type: 'messageConfirmed',
              message: newMessage,
            }));
            
            // If no consent exists (first message), create consent request
            if (permission.status === 'no_consent') {
              console.log(`[WebSocket] Creating consent: requester=${userId}, responder=${receiverId}`);
              console.log(`[WebSocket] Connected users count: ${connectedUsers.size}`);
              console.log(`[WebSocket] Connected user IDs:`, Array.from(connectedUsers.keys()));
              
              const newConsent = await storage.createChatConsent({
                requesterId: userId,
                responderId: receiverId,
              });
              console.log(`[WebSocket] Consent created:`, newConsent);
              
              // Re-fetch receiver connection to ensure we have the latest state
              const freshReceiverConnection = connectedUsers.get(receiverId);
              console.log(`[WebSocket] Receiver ${receiverId} connection status:`, {
                exists: !!freshReceiverConnection,
                wsState: freshReceiverConnection?.ws.readyState,
                senderUserExists: !!senderUser,
              });
              
              // Send consent request to receiver
              if (freshReceiverConnection && freshReceiverConnection.ws.readyState === WebSocket.OPEN && senderUser) {
                console.log(`[WebSocket] ✅ Sending consentRequest to receiver ${receiverId}`);
                freshReceiverConnection.ws.send(JSON.stringify({
                  type: 'consentRequest',
                  consent: newConsent,
                  requester: toPublicUser(senderUser),
                  firstMessage: newMessage,
                }));
                console.log(`[WebSocket] ✅ consentRequest sent successfully to ${receiverId}`);
              } else {
                console.log(`[WebSocket] ❌ Cannot send to receiver ${receiverId}:`, {
                  receiverConnected: !!freshReceiverConnection,
                  wsReady: freshReceiverConnection?.ws.readyState === WebSocket.OPEN,
                  senderUserExists: !!senderUser,
                });
              }
              
              // Send pending status to sender (disable input)
              console.log(`[WebSocket] Sending consentPending to sender ${userId}`);
              ws.send(JSON.stringify({
                type: 'consentPending',
                receiverId,
                message: 'Waiting for consent',
              }));
              return;
            }
            
            // If we get here, consent is accepted - handle notifications
            // Check if both users have the chat window open (actively chatting)
            const senderHasChatOpen = activeChatWindows.has(userId) && activeChatWindows.get(userId)!.has(receiverId);
            const receiverHasChatOpen = activeChatWindows.has(receiverId) && activeChatWindows.get(receiverId)!.has(userId);
            const bothActivelyChatting = senderHasChatOpen && receiverHasChatOpen;
            
            // Only create notification if they're NOT both actively chatting
            if (!bothActivelyChatting) {
              try {
                // Check if notification already exists from this user in this conversation
                const existingNotification = await storage.findExistingNotification(
                  receiverId,
                  userId,
                  "message_received",
                  conversation.id
                );
                
                let notification;
                if (existingNotification) {
                  // Update timestamp and mark as unread if it was read
                  notification = await storage.updateNotificationTimestamp(existingNotification.id);
                } else {
                  // Create new notification
                  notification = await storage.createNotification({
                    userId: receiverId,
                    type: "message_received",
                    fromUserId: userId,
                    conversationId: conversation.id,
                  });
                }
                
                // Send real-time notification to receiver if they're online
                if (senderUser && receiverConnection && receiverConnection.ws.readyState === WebSocket.OPEN) {
                  receiverConnection.ws.send(JSON.stringify({
                    type: 'newNotification',
                    notification: {
                      id: notification.id,
                      type: 'message_received',
                      fromUserId: userId,
                      fromUserName: senderUser.firstName,
                      fromUserPhoto: senderUser.profilePhoto,
                      message: `${senderUser.firstName} sent you a message.`,
                      createdAt: notification.createdAt
                    }
                  }));
                  
                  // Also send a dedicated event for message counter update
                  receiverConnection.ws.send(JSON.stringify({
                    type: 'messageCountUpdate',
                    action: 'increment'
                  }));
                }
              } catch (notificationError) {
                console.error('Failed to create message notification:', notificationError);
              }
            }
            break;
            
          case 'typing':
            if (!userId) return;
            
            const { receiverId: typingReceiverId, isTyping } = message;
            const typingReceiverConnection = connectedUsers.get(typingReceiverId);
            
            if (typingReceiverConnection && typingReceiverConnection.ws.readyState === WebSocket.OPEN) {
              typingReceiverConnection.ws.send(JSON.stringify({
                type: 'userTyping',
                userId,
                isTyping,
              }));
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (userId) {
        connectedUsers.delete(userId);
        await storage.setUserOnlineStatus(userId, false);
        
        // Clear all active chat windows for this user
        activeChatWindows.delete(userId);
        
        console.log(`User ${userId} disconnected from WebSocket`);
        
        // Broadcast user offline status
        broadcastToAll({
          type: 'userOffline',
          userId,
        });
      }
    });
  });

  // Subscribe to newsletter
  app.post("/api/subscribe", async (req: Request, res: Response) => {
    try {
      const result = insertSubscriberSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: result.error.errors[0]?.message || "Invalid email address" 
        });
      }

      const { email } = result.data;

      // Check if email already exists
      const existingSubscriber = await storage.getSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(400).json({ 
          message: "You're already subscribed to our newsletter!" 
        });
      }

      // Add subscriber
      const subscriber = await storage.addSubscriber(email);
      
      // Send welcome email with unsubscribe link
      try {
        await sendSubscribeEmail(email, subscriber.unsubscribeToken);
      } catch (emailError) {
        console.error('Failed to send subscribe email:', emailError);
      }
      
      res.status(201).json({ 
        message: "Successfully subscribed! Check your email for a welcome message." 
      });
    } catch (error: any) {
      console.error('Error subscribing:', error);
      
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({ 
          message: "You're already subscribed to our newsletter!" 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to subscribe. Please try again later." 
      });
    }
  });

  // Unsubscribe from newsletter
  app.get("/api/unsubscribe", async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string;
      
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

      // Check if subscriber exists
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

      // Delete subscriber
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
            <div class="icon">✓</div>
            <h1>Successfully Unsubscribed</h1>
            <p>You've been unsubscribed from the SpreadLov newsletter.</p>
            <p class="email">${subscriber.email}</p>
            <p style="font-size: 14px; color: #6b7280;">We're sorry to see you go. You can always resubscribe anytime!</p>
            <a href="https://spreadlov.com">Return to SpreadLov</a>
          </div>
        </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
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

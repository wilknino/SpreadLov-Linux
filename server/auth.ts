import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } from "./email";

// Helper to convert user to safe public profile (same as in routes.ts)
function toPublicUser(user: SelectUser) {
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

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Extend session to include pendingUser
declare module 'express-session' {
  interface SessionData {
    pendingUser?: {
      username: string;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      gender: string;
      age: number;
      location?: string;
      bio?: string;
      photos?: string[];
      verificationCode: string;
      verificationCodeExpiry: Date;
      lastCodeSentAt: Date;
    };
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      
      // Allow login even if email is not verified (banner will show)
      return done(null, user);
    }),
  );

  // Google OAuth Strategy (only if credentials are provided)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_REDIRECT_URI || "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists by Google ID
          let user = await storage.getUserByGoogleId(profile.id);

          if (user) {
            // User exists, log them in
            return done(null, user);
          }

          // Check if user exists by email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await storage.getUserByEmail(email);
            
            if (user) {
              // Email exists, link Google account
              user = await storage.updateUser(user.id, {
                googleId: profile.id,
                authProvider: "google",
                emailVerified: true, // Google accounts are pre-verified
              });
              return done(null, user);
            }
          }

          // Create new user from Google profile
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          // Generate username from email
          const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          let username = baseUsername;
          let counter = 1;
          
          // Ensure unique username
          while (await storage.getUserByUsername(username)) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          const newUser = await storage.createUser({
            username,
            email,
            password: undefined as any, // No password for Google users
            firstName: profile.name?.givenName || "User",
            lastName: profile.name?.familyName || "",
            gender: "prefer_not_to_say",
            age: 18, // Default age, user can update later
            profilePhoto: profile.photos?.[0]?.value,
            googleId: profile.id,
            authProvider: "google",
            emailVerified: true, // Google accounts are pre-verified
          } as any);

          return done(null, newUser);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate username and email don't already exist
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }

      // Prepare user data
      const hashedPassword = await hashPassword(req.body.password);
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user immediately in database with emailVerified=false
      // NOTE: Verification email will be sent when user clicks the verification banner
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        emailVerified: false,
        verificationCode: code,
        verificationCodeExpiry: expiry,
        lastCodeSentAt: null, // Email not sent yet
      });

      // Log user in automatically after registration
      req.login(user, (err) => {
        if (err) {
          console.error('Login error after registration:', err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        
        // Return user data - they are now logged in but unverified
        res.status(201).json(toPublicUser(user));
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || "Failed to register user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        // Invalid credentials
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Log the user in (even if not verified - banner will show)
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        res.status(200).json(toPublicUser(user));
      });
    })(req, res, next);
  });


  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(toPublicUser(req.user!));
  });

  // Email verification endpoints
  app.post("/api/verify-email", async (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    try {
      // User must be logged in to verify
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Please login to verify your email" });
      }

      const user = req.user as SelectUser;

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ 
          success: false, 
          message: "Email is already verified" 
        });
      }

      // Verify the code
      const now = new Date();
      const isCodeValid = user.verificationCode === code && 
                         user.verificationCodeExpiry && 
                         new Date(user.verificationCodeExpiry) > now;
      
      if (!isCodeValid) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid or expired verification code" 
        });
      }

      // Code is valid - Update user to verified
      const updatedUser = await storage.updateUserVerification(user.id, true);

      // Update session with verified user
      req.login(updatedUser, (err) => {
        if (err) {
          console.error('Session update error after verification:', err);
        }
      });

      res.json({ 
        success: true, 
        message: "Email verified successfully",
        user: toPublicUser(updatedUser)
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post("/api/resend-verification", async (req, res) => {
    try {
      // User must be logged in
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Please login to resend verification code" });
      }

      const user = req.user as SelectUser;

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Check rate limit (1 minute between resends)
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const lastSent = user.lastCodeSentAt ? new Date(user.lastCodeSentAt) : new Date(0);
      
      if (lastSent > oneMinuteAgo) {
        const timeLeft = Math.ceil((60000 - (now.getTime() - lastSent.getTime())) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${timeLeft} seconds before requesting a new code`,
          timeLeft 
        });
      }

      // Generate and send new verification code
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);

      // Update user with new code
      await storage.updateUserVerificationCode(user.id, code, expiry);

      // Send verification email
      try {
        await sendVerificationEmail(user.email, code, user.firstName);
      } catch (emailError: any) {
        console.error('Failed to send verification email:', emailError.message);
        return res.status(500).json({ 
          message: "Failed to send verification email. Please try again later." 
        });
      }

      res.json({ 
        success: true, 
        message: "Verification code sent successfully" 
      });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: error.message || "Failed to resend verification code" });
    }
  });

  // Auto-send verification code (called when user clicks banner)
  app.post("/api/auto-send-verification", async (req, res) => {
    try {
      // User must be logged in
      if (!req.isAuthenticated() || !req.user) {
        console.log('Auto-send: User not authenticated');
        return res.status(401).json({ message: "Please login first" });
      }

      const user = req.user as SelectUser;
      console.log(`Auto-send verification for user: ${user.email} (ID: ${user.id})`);

      // Check if already verified
      if (user.emailVerified) {
        console.log('Auto-send: User already verified');
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Check if code was recently sent (within last minute)
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const lastSent = user.lastCodeSentAt ? new Date(user.lastCodeSentAt) : new Date(0);
      
      console.log(`Auto-send: Last code sent at: ${lastSent}, One minute ago: ${oneMinuteAgo}`);
      
      if (lastSent > oneMinuteAgo) {
        // Code was recently sent, don't send again
        console.log('Auto-send: Code already sent recently, skipping');
        return res.json({ 
          success: true, 
          message: "Code already sent recently",
          alreadySent: true 
        });
      }

      // Generate and send new verification code
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);

      console.log(`Auto-send: Generating new code: ${code} (expires: ${expiry})`);

      // Update user with new code
      await storage.updateUserVerificationCode(user.id, code, expiry);
      console.log('Auto-send: Updated user verification code in database');

      // Send verification email
      try {
        console.log(`Auto-send: Attempting to send email to ${user.email}...`);
        await sendVerificationEmail(user.email, code, user.firstName);
        console.log(`Auto-send: ✅ Email sent successfully to ${user.email}`);
      } catch (emailError: any) {
        console.error('Auto-send: ❌ Failed to send verification email:', emailError);
        console.error('Auto-send: Error details:', emailError.message);
        return res.status(500).json({ 
          message: "Failed to send verification email. Please try again later." 
        });
      }

      res.json({ 
        success: true, 
        message: "Verification code sent successfully" 
      });
    } catch (error: any) {
      console.error('Auto-send verification error:', error);
      res.status(500).json({ message: error.message || "Failed to send verification code" });
    }
  });

  // Forgot password - request reset code
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if email exists
      const user = await storage.getUserByEmail(email);
      
      // Always return success (security best practice - don't reveal if email exists)
      // But only send email if user exists AND rate limit allows
      if (user) {
        // Check rate limit (1 minute between requests)
        const canRequest = await storage.canRequestPasswordReset(email);
        
        // If rate limited, silently skip sending email but still return success
        // This prevents revealing account existence via differential responses
        if (canRequest) {
          // Generate and store reset code
          const code = generateVerificationCode();
          const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          
          await storage.setPasswordResetCode(email, code, expiry);

          // Send password reset email
          try {
            await sendPasswordResetEmail(user.email, code, user.firstName);
          } catch (emailError: any) {
            console.error('Failed to send password reset email:', emailError);
            // Even on email failure, return success to prevent email enumeration
            // Log the error but don't expose it to the user
          }
        }
        // If rate limited, we silently do nothing but still return success below
      }

      // Always return the same success message regardless of:
      // - Whether email exists
      // - Whether rate limit was hit
      // - Whether email was actually sent
      res.json({ 
        success: true, 
        message: "If an account with that email exists, a password reset code has been sent." 
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Reset password - verify code and update password
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ message: "Email, code, and new password are required" });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if email exists
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid reset code or email" });
      }

      // Verify the reset code
      const isCodeValid = await storage.verifyPasswordResetCode(email, code);
      
      if (!isCodeValid) {
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the password and clear reset code
      await storage.updatePassword(user.id, hashedPassword);

      res.json({ 
        success: true, 
        message: "Password reset successfully. You can now log in with your new password." 
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Google OAuth Routes (only if credentials are provided)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get(
      "/api/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
      })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/?error=google_auth_failed",
      }),
      (req, res) => {
        // Successful authentication, redirect to home page
        res.redirect("/");
      }
    );
  } else {
    // Provide disabled endpoints when Google OAuth is not configured
    app.get("/api/auth/google", (req, res) => {
      res.status(404).json({ message: "Google OAuth is not configured" });
    });

    app.get("/api/auth/google/callback", (req, res) => {
      res.status(404).json({ message: "Google OAuth is not configured" });
    });
  }
}

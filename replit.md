# SpreadLov

## Overview
SpreadLov is a social dating/connection platform designed to facilitate user interaction through profiles, real-time messaging, and notifications. The platform aims to provide a seamless and engaging experience for users looking to connect with others.

## User Preferences
I prefer iterative development with clear, concise communication. Please ask before making major architectural changes or introducing new dependencies. I value detailed explanations for complex solutions. Do not make changes to the `android/` folder unless explicitly instructed.

## System Architecture
The application uses a modern web stack with a clear separation between frontend and backend.

**Frontend:**
-   **Technology:** React 18, Vite, TypeScript, TailwindCSS
-   **Components:** Radix UI and shadcn/ui for a consistent and accessible user interface.
-   **Design:** Clean, modern aesthetic with a focus on user experience. Input fields and chat textboxes are designed for minimal visual clutter, showing focus with a single border.
-   **Features:** Profile creation, discovery filters, real-time chat interface, notification display. Profile completion modal for new Google OAuth users ensures essential information is captured.

**Backend:**
-   **Technology:** Express.js, TypeScript
-   **Database:** PostgreSQL with Drizzle ORM for type-safe database interactions.
-   **Real-time:** Socket.io for live messaging and notifications.
-   **Authentication:** Passport.js supporting local email/password and Google OAuth. Email verification and password reset are included.
-   **API:** RESTful API endpoints for user management, messaging, and notifications.
-   **Push Notifications:** Firebase Cloud Messaging (FCM) integration for real-time push notifications to Android devices, triggered by PostgreSQL events. Includes deep linking and invalid token cleanup. Graceful degradation is implemented if FCM is not fully configured.
-   **Android Integration:** Specific solutions for Google OAuth via Chrome Custom Tabs (replacing WebView) and managing background notifications to ensure FCM delivery by detecting when chat windows should be closed on the server.

**Shared:**
-   A `shared/` directory contains common code like the database schema and types, ensuring consistency between frontend and backend.

**Key Features:**
-   **User Authentication:** Local and Google OAuth, email verification, password reset.
-   **User Profiles:** Photos, bio, location, age, and discovery filters. Profile completion for new users.
-   **Messaging System:** Real-time chat, chat consent, image sharing, online/offline status.
-   **Notifications:** Real-time notifications for profile views and messages, with FCM push notification support for Android.

## External Dependencies
-   **Database:** PostgreSQL
-   **Real-time Communication:** Socket.io
-   **Authentication:** Passport.js (with Google OAuth provider)
-   **Email Services:** SMTP (configurable with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
-   **Push Notifications:** Firebase Cloud Messaging (FCM) via `firebase-admin` package.
-   **UI Libraries:** Radix UI, shadcn/ui

## Recent Changes

### Fresh GitHub Clone Re-Setup (October 20, 2025 @ 9:17 PM)
- ✅ Fresh clone from GitHub successfully re-imported
- ✅ All npm dependencies verified (node_modules present)
- ✅ Created .gitignore file with Node.js standard patterns
- ✅ Created .env.example file documenting all environment variables
- ✅ PostgreSQL database detected (DATABASE_URL and SESSION_SECRET configured)
- ✅ Database schema pushed to PostgreSQL using Drizzle ORM
- ✅ PostgreSQL notification trigger created for FCM push notifications
- ✅ Vite configuration verified (host: 0.0.0.0, port: 5000, allowedHosts: true)
- ✅ Workflow "Server" configured and running successfully
- ✅ Deployment configuration set up for autoscale deployment
- ✅ Application verified and fully functional with landing page
- ✅ Import completed successfully

### Complete Push Notification Implementation for All 3 Types (October 20, 2025 @ 6:30 PM)
- ✅ **Comprehensive Documentation Created**: Complete guide written in `makechange1.txt` for implementing all 3 notification types
- ✅ **Notification Types Fully Supported**:
  - Profile View notifications - "Someone viewed your profile"
  - Profile Like notifications - "Someone liked your profile"
  - Message notifications - "Someone sent you a message"
- ✅ **Backend Implementation Complete**:
  - Database schema supports all 3 notification types (profile_view, profile_like, message_received)
  - PostgreSQL trigger fires for ALL notification types automatically
  - FCM service (server/fcm-service.ts) handles all 3 types with proper titles, messages, and deep links
  - Notification listener (server/notification-listener.ts) processes all types automatically
  - API endpoints create notifications for all actions (profile views, likes, messages)
  - Android background handler (client/src/lib/android-background-handler.ts) manages chat window state
- ✅ **Android Integration Files Provided**:
  - MyFirebaseMessagingService.kt - Receives push notifications from Firebase
  - MainActivity_Updated.kt - Handles app lifecycle (background/foreground detection)
  - WebViewInterface.kt - JavaScript bridge for WebView
  - IntentUtils.kt - Helper for opening deep links
  - activity_main.xml - Layout file for MainActivity
- ✅ **Complete Setup Guide in makechange1.txt**:
  - Step-by-step Android Studio setup instructions
  - AndroidManifest.xml configuration
  - build.gradle dependencies setup
  - Firebase configuration for Replit server
  - Testing procedures for all 3 notification types
  - Comprehensive troubleshooting section
  - Technical architecture explanation
- ✅ **Backend Status**: 100% ready for all 3 notification types
- ✅ **User Action Required**: Follow makechange1.txt to set up Android app and add Firebase credentials to Replit Secrets

### Fresh GitHub Import Setup (October 20, 2025 @ 6:16 PM)
- ✅ Fresh clone successfully imported from GitHub repository
- ✅ All npm dependencies installed (762 packages)
- ✅ Created .gitignore file with Node.js standard patterns
- ✅ Created .env.example file documenting all environment variables
- ✅ PostgreSQL database already configured (DATABASE_URL and SESSION_SECRET available)
- ✅ Database schema successfully pushed to PostgreSQL using Drizzle ORM
- ✅ PostgreSQL notification trigger created for FCM push notifications
- ✅ Vite configuration verified with proper host settings for Replit proxy
- ✅ Workflow "Server" configured to run on port 5000
- ✅ Deployment configuration set up for autoscale deployment
- ✅ Application verified and fully functional
- ✅ All LSP diagnostics cleared
- ✅ Import completed successfully
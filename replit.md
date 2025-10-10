# SpreadLov

## Overview
SpreadLov is a social dating/connection platform built with React, Express, and PostgreSQL. The application allows users to create profiles, discover others, send messages in real-time, and receive notifications about profile views and messages.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Socket.io for live messaging and notifications
- **Authentication**: Passport.js (Local + Google OAuth)
- **UI Components**: Radix UI + shadcn/ui components

## Project Structure
```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   └── pages/       # Page components
│   └── public/          # Static assets
├── server/              # Backend Express server
│   ├── index.ts         # Main server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication setup
│   ├── email.ts         # Email service
│   └── db.ts            # Database connection
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema and types
└── uploads/             # User uploaded files
```

## Environment Variables
The following environment variables are set up:
- `DATABASE_URL` - PostgreSQL connection string (✓ configured)
- `SESSION_SECRET` - Session encryption key (✓ configured)
- `PORT` - Server port (defaults to 5000)

Optional variables for enhanced functionality:
- `SMTP_HOST` - Email server host (defaults to smtp-mail.outlook.com)
- `SMTP_PORT` - Email server port (defaults to 587)
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URL

## Development Setup
The application is configured to run in Replit with:
- Frontend and backend served on port 5000
- Vite dev server configured with `allowedHosts: true` for Replit proxy
- Hot module replacement (HMR) enabled
- Database schema automatically synced

## Key Features
1. **User Authentication**
   - Local authentication with email/password
   - Google OAuth integration (optional)
   - Email verification with 6-digit codes
   - Password reset functionality

2. **User Profiles**
   - Profile photos and gallery (up to 5 photos)
   - Personal information (bio, location, age)
   - Discovery filters (gender, location, age range)

3. **Messaging System**
   - Real-time chat with Socket.io
   - Chat consent system
   - Image sharing in messages
   - Online/offline status

4. **Notifications**
   - Profile view notifications
   - Message received notifications
   - Real-time updates via Socket.io

## Database Schema
- `users` - User profiles and authentication
- `conversations` - Chat conversations between users
- `messages` - Chat messages
- `notifications` - User notifications
- `chat_consents` - Chat request approvals

## Running the Application
- **Development**: `npm run dev` (already configured in workflow)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Database Push**: `npm run db:push`

## Deployment
The application is configured for Replit autoscale deployment:
- Build command: `npm run build`
- Run command: `npm start`
- Deployment type: autoscale (stateless)

## Recent Changes (October 2025)
- Imported from GitHub and configured for Replit environment
- Database schema pushed to PostgreSQL
- Vite configured with proper host settings for Replit proxy
- Workflow configured to run on port 5000
- Deployment configuration set up for autoscale
- Created .gitignore for Node.js project

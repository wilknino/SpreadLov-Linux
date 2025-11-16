import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { startNotificationListener } from "./notification-listener";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use((req, res, next) => {
  // Strict-Transport-Security header for HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Canonical URL redirect (www to non-www)
  const host = req.get('host');
  if (host && host.startsWith('www.')) {
    const protocol = req.protocol || 'https';
    const newUrl = `${protocol}://${host.substring(4)}${req.originalUrl}`;
    return res.redirect(301, newUrl);
  }
  
  next();
});

// 301 Redirects for legacy PHP URLs (SEO preservation)
app.get('*.php', (req, res) => {
  const path = req.path.toLowerCase();
  
  // Map old PHP URLs to new TypeScript routes
  const redirectMap: Record<string, string> = {
    '/index.php': '/',
    '/home.php': '/',
    '/subscribe.php': '/subscribe',
    '/subscription.php': '/subscribe',
    '/terms.php': '/terms',
    '/tos.php': '/terms',
    '/termsofservice.php': '/terms',
    '/privacy.php': '/terms',
    '/privacy_policy.php': '/terms',
    '/privacypolicy.php': '/terms',
    '/privacy-policy.php': '/terms',
    '/safety.php': '/safety-standards',
    '/safety-standards.php': '/safety-standards',
    '/login.php': '/auth',
    '/signin.php': '/auth',
    '/signup.php': '/auth',
    '/register.php': '/auth',
    '/auth.php': '/auth',
    '/discover.php': '/discover',
    '/messages.php': '/messages',
    '/chat.php': '/chat',
    '/chat3.php': '/chat',
    '/profile.php': '/profile',
    '/myprofile.php': '/profile',
    '/my-profile.php': '/profile',
    '/notifications.php': '/notifications',
    '/404.php': '/',
    '/error.php': '/',
  };
  
  const newPath = redirectMap[path] || '/';
  res.redirect(301, newPath);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start PostgreSQL notification listener for FCM push notifications
    startNotificationListener();
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR: Port ${port} is already in use.`);
      console.error(`Please either:`);
      console.error(`  1. Stop the process using port ${port}, or`);
      console.error(`  2. Set a different PORT in your .env file\n`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
})();

import { Pool } from 'pg';
import { db } from './db';
import { users, notifications } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { sendPushNotification } from './fcm-service';
import { log } from './vite';

let listenerPool: Pool | null = null;

// ✅ Helper function to convert relative photo URLs to full URLs
function getFullPhotoUrl(photoPath: string | null): string {
  if (!photoPath) return '';
  
  // If already a full URL, return as-is
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Convert relative path to full URL
  const baseUrl = process.env.BASE_URL || 'https://spreadlov.com';
  const fullUrl = photoPath.startsWith('/') 
    ? `${baseUrl}${photoPath}`
    : `${baseUrl}/${photoPath}`;
  
  log(`🔗 Converted photo URL: ${photoPath} → ${fullUrl}`);
  return fullUrl;
}

export async function startNotificationListener() {
  if (listenerPool) {
    log('⚠️  Notification listener already running');
    return;
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      log('⚠️  DATABASE_URL not configured. Notification listener will not start.');
      return;
    }

    listenerPool = new Pool({
      connectionString: databaseUrl,
    });

    const client = await listenerPool.connect();

    await client.query('LISTEN new_notification');

    log('✅ PostgreSQL notification listener started');

    client.on('notification', async (msg) => {
      if (msg.channel === 'new_notification' && msg.payload) {
        try {
          const payload = JSON.parse(msg.payload);
          const { notification_id, user_id, type, from_user_id, conversation_id } = payload;

          log(`📬 New notification received: ${type} for user ${user_id}`);

          // Get recipient user (the one receiving the notification)
          const recipientUser = await db.query.users.findFirst({
            where: eq(users.id, user_id),
          });

          // Get the user who triggered the notification
          const fromUser = await db.query.users.findFirst({
            where: eq(users.id, from_user_id),
          });

          if (!recipientUser || !recipientUser.fcmToken) {
            log(`⚠️  User ${user_id} has no FCM token registered`);
            return;
          }

          if (!fromUser) {
            log(`⚠️  From user ${from_user_id} not found`);
            return;
          }

          // Get notification details
          const notification = await db.query.notifications.findFirst({
            where: eq(notifications.id, notification_id),
          });

          // Build title and body based on notification type
          let title = 'SpreadLov';
          let body = 'You have a new notification';

          if (type === 'profile_view') {
            title = 'Profile View';
            body = `${fromUser.firstName} viewed your profile.`;
          } else if (type === 'profile_like') {
            title = 'New Like';
            body = `${fromUser.firstName} liked your profile!`;
          } else if (type === 'message_received') {
            title = 'New Message';
            body = `${fromUser.firstName} sent you a message`;
          }

          // ✅ CRITICAL FIX: Convert relative photo path to full URL
          const fullPhotoUrl = getFullPhotoUrl(fromUser.profilePhoto);

          log(`📤 Preparing to send push - From: ${fromUser.firstName} ${fromUser.lastName}, Photo: ${fullPhotoUrl}`);

          // ✅ Send push notification with FULL photo URL
          const success = await sendPushNotification(
            recipientUser.fcmToken,
            title,
            body,
            {
              type: type,
              fromUserId: from_user_id,
              fromUserName: `${fromUser.firstName} ${fromUser.lastName}`,
              fromUserPhoto: fullPhotoUrl,
              conversationId: conversation_id || notification?.conversationId || undefined,
            }
          );

          // ✅ NEW: If notification failed due to invalid token, remove it from database
          if (success === false) {
            log(`🗑️  Removing invalid FCM token for user ${user_id} (${recipientUser.firstName} ${recipientUser.lastName})`);
            
            try {
              await db
                .update(users)
                .set({ fcmToken: null })
                .where(eq(users.id, user_id));
              
              log(`✅ Successfully cleared invalid FCM token for user ${user_id}`);
            } catch (dbError) {
              log(`❌ Failed to clear FCM token from database: ${dbError}`);
            }
          }

        } catch (error) {
          log(`❌ Error processing notification: ${error}`);
        }
      }
    });

    client.on('error', (err) => {
      log(`❌ PostgreSQL listener error: ${err}`);
    });

  } catch (error) {
    log(`❌ Failed to start notification listener: ${error}`);
  }
}

export async function stopNotificationListener() {
  if (listenerPool) {
    await listenerPool.end();
    listenerPool = null;
    log('🛑 PostgreSQL notification listener stopped');
  }
}

process.on('SIGINT', async () => {
  await stopNotificationListener();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopNotificationListener();
  process.exit(0);
});
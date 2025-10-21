import { Pool } from 'pg';
import { db } from './db';
import { users, notifications } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { sendPushNotification } from './fcm-service';
import { log } from './vite';

let listenerPool: Pool | null = null;

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
          const { notification_id, user_id, type, from_user_id } = payload;

          log(`📬 New notification received: ${type} for user ${user_id}`);

          const recipientUser = await db.query.users.findFirst({
            where: eq(users.id, user_id),
          });

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

          const notification = await db.query.notifications.findFirst({
            where: eq(notifications.id, notification_id),
          });

          const fcmPayload = {
            userId: user_id,
            type: type as 'message_received' | 'profile_like' | 'profile_view',
            fromUserId: from_user_id,
            conversationId: notification?.conversationId || undefined,
            fromUserName: `${fromUser.firstName} ${fromUser.lastName}`,
            fromUserPhoto: fromUser.profilePhoto || undefined,
          };

          const success = await sendPushNotification(recipientUser.fcmToken, fcmPayload);

          if (!success) {
            await db
              .update(users)
              .set({ fcmToken: null })
              .where(eq(users.id, recipientUser.id));
            
            log(`🔄 Cleared invalid FCM token for user ${recipientUser.id}`);
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

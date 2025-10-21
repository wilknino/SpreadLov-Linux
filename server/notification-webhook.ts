import type { Request, Response } from 'express';
import { db } from './db';
import { notifications, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { sendPushNotification } from './fcm-service';
import { log } from './vite';

const WEBHOOK_SECRET = process.env.NOTIFICATION_WEBHOOK_SECRET || 'default-webhook-secret-change-in-production';

export async function handleNotificationWebhook(req: Request, res: Response) {
  try {
    const authHeader = req.headers['x-webhook-secret'];
    
    if (authHeader !== WEBHOOK_SECRET) {
      log('⚠️  Unauthorized notification webhook attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({ error: 'Missing notification_id' });
    }

    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notification_id),
      with: {
        user: true,
        fromUser: true,
      },
    });

    if (!notification) {
      log(`⚠️  Notification ${notification_id} not found`);
      return res.status(404).json({ error: 'Notification not found' });
    }

    const recipientUser = await db.query.users.findFirst({
      where: eq(users.id, notification.userId),
    });

    const fromUser = await db.query.users.findFirst({
      where: eq(users.id, notification.fromUserId),
    });

    if (!recipientUser || !recipientUser.fcmToken) {
      log(`⚠️  User ${notification.userId} has no FCM token registered`);
      return res.status(200).json({ 
        message: 'No FCM token available',
        sent: false 
      });
    }

    if (!fromUser) {
      log(`⚠️  From user ${notification.fromUserId} not found`);
      return res.status(404).json({ error: 'From user not found' });
    }

    const payload = {
      userId: notification.userId,
      type: notification.type as 'message_received' | 'profile_like' | 'profile_view',
      fromUserId: notification.fromUserId,
      conversationId: notification.conversationId || undefined,
      fromUserName: `${fromUser.firstName} ${fromUser.lastName}`,
      fromUserPhoto: fromUser.profilePhoto || undefined,
    };

    const success = await sendPushNotification(recipientUser.fcmToken, payload);

    if (!success) {
      await db
        .update(users)
        .set({ fcmToken: null })
        .where(eq(users.id, recipientUser.id));
      
      log(`🔄 Cleared invalid FCM token for user ${recipientUser.id}`);
    }

    log(`📬 Notification webhook processed: ${notification.type} for user ${notification.userId}`);

    return res.status(200).json({
      message: 'Notification processed',
      sent: success,
      type: notification.type,
    });

  } catch (error) {
    log(`❌ Error in notification webhook: ${error}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

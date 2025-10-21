import admin from 'firebase-admin';
import { log } from './vite';

let isInitialized = false;

export function initializeFirebase() {
  if (isInitialized) {
    return;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      log('⚠️  Firebase credentials not configured. FCM push notifications will be disabled.');
      log('   Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to enable.');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    isInitialized = true;
    log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    log(`❌ Failed to initialize Firebase Admin: ${error}`);
  }
}

export interface NotificationPayload {
  userId: string;
  type: 'message_received' | 'profile_like' | 'profile_view';
  fromUserId: string;
  conversationId?: string;
  fromUserName?: string;
  fromUserPhoto?: string;
}

export async function sendPushNotification(
  fcmToken: string,
  payload: NotificationPayload
): Promise<boolean> {
  if (!isInitialized) {
    log('⚠️  Firebase not initialized. Skipping push notification.');
    return false;
  }

  try {
    const { type, fromUserName, fromUserPhoto, fromUserId, conversationId } = payload;

    let title = 'SpreadLov';
    let body = 'You have a new notification';
    let deepLink = '';

    switch (type) {
      case 'message_received':
        title = 'New Message';
        body = fromUserName ? `${fromUserName} sent you a message` : 'You received a new message';
        deepLink = `/chat/${fromUserId}`;
        break;

      case 'profile_like':
        title = 'Profile Like';
        body = fromUserName ? `${fromUserName} liked your profile` : 'Someone liked your profile';
        deepLink = `/profile/${fromUserId}`;
        break;

      case 'profile_view':
        title = 'Profile View';
        body = fromUserName ? `${fromUserName} viewed your profile` : 'Someone viewed your profile';
        deepLink = `/profile/${fromUserId}`;
        break;
    }

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title,
        body,
        imageUrl: fromUserPhoto,
      },
      data: {
        type,
        fromUserId,
        deepLink,
        conversationId: conversationId || '',
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          channelId: 'spreadlov_notifications',
        },
      },
    };

    const response = await admin.messaging().send(message);
    log(`✅ Push notification sent successfully: ${response}`);
    return true;
  } catch (error: any) {
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      log(`⚠️  Invalid or expired FCM token for user ${payload.userId}`);
      return false;
    }
    log(`❌ Error sending push notification:`, error);
    return false;
  }
}

export async function sendBulkPushNotifications(
  tokens: string[],
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  if (!isInitialized || tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const results = await Promise.allSettled(
    tokens.map(token => sendPushNotification(token, payload))
  );

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const failureCount = results.length - successCount;

  log(`📊 Bulk notification result: ${successCount} sent, ${failureCount} failed`);
  return { successCount, failureCount };
}

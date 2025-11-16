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

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: {
    type: string;
    fromUserId: string;
    fromUserName?: string;
    fromUserPhoto?: string;
    conversationId?: string;
  }
): Promise<boolean> {  // ✅ Changed from Promise<void> to Promise<boolean>
  if (!isInitialized) {
    log('⚠️  Firebase not initialized. Skipping push notification.');
    return false;  // ✅ Return false instead of void
  }

  try {
  // Build deep link based on notification type
let deepLink = '/';
if (data?.type === 'profile_view' || data?.type === 'profile_like') {
  deepLink = `/profile/${data.fromUserId}`;
} else if (data?.type === 'message_received' && data?.fromUserId) {
  deepLink = `/chat/${data.fromUserId}`;  // ✅ FIXED - using fromUserId instead
}

    log(`📤 Sending FCM notification - Type: ${data?.type}, User: ${data?.fromUserName}, Photo: ${data?.fromUserPhoto}, ConversationId: ${data?.conversationId}`);

    // ✅ CRITICAL FIX: Send DATA-ONLY message (no "notification" field)
    // This ensures onMessageReceived() is ALWAYS called, even when app is in background
    const message: admin.messaging.Message = {
      token: fcmToken,
      // ❌ REMOVED: notification field (system would auto-display without our custom handling)
      data: {
        title: title,  // ✅ Move title to data
        body: body,    // ✅ Move body to data
        type: data?.type || 'notification',
        fromUserId: data?.fromUserId || '',
        fromUserName: data?.fromUserName || '',
        fromUserPhoto: data?.fromUserPhoto || '',  // ✅ This will now be used!
        conversationId: data?.conversationId || '',  // ✅ Now included!
        deep_link: deepLink,
        click_action: deepLink,
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1,  // Ensure iOS also triggers onMessageReceived
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    log(`✅ Push notification sent successfully: ${response}`);
    return true;  // ✅ Added return true on success
  } catch (error: any) {
    log(`❌ Error sending push notification: ${error.message}`);
    
    // ✅ EXPANDED: Check for ALL invalid token scenarios
    const invalidTokenErrors = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument',
    ];
    
    const isInvalidToken = 
      invalidTokenErrors.some(code => error.code === code) ||
      error.message?.includes('not found') ||  // ✅ Catches "Requested entity was not found"
      error.message?.includes('registration token') ||
      error.message?.includes('Requested entity');
    
    if (isInvalidToken) {
      log('🗑️  Invalid FCM token detected - will be removed by webhook handler');
    }
    
    return false;  // ✅ This triggers token removal in notification-webhook.ts
  }
}
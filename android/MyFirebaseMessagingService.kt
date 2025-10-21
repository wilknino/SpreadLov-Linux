// File: app/src/main/java/com/spreadlov/app/util/MyFirebaseMessagingService.kt
package com.spreadlov.app.util

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.spreadlov.app.MainActivity
import com.spreadlov.app.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "FCMService"
        private const val CHANNEL_ID = "spreadlov_notifications"
        private const val CHANNEL_NAME = "SpreadLov Notifications"
        private const val API_BASE_URL = "https://spreadlov.com"
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token generated: $token")

        // Send token to backend server
        sendTokenToServer(token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        Log.d(TAG, "Message received from: ${message.from}")

        // Handle notification payload
        message.notification?.let { notification ->
            val title = notification.title ?: "SpreadLov"
            val body = notification.body ?: "You have a new notification"
            val clickAction = message.data["click_action"] ?: ""

            showNotification(title, body, clickAction)
        }

        // Handle data payload
        if (message.data.isNotEmpty()) {
            Log.d(TAG, "Message data: ${message.data}")
            handleDataPayload(message.data)
        }
    }

    private fun sendTokenToServer(token: String) {
        // Get stored session cookie
        val sharedPrefs = getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
        val sessionCookie = sharedPrefs.getString("session_cookie", null)

        if (sessionCookie.isNullOrEmpty()) {
            Log.w(TAG, "No session cookie found, will retry token registration after login")
            // Store token locally to send after login
            sharedPrefs.edit().putString("pending_fcm_token", token).apply()
            return
        }

        // Send token to backend API
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()
                val json = JSONObject().apply {
                    put("fcmToken", token)
                }

                val requestBody = json.toString()
                    .toRequestBody("application/json; charset=utf-8".toMediaType())

                val request = Request.Builder()
                    .url("$API_BASE_URL/api/user/fcm-token")
                    .post(requestBody)
                    .addHeader("Cookie", sessionCookie)
                    .build()

                val response = client.newCall(request).execute()

                if (response.isSuccessful) {
                    Log.d(TAG, "FCM token registered successfully with backend")
                    // Clear pending token
                    sharedPrefs.edit().remove("pending_fcm_token").apply()
                } else {
                    Log.e(TAG, "Failed to register FCM token: ${response.code} - ${response.message}")
                    // Keep pending token for retry
                    sharedPrefs.edit().putString("pending_fcm_token", token).apply()
                }

                response.close()
            } catch (e: IOException) {
                Log.e(TAG, "Error sending FCM token to server", e)
                // Keep pending token for retry
                sharedPrefs.edit().putString("pending_fcm_token", token).apply()
            }
        }
    }

    private fun handleDataPayload(data: Map<String, String>) {
        val type = data["type"] ?: ""
        val fromUserId = data["fromUserId"] ?: ""
        val message = data["message"] ?: ""
        val clickAction = data["click_action"] ?: ""

        // Show notification based on type
        val title = when (type) {
            "message" -> "New Message"
            "profile_like" -> "New Like"
            "profile_view" -> "Profile View"
            else -> "SpreadLov"
        }

        showNotification(title, message, clickAction)
    }

    private fun showNotification(title: String, message: String, clickAction: String) {
        createNotificationChannel()

        // Create intent for notification click
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            if (clickAction.isNotEmpty()) {
                putExtra("deep_link", clickAction)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Build notification
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setColor(resources.getColor(R.color.pink_accent, null))

        // Show notification
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for messages, likes, and profile views"
                enableLights(true)
                enableVibration(true)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}

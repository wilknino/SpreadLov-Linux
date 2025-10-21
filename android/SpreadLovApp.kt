// File: app/src/main/java/com/spreadlov/app/SpreadLovApp.kt
package com.spreadlov.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import com.google.firebase.FirebaseApp

class SpreadLovApp : Application() {

    companion object {
        private const val TAG = "SpreadLovApp"
        private const val CHANNEL_ID = "spreadlov_notifications"
        private const val CHANNEL_NAME = "SpreadLov Notifications"
    }

    override fun onCreate() {
        super.onCreate()
        
        Log.d(TAG, "🚀 SpreadLov App starting...")

        // Initialize Firebase
        try {
            FirebaseApp.initializeApp(this)
            Log.d(TAG, "✅ Firebase initialized")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Firebase initialization failed", e)
        }

        // Create notification channel for push notifications
        // This ensures background/closed notifications work
        createNotificationChannel()
    }

    /**
     * CRITICAL: Create notification channel at app startup
     * This must be done before any notification arrives in background/closed state
     */
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
                setShowBadge(true)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
            
            Log.d(TAG, "✅ Notification channel created: $CHANNEL_ID")
        } else {
            Log.d(TAG, "ℹ️ Android version < 8.0, notification channels not needed")
        }
    }
}

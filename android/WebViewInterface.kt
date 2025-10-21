// File: app/src/main/java/com/spreadlov/app/util/WebViewInterface.kt
package com.spreadlov.app.util

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class WebViewInterface(private val context: Context) {

    companion object {
        private const val TAG = "WebViewInterface"
        private const val API_BASE_URL = "https://spreadlov.com"
    }

    @JavascriptInterface
    fun storeCookie(cookie: String) {
        Log.d(TAG, "Storing session cookie from WebView")
        val sharedPrefs = context.getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
        sharedPrefs.edit().putString("session_cookie", cookie).apply()

        // Check if there's a pending FCM token to send
        val pendingToken = sharedPrefs.getString("pending_fcm_token", null)
        if (!pendingToken.isNullOrEmpty()) {
            Log.d(TAG, "Found pending FCM token, sending to backend")
            sendFCMToken(pendingToken, cookie)
        } else {
            // Get current FCM token and send
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val token = task.result
                    Log.d(TAG, "Retrieved FCM token, sending to backend")
                    sendFCMToken(token, cookie)
                } else {
                    Log.e(TAG, "Failed to get FCM token", task.exception)
                }
            }
        }
    }

    @JavascriptInterface
    fun registerFCMToken() {
        Log.d(TAG, "FCM token registration requested from WebView")
        val sharedPrefs = context.getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
        val sessionCookie = sharedPrefs.getString("session_cookie", null)

        if (sessionCookie.isNullOrEmpty()) {
            Log.w(TAG, "No session cookie available for FCM token registration")
            return
        }

        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                Log.d(TAG, "FCM Token retrieved: $token")
                sendFCMToken(token, sessionCookie)
            } else {
                Log.e(TAG, "Failed to get FCM token", task.exception)
            }
        }
    }

    @JavascriptInterface
    fun clearSession() {
        Log.d(TAG, "Clearing session data")
        val sharedPrefs = context.getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
        sharedPrefs.edit().clear().apply()
    }

    private fun sendFCMToken(token: String, sessionCookie: String) {
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
                    val responseBody = response.body?.string()
                    Log.d(TAG, "FCM token registered successfully: $responseBody")

                    // Clear pending token
                    val sharedPrefs = context.getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
                    sharedPrefs.edit().remove("pending_fcm_token").apply()
                } else {
                    Log.e(TAG, "Failed to register FCM token: ${response.code} - ${response.message}")
                }

                response.close()
            } catch (e: IOException) {
                Log.e(TAG, "Error sending FCM token to server", e)
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error sending FCM token", e)
            }
        }
    }
}

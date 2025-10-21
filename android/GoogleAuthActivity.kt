// File: app/src/main/java/com/spreadlov/app/GoogleAuthActivity.kt
// Google OAuth Authentication using Chrome Custom Tabs
package com.spreadlov.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent
import android.graphics.Color

class GoogleAuthActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "GoogleAuthActivity"
        private const val AUTH_URL = "https://spreadlov.com/api/auth/google"

        // Request codes
        const val GOOGLE_AUTH_REQUEST = 1001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Log.d(TAG, "Starting Google OAuth flow")

        // Launch Chrome Custom Tab for Google OAuth
        launchGoogleAuth()
    }

    private fun launchGoogleAuth() {
        try {
            val authUri = Uri.parse(AUTH_URL)

            // Build Custom Tab with SpreadLov branding
            val customTabsIntent = CustomTabsIntent.Builder()
                .setToolbarColor(Color.parseColor("#EC4899")) // SpreadLov pink color
                .setShowTitle(true)
                .setStartAnimations(this, android.R.anim.slide_in_left, android.R.anim.slide_out_right)
                .setExitAnimations(this, android.R.anim.slide_in_left, android.R.anim.slide_out_right)
                .build()

            // Launch Custom Tab
            customTabsIntent.launchUrl(this, authUri)

            Log.d(TAG, "Custom Tab launched for Google OAuth")

            // Note: The callback will be handled by GoogleAuthCallbackActivity
            // which will receive the redirect from the server

        } catch (e: Exception) {
            Log.e(TAG, "Error launching Google OAuth", e)
            Toast.makeText(this, "Failed to open Google sign-in", Toast.LENGTH_SHORT).show()
            setResult(RESULT_CANCELED)
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        // User returned to this activity (they closed the Custom Tab)
        // This might mean they cancelled authentication
        Log.d(TAG, "User returned to GoogleAuthActivity")
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        Log.d(TAG, "onNewIntent called")

        // Check if this is a successful OAuth callback
        handleAuthCallback(intent.data)
    }

    private fun handleAuthCallback(uri: Uri?) {
        if (uri == null) {
            Log.e(TAG, "Auth callback URI is null")
            setResult(RESULT_CANCELED)
            finish()
            return
        }

        Log.d(TAG, "Handling auth callback: $uri")

        // Check if authentication was successful
        val error = uri.getQueryParameter("error")

        if (error != null) {
            Log.e(TAG, "Authentication failed: $error")
            Toast.makeText(this, "Google sign-in failed", Toast.LENGTH_SHORT).show()
            setResult(RESULT_CANCELED)
        } else {
            Log.d(TAG, "Authentication successful")
            Toast.makeText(this, "Successfully signed in with Google", Toast.LENGTH_SHORT).show()
            setResult(RESULT_OK)
        }

        finish()
    }
}

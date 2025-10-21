// File: app/src/main/java/com/spreadlov/app/OfflineActivity.kt
package com.spreadlov.app

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.spreadlov.app.util.NetworkUtils

class OfflineActivity : AppCompatActivity() {

    private lateinit var retryButton: Button
    private lateinit var statusIcon: ImageView
    private lateinit var statusText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_offline)

        // Initialize UI elements (match IDs from XML)
        retryButton = findViewById(R.id.btn_retry)
        statusIcon = findViewById(R.id.offline_logo)   // ✅ matches XML
        statusText = findViewById(R.id.offline_message) // ✅ matches XML

        // Retry button listener
        retryButton.setOnClickListener { tryReconnect() }
    }

    override fun onResume() {
        super.onResume()
        // Try reconnect automatically when returning to this screen
        tryReconnect(auto = true)
    }

    private fun tryReconnect(auto: Boolean = false) {
        if (NetworkUtils.isNetworkAvailable(this)) {
            // Internet connection restored — navigate to main activity
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        } else if (!auto) {
            // If manually retried and still offline, update message
            statusText.text = "Still offline. Please check your internet connection."
        }
    }
}

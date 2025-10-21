// File: app/src/main/java/com/spreadlov/app/util/IntentUtils.kt
package com.spreadlov.app.util

import android.content.Context
import android.content.Intent
import android.net.Uri

object IntentUtils {

    /**
     * Opens a URL in an external browser
     */
    fun openInBrowser(context: Context, url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        context.startActivity(intent)
    }

    /**
     * Shares text content
     */
    fun shareText(context: Context, text: String, title: String = "Share") {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        context.startActivity(Intent.createChooser(intent, title))
    }

    /**
     * Shares the app link
     */
    fun shareApp(context: Context) {
        val appPackageName = context.packageName
        val shareMessage = """
            💖 Check out SpreadLov App!
            Download it here:
            https://play.google.com/store/apps/details?id=$appPackageName
        """.trimIndent()

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "SpreadLov App")
            putExtra(Intent.EXTRA_TEXT, shareMessage)
        }
        context.startActivity(Intent.createChooser(intent, "Share SpreadLov via"))
    }

    /**
     * Opens email client
     */
    fun sendEmail(context: Context, email: String, subject: String = "", body: String = "") {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:")
            putExtra(Intent.EXTRA_EMAIL, arrayOf(email))
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, body)
        }
        if (intent.resolveActivity(context.packageManager) != null) {
            context.startActivity(intent)
        }
    }
}

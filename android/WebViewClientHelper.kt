// File: app/src/main/java/com/spreadlov/app/util/WebViewClientHelper.kt
package com.spreadlov.app.util

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.util.Log
import android.webkit.*
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature

object WebViewClientHelper {

    private const val TAG = "WebViewClientHelper"
    private const val ALLOWED_DOMAIN = "spreadlov.com"

    fun setupWebView(
        webView: WebView,
        context: Context,
        onPageStarted: () -> Unit,
        onPageFinished: (url: String?) -> Unit, // ✅ Fixed: now includes URL param
        onError: (error: WebResourceError?) -> Unit, // ✅ Fixed: passes the error object
        onFileChooser: (ValueCallback<Array<Uri>>, WebChromeClient.FileChooserParams) -> Boolean
    ) {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            allowFileAccess = true
            allowContentAccess = true
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
            mediaPlaybackRequiresUserGesture = false
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false

            userAgentString = userAgentString
                .replace("; wv", "")
                .replace("Version/[0-9.]+\\s".toRegex(), "")

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                safeBrowsingEnabled = true
            }
        }

        if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) {
            WebSettingsCompat.setSafeBrowsingEnabled(webView.settings, true)
        }

        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                onPageStarted()
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                onPageFinished(url) // ✅ Pass URL
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                Log.d(TAG, "Navigating to: $url")

                return when {
                    url.contains(ALLOWED_DOMAIN) -> false
                    url.contains("accounts.google.com") -> false
                    url.contains("google.com/signin") -> false
                    url.startsWith("mailto:") || url.startsWith("tel:") ||
                            url.startsWith("whatsapp:") || url.startsWith("sms:") -> {
                        handleExternalIntent(context, url)
                        true
                    }
                    else -> {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        try {
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            Log.e(TAG, "Error opening external link: $url", e)
                        }
                        true
                    }
                }
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    Log.e(TAG, "Page error: ${error?.description}")
                    onError(error) // ✅ Pass error object
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                return if (filePathCallback != null && fileChooserParams != null) {
                    onFileChooser(filePathCallback, fileChooserParams)
                } else {
                    false
                }
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: android.os.Message?
            ): Boolean {
                val newWebView = WebView(context)
                newWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        val url = request?.url.toString()
                        return if (url.contains("accounts.google.com") || url.contains("google.com/signin")) {
                            view?.loadUrl(url)
                            false
                        } else {
                            true
                        }
                    }
                }

                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = newWebView
                resultMsg?.sendToTarget()
                return true
            }
        }
    }

    private fun handleExternalIntent(context: Context, url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to handle external intent: $url", e)
        }
    }
}

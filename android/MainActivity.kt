// File: app/src/main/java/com/spreadlov/app/MainActivity.kt
// UPDATED VERSION - Replace your existing MainActivity.kt with this
package com.spreadlov.app

import android.Manifest
import android.app.Activity
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.spreadlov.app.util.IntentUtils
import com.spreadlov.app.util.NetworkUtils
import com.spreadlov.app.util.NotificationUtils
import com.spreadlov.app.util.WebViewClientHelper
import com.spreadlov.app.util.WebViewInterface
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

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var fileChooserParams: WebChromeClient.FileChooserParams? = null

    private var backPressedTime: Long = 0
    private val backPressDelay: Long = 2000

    companion object {
        private const val TAG = "MainActivity"
        private const val WEBSITE_URL = "https://spreadlov.com"
        private const val API_BASE_URL = "https://spreadlov.com"
        private const val PERMISSION_REQUEST_CODE = 200
        private const val CHANNEL_ID = "spreadlov_notifications"
        private const val CHANNEL_NAME = "SpreadLov Notifications"
    }

    private val fileChooserLauncher: ActivityResultLauncher<Intent> =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val results = result.data?.let { intent ->
                    intent.clipData?.let { clipData ->
                        Array(clipData.itemCount) { i ->
                            clipData.getItemAt(i).uri
                        }
                    } ?: intent.data?.let { arrayOf(it) }
                }
                filePathCallback?.onReceiveValue(results)
            } else {
                filePathCallback?.onReceiveValue(null)
            }
            filePathCallback = null
        }

    private val permissionLauncher: ActivityResultLauncher<Array<String>> =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            val allGranted = permissions.values.all { it }
            if (allGranted) {
                openFileChooser()
            } else {
                Toast.makeText(this, "Storage permission required for file upload", Toast.LENGTH_SHORT).show()
                filePathCallback?.onReceiveValue(null)
                filePathCallback = null
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        setupSystemBars()

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)

        setupWindowInsets()
        setupWebView()
        setupSwipeRefresh()

        // Request notification permission
        NotificationUtils.requestNotificationPermission(this)

        // Get FCM token and register after user logs in
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                Log.d(TAG, "✅ FCM Token retrieved: $token")

                // Store token locally for later registration
                val sharedPrefs = getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
                sharedPrefs.edit().putString("pending_fcm_token", token).apply()
                
                // Try to register immediately if user is already logged in
                registerFCMToken()
            } else {
                Log.e(TAG, "❌ Failed to get FCM token", task.exception)
            }
        }

        // Check for deep link from notification
        handleDeepLink(intent)

        if (NetworkUtils.isNetworkAvailable(this)) {
            webView.loadUrl(WEBSITE_URL)
        } else {
            startActivity(Intent(this, OfflineActivity::class.java))
            finish()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent) {
        val deepLink = intent.getStringExtra("deep_link")
        if (!deepLink.isNullOrEmpty()) {
            Log.d(TAG, "📱 Handling deep link: $deepLink")
            // Load the deep link URL in WebView
            webView.loadUrl("$WEBSITE_URL$deepLink")
        }
    }


    private fun setupSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.apply {
                hide(WindowInsets.Type.statusBars())
                systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                    View.SYSTEM_UI_FLAG_FULLSCREEN
                            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    )
        }
    }

    private fun setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(swipeRefreshLayout) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(
                systemBars.left,
                0,
                systemBars.right,
                systemBars.bottom
            )
            insets
        }
    }

    private fun setupWebView() {
        // Add JavaScript interface for FCM token registration
        webView.addJavascriptInterface(WebViewInterface(this), "AndroidInterface")

        WebViewClientHelper.setupWebView(
            webView = webView,
            context = this,
            onPageStarted = {
                progressBar.visibility = ProgressBar.VISIBLE
                swipeRefreshLayout.isRefreshing = true
            },
            onPageFinished = { url ->
                progressBar.visibility = ProgressBar.GONE
                swipeRefreshLayout.isRefreshing = false

                // Extract and store session cookie after page load
                extractAndStoreCookie()

                // Inject JavaScript to handle authentication
                injectAuthenticationScript()
            },
            onError = {
                if (!NetworkUtils.isNetworkAvailable(this)) {
                    startActivity(Intent(this, OfflineActivity::class.java))
                    finish()
                }
            },
            onFileChooser = { callback, params ->
                filePathCallback = callback
                fileChooserParams = params
                checkPermissionsAndOpenFileChooser()
                true
            }
        )
    }

    private fun extractAndStoreCookie() {
        val cookieManager = CookieManager.getInstance()
        val cookies = cookieManager.getCookie(WEBSITE_URL)

        if (!cookies.isNullOrEmpty()) {
            Log.d(TAG, "🍪 Storing session cookie")
            val sharedPrefs = getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
            sharedPrefs.edit().putString("session_cookie", cookies).apply()

            // Try to register FCM token if we have one
            registerFCMToken()
        }
    }

    private fun injectAuthenticationScript() {
        // Inject JavaScript to detect login and trigger FCM token registration
        val script = """
            (function() {
                // Listen for successful login
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                    return originalFetch.apply(this, args).then(response => {
                        // Check if this is a login request
                        if (args[0].includes('/api/login') || args[0].includes('/api/register') || args[0].includes('/api/auth/google')) {
                            if (response.ok) {
                                // User logged in, trigger FCM token registration
                                setTimeout(() => {
                                    if (window.AndroidInterface) {
                                        console.log('🔥 Login detected, registering FCM token');
                                        AndroidInterface.registerFCMToken();
                                    }
                                }, 1000);
                            }
                        }
                        return response;
                    });
                };
                
                // Also check on page load if user is already authenticated
                setTimeout(() => {
                    fetch('$API_BASE_URL/api/user', { credentials: 'include' })
                        .then(response => {
                            if (response.ok && window.AndroidInterface) {
                                console.log('🔥 User authenticated, registering FCM token');
                                AndroidInterface.registerFCMToken();
                            }
                        })
                        .catch(err => console.log('Auth check failed:', err));
                }, 2000);
            })();
        """.trimIndent()

        webView.evaluateJavascript(script, null)
    }

    fun registerFCMToken() {
        val sharedPrefs = getSharedPreferences("spreadlov_prefs", Context.MODE_PRIVATE)
        val sessionCookie = sharedPrefs.getString("session_cookie", null)
        val pendingToken = sharedPrefs.getString("pending_fcm_token", null)

        if (sessionCookie.isNullOrEmpty() || pendingToken.isNullOrEmpty()) {
            Log.d(TAG, "⏳ Cannot register FCM token - missing cookie or token")
            return
        }

        Log.d(TAG, "📤 Registering FCM token with backend...")

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()
                val json = JSONObject().apply {
                    put("fcmToken", pendingToken)
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
                    Log.d(TAG, "✅ FCM token registered successfully: $responseBody")

                    // Clear pending token
                    sharedPrefs.edit().remove("pending_fcm_token").apply()

                    runOnUiThread {
                        Toast.makeText(this@MainActivity, "✅ Push notifications enabled", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Log.e(TAG, "❌ Failed to register FCM token: ${response.code} - ${response.message}")
                }

                response.close()
            } catch (e: IOException) {
                Log.e(TAG, "❌ Error sending FCM token to server", e)
            } catch (e: Exception) {
                Log.e(TAG, "❌ Unexpected error", e)
            }
        }
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setColorSchemeResources(R.color.pink_accent)

        swipeRefreshLayout.setOnChildScrollUpCallback { _, _ ->
            webView.scrollY > 0
        }

        swipeRefreshLayout.setOnRefreshListener {
            if (NetworkUtils.isNetworkAvailable(this)) {
                webView.reload()
            } else {
                swipeRefreshLayout.isRefreshing = false
                Toast.makeText(this, "No internet connection", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun checkPermissionsAndOpenFileChooser() {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO,
                Manifest.permission.CAMERA
            )
        } else {
            arrayOf(
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.CAMERA
            )
        }

        val permissionsToRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (permissionsToRequest.isEmpty()) {
            openFileChooser()
        } else {
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    private fun openFileChooser() {
        val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
        }

        try {
            fileChooserLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Cannot open file chooser", Toast.LENGTH_SHORT).show()
            filePathCallback?.onReceiveValue(null)
            filePathCallback = null
        }
    }

    override fun onPause() {
        super.onPause()
        Log.d(TAG, "📴 App going to background - closing chat windows")
        
        // Notify website that app is going to background
        webView.evaluateJavascript(
            "window.dispatchEvent(new Event('appGoingToBackground'));",
            null
        )
    }

    override fun onResume() {
        super.onResume()
        Log.d(TAG, "📱 App resuming - restoring chat windows")
        
        // Notify website that app is coming back to foreground
        webView.evaluateJavascript(
            "window.dispatchEvent(new Event('appComingToForeground'));",
            null
        )
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            if (backPressedTime + backPressDelay > System.currentTimeMillis()) {
                super.onBackPressed()
            } else {
                Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show()
            }
            backPressedTime = System.currentTimeMillis()
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        webView.restoreState(savedInstanceState)
    }
}

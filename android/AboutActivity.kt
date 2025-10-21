package com.spreadlov.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.spreadlov.app.util.IntentUtils

class AboutActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_about)

        setSupportActionBar(findViewById(R.id.toolbar))
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            setDisplayShowHomeEnabled(true)
            title = "About SpreadLov"
        }

        val versionTextView = findViewById<TextView>(R.id.tv_version)
        versionTextView.text = "Version ${BuildConfig.VERSION_NAME}"

        findViewById<Button>(R.id.btn_privacy_policy).setOnClickListener {
            openUrl("https://spreadlov.com/privacy-policy")
        }

        findViewById<Button>(R.id.btn_terms).setOnClickListener {
            openUrl("https://spreadlov.com/terms")
        }

        findViewById<Button>(R.id.btn_share_app).setOnClickListener {
            IntentUtils.shareApp(this)
        }
    }

    private fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}

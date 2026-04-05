package com.jourwigo.mobile;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final String APP_URL = "https://ais-dev-u7mk3ltdbimjizttsm5fke-226041710201.europe-west1.run.app";

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setDatabaseEnabled(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        // Handle cgeo Intent
        Intent intent = getIntent();
        if (intent != null) {
            String action = intent.getAction();
            if ("cgeo.geocaching.intent.action.GEOCACHE_DETAILS".equals(action) || 
                "cgeo.geocaching.intent.action.GEOCACHE_CONTEXT_MENU".equals(action)) {
                String geocode = intent.getStringExtra("geocode");
                if (geocode != null) {
                    webView.loadUrl(APP_URL + "?geocode=" + geocode);
                } else {
                    webView.loadUrl(APP_URL);
                }
            } else {
                webView.loadUrl(APP_URL);
            }
        } else {
            webView.loadUrl(APP_URL);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

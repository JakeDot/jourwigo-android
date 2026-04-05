package com.jourwigo.mobile;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SelfHealingAgent selfHealingAgent;

    private static final String APP_URL =
            "https://ais-dev-u7mk3ltdbimjizttsm5fke-226041710201.europe-west1.run.app";

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setDatabaseEnabled(true);

        // Register WebView with the bridge so ShellActivity can inject JS into it
        ShellBridge.register(webView);

        // SelfHealingAgent registers its own NetworkCallback internally
        selfHealingAgent = new SelfHealingAgent(this, webView);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(
                    String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request,
                                        WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    selfHealingAgent.onLoadError(request.getUrl().toString());
                }
            }
        });

        FloatingActionButton fab = findViewById(R.id.fab_shell);
        fab.setOnClickListener(v ->
                startActivity(new Intent(this, ShellActivity.class)));

        webView.loadUrl(resolveInitialUrl(getIntent()));
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // cancel() unregisters the NetworkCallback inside SelfHealingAgent
        selfHealingAgent.cancel();
        ShellBridge.unregister();
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    // ── Java 17: switch expression + pattern-matching instanceof ──────────────
    //
    // Old Java 8 style needed a cascade of if/else + explicit casts.
    // Java 17 switch expression returns a value directly — no break, no fall-through.
    // Pattern-matching instanceof binds the variable in the same expression.

    private String resolveInitialUrl(Intent intent) {
        if (intent == null) return APP_URL;

        String action = intent.getAction();
        if (action == null) return APP_URL;

        // Java 17 switch expression on String — clean, no fall-through risk
        return switch (action) {
            case "cgeo.geocaching.intent.action.GEOCACHE_DETAILS",
                 "cgeo.geocaching.intent.action.GEOCACHE_CONTEXT_MENU" -> {
                String geocode = intent.getStringExtra("geocode");
                // Java 17 pattern-matching instanceof: binds `gc` without a cast
                yield (geocode instanceof String gc && !gc.isBlank())
                        ? APP_URL + "?geocode=" + gc
                        : APP_URL;
            }
            default -> APP_URL;
        };
    }
}

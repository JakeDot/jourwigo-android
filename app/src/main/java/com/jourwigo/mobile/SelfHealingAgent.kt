package com.jourwigo.mobile

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.util.Log
import android.webkit.WebView
import kotlinx.coroutines.*
import kotlin.math.pow

/**
 * The self-healing agent. When the WebView hits a wall, this is the guy who
 * knows a guy. Monitors load errors, retries with exponential back-off, and
 * reloads the moment the network shows its face again.
 *
 * Network monitoring uses [ConnectivityManager.NetworkCallback] — the modern
 * API since API 21. The deprecated [ConnectivityManager.CONNECTIVITY_ACTION]
 * broadcast and [ConnectivityManager.getActiveNetworkInfo] are gone.
 *
 * ## Kotlin vs Java — NetworkCallback as an anonymous object
 *
 * Java:
 * ```java
 * ConnectivityManager.NetworkCallback cb = new ConnectivityManager.NetworkCallback() {
 *     @Override public void onAvailable(Network n) { reload(); }
 * };
 * ```
 *
 * Kotlin `object` expression — same thing, just less line noise:
 * ```kotlin
 * val cb = object : ConnectivityManager.NetworkCallback() {
 *     override fun onAvailable(network: Network) = reload()
 * }
 * ```
 */
class SelfHealingAgent(context: Context, private val webView: WebView) {

    companion object {
        private const val TAG             = "SelfHealingAgent"
        private const val MAX_RETRIES     = 5
        private const val INITIAL_BACKOFF = 2_000L   // ms
        private const val MULTIPLIER      = 2.0
    }

    private val cm = context.getSystemService(ConnectivityManager::class.java)
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private var retryJob: Job? = null
    private var lastFailedUrl: String? = null

    // ── Modern network callback — no deprecated broadcasts ───────────────────

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        /** Called when a suitable network becomes available. */
        override fun onAvailable(network: Network) {
            val url = lastFailedUrl ?: return
            Log.i(TAG, "Network available — reloading $url")
            retryJob?.cancel()
            retryJob = null
            // NetworkCallback runs on a binder thread; must dispatch to Main
            scope.launch { webView.loadUrl(url) }
        }
    }

    init {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        runCatching { cm?.registerNetworkCallback(request, networkCallback) }
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /** Call from the WebViewClient when a main-frame load fails. */
    fun onLoadError(url: String) {
        lastFailedUrl = url
        if (retryJob?.isActive == true) return
        Log.w(TAG, "Load error for: $url")
        retryJob = scope.launch { retryLoop(url) }
    }

    /** Call from Activity.onDestroy — cancels coroutines and unregisters callback. */
    fun cancel() {
        scope.cancel()
        runCatching { cm?.unregisterNetworkCallback(networkCallback) }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private suspend fun retryLoop(url: String) {
        repeat(MAX_RETRIES) { attempt ->
            val delayMs = (INITIAL_BACKOFF * MULTIPLIER.pow(attempt.toDouble())).toLong()
            Log.i(TAG, "Retry #${attempt + 1} — waiting ${delayMs}ms")
            delay(delayMs)

            if (isNetworkAvailable()) {
                Log.i(TAG, "Retry #${attempt + 1} — loading $url")
                webView.loadUrl(url)
                return
            }
            Log.w(TAG, "Still no network on retry #${attempt + 1}")
        }
        Log.e(TAG, "Gave up on $url after $MAX_RETRIES retries.")
    }

    private fun isNetworkAvailable(): Boolean {
        val network = cm?.activeNetwork ?: return false
        val caps    = cm.getNetworkCapabilities(network) ?: return false
        // NET_CAPABILITY_INTERNET = route to internet exists
        // NET_CAPABILITY_VALIDATED = internet is actually reachable (not captive portal)
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
               caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }
}

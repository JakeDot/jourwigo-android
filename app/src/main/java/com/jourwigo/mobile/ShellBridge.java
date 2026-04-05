package com.jourwigo.mobile;

import android.webkit.WebView;
import android.webkit.ValueCallback;

/**
 * Singleton bridge between {@link ShellActivity} and the live {@link WebView}
 * in {@link MainActivity}.
 *
 * <h3>Java 17: text blocks for inline documentation examples</h3>
 * Text blocks let you embed multi-line strings without escape hell:
 * <pre>
 *   // Old Java 8
 *   String js = "window.location.href = \"" + url + "\";";
 *
 *   // Java 17 text block
 *   String js = """
 *           window.location.href = "%s";
 *           """.formatted(url);
 * </pre>
 *
 * <h3>Kotlin equivalent of this entire class</h3>
 * <pre>
 * object ShellBridge {
 *     private var webView: WebView? = null
 *
 *     fun register(wv: WebView)  { webView = wv   }
 *     fun unregister()           { webView = null  }
 *     fun getInstance(): ShellBridge? = if (webView != null) this else null
 *
 *     fun evaluateJavascript(code: String, cb: ValueCallback&lt;String&gt;?) {
 *         webView?.evaluateJavascript(code, cb)
 *     }
 * }
 * </pre>
 * The Kotlin {@code object} handles the singleton, null-safety, and
 * thread-visibility with zero boilerplate.
 */
public class ShellBridge {

    private static volatile ShellBridge INSTANCE;
    private WebView webView;

    private ShellBridge() {}

    /** Register the live WebView. Call from {@code MainActivity.onCreate}. */
    public static void register(WebView webView) {
        if (INSTANCE == null) {
            synchronized (ShellBridge.class) {
                if (INSTANCE == null) INSTANCE = new ShellBridge();
            }
        }
        INSTANCE.webView = webView;
    }

    /** Release the WebView reference. Call from {@code MainActivity.onDestroy}. */
    public static void unregister() {
        if (INSTANCE != null) INSTANCE.webView = null;
    }

    /** Returns the bridge, or {@code null} if no WebView is registered. */
    public static ShellBridge getInstance() {
        return (INSTANCE != null && INSTANCE.webView != null) ? INSTANCE : null;
    }

    /**
     * Injects {@code jsCode} into the registered WebView.
     *
     * <p>Example using a Java 17 text block:
     * <pre>
     *   bridge.evaluateJavascript("""
     *           console.log("agent alive");
     *           document.title;
     *           """, result -> Log.d(TAG, result));
     * </pre>
     */
    public void evaluateJavascript(String jsCode, ValueCallback<String> callback) {
        if (webView != null) {
            webView.evaluateJavascript(jsCode, callback);
        }
    }
}

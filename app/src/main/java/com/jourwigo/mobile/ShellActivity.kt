package com.jourwigo.mobile

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.text.method.ScrollingMovementMethod
import android.view.MenuItem
import android.widget.Button
import android.widget.EditText
import android.widget.TabHost
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.luaj.vm2.Globals
import org.luaj.vm2.lib.jse.JsePlatform
import rikka.shizuku.Shizuku

/**
 * Four-tab shell interface: JavaScript · Lua · Termux · Shizuku.
 *
 * ## Kotlin vs Java — lifecycleScope instead of raw Thread
 *
 * Java (what we used before):
 * ```java
 * new Thread(() -> {
 *     String result = blockingCall();
 *     runOnUiThread(() -> textView.setText(result));
 * }, "worker").start();
 * ```
 *
 * Kotlin with lifecycleScope:
 * ```kotlin
 * lifecycleScope.launch {
 *     val result = withContext(Dispatchers.IO) { blockingCall() }
 *     textView.text = result   // back on Main automatically
 * }
 * ```
 * The coroutine is automatically cancelled when the Activity is destroyed.
 * No memory leaks, no "activity reference in a dead thread" crashes.
 */
class ShellActivity : AppCompatActivity() {

    companion object {
        /** Pre-populate the JS input via Intent extra. */
        const val EXTRA_JS_SNIPPET = "extra_js_snippet"
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    private lateinit var etJs: EditText
    private lateinit var etLua: EditText
    private lateinit var etTermux: EditText
    private lateinit var etShizuku: EditText
    private lateinit var tvOutput: TextView

    // ── LuaJ — globals survive across executions (stateful REPL) ─────────────

    private lateinit var luaGlobals: Globals

    // ── Shizuku listeners — stored so we can remove them in onDestroy ─────────

    private val onPermissionResult = Shizuku.OnRequestPermissionResultListener { code, result ->
        if (code == ShizukuShell.PERMISSION_REQUEST_CODE) {
            val msg = if (result == PackageManager.PERMISSION_GRANTED)
                "✓ Shizuku permission granted."
            else
                "✗ Shizuku permission denied."
            appendOutput("[Shizuku] $msg")
        }
    }

    private val onBinderReceived  = Shizuku.OnBinderReceivedListener  {
        appendOutput("[Shizuku] Service connected.")
    }
    private val onBinderDead      = Shizuku.OnBinderDeadListener      {
        appendOutput("[Shizuku] Service disconnected.")
    }

    // =========================================================================
    // Lifecycle
    // =========================================================================

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_shell)

        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            setTitle(R.string.shell_title)
        }

        bindViews()
        setupTabs()
        setupLua()
        setupShizuku()

        // Pre-fill JS tab if launched with a snippet
        intent.getStringExtra(EXTRA_JS_SNIPPET)?.let { etJs.setText(it) }
    }

    override fun onDestroy() {
        super.onDestroy()
        Shizuku.removeRequestPermissionResultListener(onPermissionResult)
        Shizuku.removeBinderReceivedListener(onBinderReceived)
        Shizuku.removeBinderDeadListener(onBinderDead)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Pattern-matching would be: if (item.itemId == android.R.id.home) finish()
        // In Kotlin we use when — cleaner than if/else chains
        return when (item.itemId) {
            android.R.id.home -> { finish(); true }
            else              -> super.onOptionsItemSelected(item)
        }
    }

    // =========================================================================
    // Setup helpers
    // =========================================================================

    private fun bindViews() {
        etJs      = findViewById(R.id.et_js_input)
        etLua     = findViewById(R.id.et_lua_input)
        etTermux  = findViewById(R.id.et_termux_input)
        etShizuku = findViewById(R.id.et_shizuku_input)
        tvOutput  = findViewById(R.id.tv_output)

        tvOutput.movementMethod = ScrollingMovementMethod()

        // Trailing-lambda syntax — the lambda is the last (and only) argument,
        // so it lives outside the parentheses. Java can't do this.
        findViewById<Button>(R.id.btn_run_js).setOnClickListener      { runJavaScript() }
        findViewById<Button>(R.id.btn_run_lua).setOnClickListener     { runLua() }
        findViewById<Button>(R.id.btn_run_termux).setOnClickListener  { runTermux() }
        findViewById<Button>(R.id.btn_run_shizuku).setOnClickListener { runShizuku() }
        findViewById<Button>(R.id.btn_shizuku_request).setOnClickListener {
            ShizukuShell.requestPermission()
        }
        findViewById<Button>(R.id.btn_clear_output).setOnClickListener { tvOutput.text = "" }
    }

    private fun setupTabs() {
        val host = findViewById<TabHost>(R.id.tab_host).also { it.setup() }
        // 'also' runs a block with the receiver as 'it' and returns the receiver.
        // Great for setup chains. Java has no equivalent idiom.
        listOf(
            Triple("js",      R.string.tab_javascript, R.id.tab_js),
            Triple("lua",     R.string.tab_lua,        R.id.tab_lua),
            Triple("termux",  R.string.tab_termux,     R.id.tab_termux),
            Triple("shizuku", R.string.tab_shizuku,    R.id.tab_shizuku)
        ).forEach { (tag, label, content) ->
            // Destructuring declaration — unpacks Triple fields into local vals
            host.addTab(host.newTabSpec(tag)
                .setIndicator(getString(label))
                .setContent(content))
        }
    }

    private fun setupLua() {
        luaGlobals = JsePlatform.standardGlobals()
        luaGlobals["print"] = LuaPrintRedirect { line ->
            appendOutput("[Lua] $line")       // string template — no + concatenation
        }
    }

    private fun setupShizuku() {
        Shizuku.addRequestPermissionResultListener(onPermissionResult)
        Shizuku.addBinderReceivedListenerSticky(onBinderReceived)
        Shizuku.addBinderDeadListener(onBinderDead)
    }

    // =========================================================================
    // JavaScript
    // =========================================================================

    private fun runJavaScript() {
        val code = etJs.text.toString().trim().ifEmpty {
            appendOutput("[JS] Nothing to run."); return
        }
        appendOutput("[JS] > ${code.truncate(80)}")

        val bridge = ShellBridge.getInstance()
        if (bridge == null) {
            appendOutput("[JS] WebView not available — open the main screen first.")
            return
        }
        // evaluateJavascript must run on the main thread — already there
        bridge.evaluateJavascript(code) { result ->
            appendOutput("[JS] ← $result")
        }
    }

    // =========================================================================
    // Lua
    // =========================================================================

    private fun runLua() {
        val code = etLua.text.toString().trim().ifEmpty {
            appendOutput("[Lua] Nothing to run."); return
        }
        appendOutput("[Lua] > ${code.truncate(80)}")

        // lifecycleScope.launch — coroutine tied to Activity lifecycle.
        // IO dispatcher for the blocking LuaJ eval, then back to Main automatically.
        lifecycleScope.launch {
            val error = withContext(Dispatchers.IO) {
                runCatching { luaGlobals.load(code).call() }
                    .exceptionOrNull()
                    ?.message
            }
            error?.let { appendOutput("[Lua] Error: $it") }
        }
    }

    // =========================================================================
    // Termux
    // =========================================================================

    private fun runTermux() {
        val command = etTermux.text.toString().trim().ifEmpty {
            appendOutput("[Termux] Nothing to run."); return
        }
        appendOutput("[Termux] → ${command.truncate(80)}")

        runCatching {
            Intent().apply {
                setClassName("com.termux", "com.termux.app.RunCommandService")
                action = "com.termux.RUN_COMMAND"
                putExtra("com.termux.RUN_COMMAND_PATH",
                    "/data/data/com.termux/files/usr/bin/bash")
                putExtra("com.termux.RUN_COMMAND_ARGUMENTS", arrayOf("-c", command))
                putExtra("com.termux.RUN_COMMAND_BACKGROUND", false)
            }.also { startService(it) }
            appendOutput("[Termux] Command sent.")
        }.onFailure {
            appendOutput("[Termux] Not available: ${it.message}")
        }
    }

    // =========================================================================
    // Shizuku
    // =========================================================================

    private fun runShizuku() {
        val command = etShizuku.text.toString().trim().ifEmpty {
            appendOutput("[Shizuku] Nothing to run."); return
        }
        appendOutput("[Shizuku] \$ ${command.truncate(80)}")

        lifecycleScope.launch {
            // exec() is a suspend fun — no Thread needed, no runOnUiThread needed
            when (val result = ShizukuShell.exec(command)) {

                // Kotlin sealed when — compiler enforces ALL branches are handled.
                // No else clause needed. No forgotten error states.

                is ShizukuShell.ShizukuResult.Success -> {
                    if (result.stdout.isNotBlank())
                        appendOutput("[Shizuku] stdout:\n${result.stdout.trim()}")
                    if (result.stderr.isNotBlank())
                        appendOutput("[Shizuku] stderr:\n${result.stderr.trim()}")
                    appendOutput("[Shizuku] exit=${result.exitCode}")
                }

                is ShizukuShell.ShizukuResult.PermissionDenied ->
                    appendOutput("[Shizuku] ✗ ${result.reason}")

                is ShizukuShell.ShizukuResult.Failure ->
                    appendOutput("[Shizuku] Error: ${result.error.message}")
            }
        }
    }

    // =========================================================================
    // Output pane — extension function on AppCompatActivity
    // =========================================================================

    /**
     * Appends [line] to the output pane and auto-scrolls to the bottom.
     *
     * Extension function: adds behaviour to AppCompatActivity without
     * subclassing it. Java would require a static helper or a base class.
     */
    private fun appendOutput(line: String) {
        // We're always called on the Main dispatcher — no runOnUiThread needed
        tvOutput.append("$line\n")
        tvOutput.layout?.let { layout ->
            val scrollAmount = layout.getLineTop(tvOutput.lineCount) - tvOutput.height
            if (scrollAmount > 0) tvOutput.scrollTo(0, scrollAmount)
        }
        // ?.let — execute block only if layout is non-null. Safe, concise, no NPE.
    }
}

// Top-level extension — available anywhere in the file without a utility class
private fun String.truncate(max: Int): String =
    if (length > max) substring(0, max) + "…" else this

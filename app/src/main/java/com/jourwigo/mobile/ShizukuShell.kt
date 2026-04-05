package com.jourwigo.mobile

import android.content.pm.PackageManager
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import rikka.shizuku.Shizuku
import rikka.shizuku.ShizukuRemoteProcess

/**
 * Privileged shell backed by Shizuku — the shibboleth.
 *
 * If Shizuku isn't running or the user hasn't granted the binder permission,
 * every call comes back as [ShizukuResult.PermissionDenied]. No crashes, no drama.
 * We're professionals here.
 *
 * ## Kotlin: sealed class vs Java 17 sealed class
 *
 * Java 17:
 * ```java
 * public sealed interface ShizukuResult
 *         permits ShizukuResult.Success, ShizukuResult.PermissionDenied, ShizukuResult.Failure {}
 * public record Success(String stdout, String stderr, int exitCode) implements ShizukuResult {}
 * ```
 *
 * Kotlin:
 * ```kotlin
 * sealed class ShizukuResult {
 *     data class Success(...) : ShizukuResult()
 *     data class PermissionDenied(val reason: String) : ShizukuResult()
 *     data class Failure(val error: Throwable) : ShizukuResult()
 * }
 * ```
 * Kotlin's version is nested, self-contained, and the compiler enforces
 * exhaustive `when` branches — no `else` clause needed.
 */
object ShizukuShell {

    private const val TAG = "ShizukuShell"
    const val PERMISSION_REQUEST_CODE = 0xBEEF

    // ── Sealed result type ────────────────────────────────────────────────────
    //
    // Three possible outcomes. The caller uses `when` and the compiler ensures
    // every branch is handled. Goodbye, forgotten error states.

    sealed class ShizukuResult {
        /** Command ran and returned an exit code (may still be non-zero). */
        data class Success(
            val stdout: String,
            val stderr: String,
            val exitCode: Int
        ) : ShizukuResult() {
            val isOk: Boolean get() = exitCode == 0
        }

        /** Shizuku isn't running or the user hasn't granted the binder grant. */
        data class PermissionDenied(val reason: String) : ShizukuResult()

        /** Unexpected exception during process creation or I/O. */
        data class Failure(val error: Throwable) : ShizukuResult()
    }

    // ── Shibboleth checks ────────────────────────────────────────────────────

    fun isAvailable(): Boolean = runCatching { Shizuku.pingBinder() }
        .getOrElse { false }

    fun hasPermission(): Boolean = runCatching {
        Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
    }.getOrElse { false }

    fun requestPermission() = Shizuku.requestPermission(PERMISSION_REQUEST_CODE)

    // ── Command execution ────────────────────────────────────────────────────

    /**
     * Runs [command] as `sh -c <command>` via the Shizuku binder.
     *
     * Suspends on [Dispatchers.IO] — safe to call from any coroutine.
     *
     * ## Kotlin: runCatching + getOrElse
     *
     * Instead of try/catch boilerplate, Kotlin's [runCatching] wraps a block
     * in a [Result<T>]. [getOrElse] handles the failure branch inline:
     * ```kotlin
     * runCatching { riskyThing() }.getOrElse { ShizukuResult.Failure(it) }
     * ```
     */
    suspend fun exec(command: String): ShizukuResult = withContext(Dispatchers.IO) {
        // Shibboleth — check access before touching the binder
        if (!isAvailable()) {
            return@withContext ShizukuResult.PermissionDenied(
                "Shizuku service is not running. Start it via ADB."
            )
        }
        if (!hasPermission()) {
            return@withContext ShizukuResult.PermissionDenied(
                "Shizuku binder permission not granted. Tap 'Request'."
            )
        }

        Log.d(TAG, "exec: $command")

        runCatching {
            val process: ShizukuRemoteProcess = Shizuku.newProcess(
                arrayOf("sh", "-c", command), null, null
            )
            // Read both streams before waitFor() to avoid deadlock on full pipe buffers
            val stdout = process.inputStream.bufferedReader().readText()
            val stderr = process.errorStream.bufferedReader().readText()
            val exit   = process.waitFor()

            Log.d(TAG, "exit=$exit stdout=${stdout.truncate(120)}")
            ShizukuResult.Success(stdout, stderr, exit)

        }.getOrElse { error ->
            Log.e(TAG, "Process execution failed", error)
            ShizukuResult.Failure(error)
        }
    }
}

// Extension on String — truncate for logging, no utility class needed
private fun String.truncate(max: Int): String =
    if (length > max) substring(0, max) + "…" else this

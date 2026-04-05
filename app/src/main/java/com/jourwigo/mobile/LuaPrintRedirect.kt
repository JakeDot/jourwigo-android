package com.jourwigo.mobile

import org.luaj.vm2.LuaValue
import org.luaj.vm2.Varargs
import org.luaj.vm2.lib.VarArgFunction

/**
 * Replaces LuaJ's default `print()` so script output goes to the Shell UI
 * instead of stdout.
 *
 * ## Kotlin: fun interface (SAM) vs Java @FunctionalInterface
 *
 * Java:
 * ```java
 * @FunctionalInterface
 * public interface OutputSink { void accept(String line); }
 * OutputSink s = line -> tv.append(line);          // SAM lambda
 * ```
 *
 * Kotlin `fun interface` — same concept, but the lambda conversion is
 * built into the language and works with trailing-lambda syntax:
 * ```kotlin
 * val s = OutputSink { line -> tv.append(line) }
 * // or even shorter with a method reference:
 * val s = OutputSink(tv::append)
 * ```
 */
class LuaPrintRedirect(private val sink: OutputSink) : VarArgFunction() {

    // fun interface = Kotlin's SAM. One abstract method, lambda-compatible.
    fun interface OutputSink {
        fun accept(line: String)
    }

    override fun invoke(args: Varargs): Varargs {
        // buildString is a Kotlin stdlib helper — creates a StringBuilder,
        // runs the lambda inside it, returns the final String. No manual sb.toString().
        val line = buildString {
            for (i in 1..args.narg()) {
                if (i > 1) append('\t')
                append(args.arg(i).tojstring())
            }
        }
        sink.accept(line)
        return LuaValue.NONE
    }
}

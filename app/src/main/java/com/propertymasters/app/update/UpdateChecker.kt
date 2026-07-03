package com.propertymasters.app.update

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class UpdateInfo(
    val versionCode: Int,
    val versionName: String,
    val publishedAt: String,
    val sizeBytes: Long
)

object UpdateChecker {
    private const val TAG = "UpdateChecker"

    // Backend proxy — keeps the GitHub token off-device.
    private const val UPDATE_ENDPOINT =
        "https://base44.app/api/apps/69ff0748d44b486851db38b6/functions/propertyMastersUpdate"

    /** Returns UpdateInfo if a newer build than [currentVersionCode] is available, else null. */
    suspend fun checkForUpdate(currentVersionCode: Int): UpdateInfo? = withContext(Dispatchers.IO) {
        try {
            val conn = (URL(UPDATE_ENDPOINT).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 15_000
                readTimeout = 15_000
            }
            conn.outputStream.use { it.write("""{"action":"check"}""".toByteArray()) }

            if (conn.responseCode != 200) {
                Log.w(TAG, "Update check failed: HTTP ${conn.responseCode}")
                return@withContext null
            }

            val body = conn.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(body)
            val remoteVersionCode = json.getInt("versionCode")

            if (remoteVersionCode > currentVersionCode) {
                UpdateInfo(
                    versionCode = remoteVersionCode,
                    versionName = json.getString("versionName"),
                    publishedAt = json.optString("publishedAt", ""),
                    sizeBytes = json.optLong("sizeBytes", 0L)
                )
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Update check error", e)
            null
        }
    }
}

package com.propertymasters.app.update

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.content.FileProvider
import java.io.File

/**
 * Downloads the latest APK via the DownloadManager (shows a native progress
 * notification) and then launches the system package installer.
 */
object UpdateManager {

    private const val APK_FILENAME = "property-masters-update.apk"

    // Same backend proxy, but requests the binary download.
    private const val DOWNLOAD_ENDPOINT =
        "https://base44.app/api/apps/69ff0748d44b486851db38b6/functions/propertyMastersUpdate"

    fun downloadAndInstall(context: Context, versionName: String) {
        val destFile = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), APK_FILENAME)
        if (destFile.exists()) destFile.delete()

        // DownloadManager can't send a JSON POST body directly, so we route
        // through a tiny same-origin redirect trick isn't needed here: our
        // backend function defaults to POST-only, so we instead do the
        // download ourselves via HttpURLConnection on a background thread
        // for full control (progress-less, but simple + reliable).
        Thread {
            try {
                val conn = (java.net.URL(DOWNLOAD_ENDPOINT).openConnection() as java.net.HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                    connectTimeout = 20_000
                    readTimeout = 60_000
                }
                conn.outputStream.use { it.write("""{"action":"download"}""".toByteArray()) }

                if (conn.responseCode == 200) {
                    conn.inputStream.use { input ->
                        destFile.outputStream().use { output ->
                            input.copyTo(output)
                        }
                    }
                    // Hop back to main thread to launch the installer.
                    android.os.Handler(context.mainLooper).post {
                        installApk(context, destFile)
                    }
                }
            } catch (_: Exception) {
                // Silently ignore — user can retry via the update dialog next launch.
            }
        }.start()
    }

    private fun installApk(context: Context, file: File) {
        val uri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}

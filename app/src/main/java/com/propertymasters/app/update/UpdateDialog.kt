package com.propertymasters.app.update

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

@Composable
fun UpdateAvailableDialog(
    update: UpdateInfo,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Update available") },
        text = {
            Text("A new version (${update.versionName}) of Property Masters is ready. Download and install it now?")
        },
        confirmButton = {
            Button(onClick = {
                UpdateManager.downloadAndInstall(context, update.versionName)
                onDismiss()
            }) {
                Text("Update now")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Later")
            }
        }
    )
}

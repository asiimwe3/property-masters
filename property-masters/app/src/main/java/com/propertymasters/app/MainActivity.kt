package com.propertymasters.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.propertymasters.app.data.repository.FirestoreSeeder
import com.propertymasters.app.ui.theme.PropertyMastersTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Seed Firestore with mock data on first run (if Firebase is configured)
        try {
            FirestoreSeeder.seedIfNeeded()
        } catch (e: Exception) {
            // No Firebase configured — app works with local mock data
        }
        setContent {
            PropertyMastersTheme {
                PropertyMastersApp()
            }
        }
    }
}

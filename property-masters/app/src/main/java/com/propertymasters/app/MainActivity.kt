package com.propertymasters.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

import com.propertymasters.app.ui.theme.PropertyMastersTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Data loads from Supabase on startup
        try {
            // Supabase is pre-seeded — no local seeding needed
        } catch (e: Exception) {
            // Using Supabase backend — data loads from cloud database
        }
        setContent {
            PropertyMastersTheme {
                PropertyMastersApp()
            }
        }
    }
}

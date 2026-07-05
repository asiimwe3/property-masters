package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.ui.theme.TextPrimary

@Composable
fun PrivacyPolicyScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                Icons.Filled.ArrowBack,
                contentDescription = "Back",
                tint = TextPrimary,
                modifier = Modifier.clickable { onBack() }
            )
            Spacer(Modifier.width(14.dp))
            Text("Privacy Policy", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
        }
        Spacer(Modifier.height(16.dp))

        Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
            PolicySection(
                "Information We Collect",
                "We collect the account details you provide (email address) and the property, broker, or job listings you create within Property Master. We also store your favorites so they sync across your devices."
            )
            PolicySection(
                "How We Use Your Information",
                "Your information is used to operate your account, display your listings and favorites, and let other users browse public property, broker, and job listings you choose to publish."
            )
            PolicySection(
                "Data Storage",
                "Account and listing data is stored securely using Firebase Authentication and Cloud Firestore. We do not sell your personal information to third parties."
            )
            PolicySection(
                "Your Choices",
                "You can remove your listings, unfavorite properties, or delete your account at any time by contacting support."
            )
            PolicySection(
                "Contact",
                "Questions about this policy? Reach us any time from Account > Contact Support."
            )
            Spacer(Modifier.height(60.dp))
        }
    }
}

@Composable
private fun PolicySection(title: String, body: String) {
    Column(modifier = Modifier.padding(bottom = 18.dp)) {
        Text(title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, color = TextPrimary)
        Spacer(Modifier.height(6.dp))
        Text(body, fontSize = 13.sp, color = TextMuted, lineHeight = 19.sp)
    }
}

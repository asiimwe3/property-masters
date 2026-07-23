package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.propertymasters.app.data.repository.MockDataRepository
import com.propertymasters.app.ui.components.PropertyGridCard
import com.propertymasters.app.ui.components.RoundedPrimaryButton
import com.propertymasters.app.ui.components.SectionHeader
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.Divider
import com.propertymasters.app.ui.theme.StarYellow
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TealLight
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.AppViewModel
import com.propertymasters.app.viewmodel.PropertyViewModel

@Composable
fun AccountScreen(
    onPropertyClick: (String) -> Unit,
    onAddProperty: () -> Unit,
    onLogout: () -> Unit
) {
    val appVm: AppViewModel = viewModel()
    val propertyVm: PropertyViewModel = viewModel()
    val user = MockDataRepository.currentUser
    val savedProperties = propertyVm.getSavedProperties()
    val listedProperties = MockDataRepository.properties.filter { user.listedProperties.contains(it.id) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray)
            .verticalScroll(rememberScrollState())
    ) {
        // Profile header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(TealPrimary, TealPrimary.copy(alpha = 0.9f))))
                .statusBarsPadding()
                .padding(horizontal = 20.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AsyncImage(
                model = user.photoUrl,
                contentDescription = user.name,
                modifier = Modifier
                    .size(90.dp)
                    .clip(CircleShape)
            )
            Text(user.name, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(top = 12.dp))
            Text(user.email, fontSize = 13.sp, color = Color.White.copy(alpha = 0.8f))
            if (user.isVerified) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                    Icon(Icons.Filled.Star, contentDescription = null, tint = StarYellow, modifier = Modifier.size(14.dp))
                    Text(" Verified Account", fontSize = 13.sp, color = Color.White.copy(alpha = 0.9f))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatBox("${savedProperties.size}", "Saved", Modifier.weight(1f))
                StatBox("${listedProperties.size}", "Listed", Modifier.weight(1f))
                StatBox("${user.listedProperties.size}", "Active", Modifier.weight(1f))
            }
        }

        Column(modifier = Modifier.padding(20.dp)) {
            // Contact info
            SectionHeader(title = "Contact Info")
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    ContactRow(Icons.Filled.Person, user.name)
                    ContactRow(Icons.Filled.Email, user.email)
                    ContactRow(Icons.Filled.Phone, user.phone)
                    ContactRow(Icons.Filled.LocationOn, "Kampala, Uganda")
                    ContactRow(Icons.Filled.Star, "Joined ${user.joinedDate}")
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Saved Properties
            SectionHeader(title = "Saved Properties (${savedProperties.size})")
            if (savedProperties.isEmpty()) {
                Text(
                    "No saved properties yet. Tap the heart icon on any property to save it here.",
                    fontSize = 14.sp,
                    color = TextMuted,
                    modifier = Modifier.padding(top = 12.dp)
                )
            } else {
                savedProperties.chunked(2).forEach { row ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        row.forEach { property ->
                            Column(modifier = Modifier.weight(1f)) {
                                PropertyGridCard(property = property, onViewClick = { onPropertyClick(property.id) })
                            }
                        }
                        if (row.size == 1) Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Listed Properties
            SectionHeader(title = "My Listings (${listedProperties.size})")
            Spacer(modifier = Modifier.height(8.dp))
            RoundedPrimaryButton(
                text = "List New Property",
                modifier = Modifier.fillMaxWidth(),
                onClick = onAddProperty
            )
            if (listedProperties.isNotEmpty()) {
                listedProperties.chunked(2).forEach { row ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        row.forEach { property ->
                            Column(modifier = Modifier.weight(1f)) {
                                PropertyGridCard(property = property, onViewClick = { onPropertyClick(property.id) })
                            }
                        }
                        if (row.size == 1) Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Settings
            SectionHeader(title = "Settings")
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column {
                    SettingsRow(Icons.Filled.Notifications, "Notifications", true)
                    SettingsRow(Icons.Filled.Person, "Edit Profile", true)
                    SettingsRow(Icons.Filled.Settings, "App Settings", true)
                    SettingsRow(Icons.Filled.Bookmark, "Privacy & Security", true)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Logout
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                onClick = onLogout
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text("Log Out", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFE53935))
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
            Text("Property Masters v1.0.0", fontSize = 12.sp, color = TextMuted, modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        }
    }
}

@Composable
private fun StatBox(value: String, label: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White.copy(alpha = 0.15f))
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text(label, fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
    }
}

@Composable
private fun ContactRow(icon: androidx.compose.ui.graphics.vector.ImageVector, value: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 6.dp)
    ) {
        Icon(icon, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(18.dp))
        Text(value, fontSize = 14.sp, color = TextDark, modifier = Modifier.padding(start = 12.dp))
    }
}

@Composable
private fun SettingsRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, showArrow: Boolean = true) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(20.dp))
        Text(label, fontSize = 15.sp, color = TextDark, modifier = Modifier.padding(start = 12.dp))
        Spacer(modifier = Modifier.weight(1f))
        if (showArrow) {
            Icon(Icons.AutoMirrored.Filled.ArrowForwardIos, contentDescription = null, tint = TextMuted, modifier = Modifier.size(14.dp))
        }
    }
    androidx.compose.material3.Divider(modifier = Modifier.padding(start = 48.dp), color = Divider, thickness = 0.5.dp)
}

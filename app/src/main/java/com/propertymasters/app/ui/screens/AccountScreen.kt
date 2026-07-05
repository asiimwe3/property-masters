package com.propertymasters.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.propertymasters.app.data.AuthRepository
import com.propertymasters.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AccountScreen(
    onLogout: () -> Unit,
    onOpenMyListings: () -> Unit,
    onOpenFavorites: () -> Unit,
    onOpenPrivacyPolicy: () -> Unit
) {
    val context = LocalContext.current
    val user = AuthRepository.currentUser

    val displayName = user?.email?.substringBefore("@") ?: "Member"
    val isVerified = user?.isEmailVerified == true
    val memberSince = user?.metadata?.creationTimestamp?.let {
        SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(Date(it))
    } ?: "—"
    val avatarSeed = user?.email ?: "guest"
    val avatarUrl = "https://api.dicebear.com/7.x/initials/png?seed=$avatarSeed&backgroundColor=1a5c38"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Text(
            "Your Account",
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
            color = TextPrimary
        )
        Spacer(Modifier.height(18.dp))

        // Profile card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardWhite),
            elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(
                    model = avatarUrl,
                    contentDescription = "Profile",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                )
                Spacer(Modifier.width(14.dp))
                Column {
                    Text(displayName, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                    if (isVerified) {
                        Box(
                            modifier = Modifier
                                .background(ChipTealBg, RoundedCornerShape(10.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text("✓ Verified User", fontSize = 11.sp, color = TealPrimary, fontWeight = FontWeight.Medium)
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .background(BorderGray, RoundedCornerShape(10.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text("Email not verified", fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.Medium)
                        }
                    }
                    Spacer(Modifier.height(2.dp))
                    Text("Member since $memberSince", fontSize = 11.sp, color = TextMuted)
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardWhite),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                MenuRow(icon = "🏠", label = "My Listings", onClick = onOpenMyListings)
                Divider(color = BorderGray, thickness = 0.6.dp)
                MenuRow(icon = "❤️", label = "Favorites", onClick = onOpenFavorites)
                Divider(color = BorderGray, thickness = 0.6.dp)
                MenuRow(icon = "☎️", label = "Contact Support", onClick = {
                    val intent = Intent(Intent.ACTION_SENDTO).apply {
                        data = Uri.parse("mailto:support@propertymasters.app")
                        putExtra(Intent.EXTRA_SUBJECT, "Property Master Support")
                    }
                    context.startActivity(Intent.createChooser(intent, "Contact Support"))
                })
                Divider(color = BorderGray, thickness = 0.6.dp)
                MenuRow(icon = "📄", label = "Privacy Policy", onClick = onOpenPrivacyPolicy)
            }
        }

        Spacer(Modifier.height(20.dp))

        Button(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BorderGray, contentColor = TextPrimary)
        ) {
            Text("Log Out", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
        }

        Spacer(Modifier.height(60.dp))
    }
}

@Composable
private fun MenuRow(icon: String, label: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(icon, fontSize = 16.sp)
            Spacer(Modifier.width(12.dp))
            Text(label, fontSize = 14.sp, color = TextPrimary)
        }
        Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp))
    }
}

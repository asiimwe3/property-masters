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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.propertymasters.app.ui.components.PropertyGridCard
import com.propertymasters.app.ui.components.RoundedPrimaryButton
import com.propertymasters.app.ui.components.SectionHeader
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.StarYellow
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TealLight
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.BrokerViewModel

@Composable
fun BrokerDetailScreen(
    brokerId: String,
    onBack: () -> Unit,
    onPropertyClick: (String) -> Unit
) {
    val vm: BrokerViewModel = viewModel()
    val broker = vm.getBrokerById(brokerId)
    val listings = vm.getPropertiesByBroker(brokerId)

    if (broker == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Broker not found", color = TextMuted)
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray)
            .verticalScroll(rememberScrollState())
    ) {
        // Header gradient
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(TealPrimary, TealPrimary.copy(alpha = 0.9f))))
                .statusBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text("Broker Profile", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = broker.photoUrl,
                    contentDescription = broker.name,
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                )
                Column(modifier = Modifier.padding(start = 16.dp)) {
                    Text(broker.name, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(broker.specialty, fontSize = 14.sp, color = Color.White.copy(alpha = 0.85f))
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                        Icon(Icons.Filled.Star, contentDescription = null, tint = StarYellow, modifier = Modifier.size(14.dp))
                        Text(
                            " ${broker.rating} | ${broker.reviewCount} reviews",
                            fontSize = 13.sp,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                BrokerStat("${broker.listingsCount}", "Listings", Modifier.weight(1f))
                BrokerStat("${broker.experienceYears}y", "Experience", Modifier.weight(1f))
                BrokerStat("${broker.areasServed.size}", "Areas", Modifier.weight(1f))
            }
        }

        Column(modifier = Modifier.padding(20.dp)) {
            SectionHeader(title = "About")
            Text(broker.bio, fontSize = 14.sp, color = TextMuted, lineHeight = 22.sp, modifier = Modifier.padding(top = 8.dp))

            Spacer(modifier = Modifier.height(20.dp))

            SectionHeader(title = "Contact")
            Spacer(modifier = Modifier.height(8.dp))
            ContactRow(Icons.Filled.Call, broker.phone)
            ContactRow(Icons.Filled.Email, broker.email)

            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                RoundedPrimaryButton(text = "Call", modifier = Modifier.weight(1f), onClick = {})
                RoundedPrimaryButton(text = "WhatsApp", modifier = Modifier.weight(1f), onClick = {})
            }

            Spacer(modifier = Modifier.height(20.dp))

            SectionHeader(title = "Languages")
            Row(modifier = Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                broker.languages.forEach { lang ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(TealLight)
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(lang, fontSize = 12.sp, color = TealPrimary, fontWeight = FontWeight.Medium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            SectionHeader(title = "Areas Served")
            Column(modifier = Modifier.padding(top = 8.dp)) {
                broker.areasServed.forEach { area ->
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                        Icon(Icons.Filled.LocationOn, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(16.dp))
                        Text(area, fontSize = 14.sp, color = TextDark, modifier = Modifier.padding(start = 8.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            SectionHeader(title = "Active Listings (${listings.size})")
            Spacer(modifier = Modifier.height(12.dp))

            listings.chunked(2).forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    row.forEach { property ->
                        Column(modifier = Modifier.weight(1f)) {
                            PropertyGridCard(property = property, onViewClick = { onPropertyClick(property.id) })
                        }
                    }
                    if (row.size == 1) Spacer(modifier = Modifier.weight(1f))
                }
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun BrokerStat(value: String, label: String, modifier: Modifier = Modifier) {
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

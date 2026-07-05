package com.propertymasters.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Star
import androidx.compose.foundation.clickable
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.propertymasters.app.data.Broker
import com.propertymasters.app.data.Job
import com.propertymasters.app.data.Property
import com.propertymasters.app.ui.theme.*

@Composable
fun PropertyGridCard(
    property: Property,
    onView: () -> Unit,
    modifier: Modifier = Modifier,
    isFavorite: Boolean = false,
    onToggleFavorite: (() -> Unit)? = null
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column {
            Box {
                AsyncImage(
                    model = property.imageUrl,
                    contentDescription = property.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)
                        .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                )
                if (onToggleFavorite != null) {
                    Box(
                        modifier = Modifier
                            .padding(6.dp)
                            .align(Alignment.TopEnd)
                            .size(26.dp)
                            .background(ComposeColor.White.copy(alpha = 0.85f), RoundedCornerShape(13.dp))
                            .clickable { onToggleFavorite() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (isFavorite) ComposeColor(0xFFE0245E) else TextMuted,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }
            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    property.title,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    color = TextPrimary,
                    maxLines = 1
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "🛏 ${property.beds} · 🛁 ${property.baths}",
                    fontSize = 11.sp,
                    color = TextSecondary
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    property.price,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TealPrimary
                )
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = onView,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(34.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("View", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

@Composable
fun FeaturedPropertyCard(property: Property, onView: () -> Unit, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .width(230.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column {
            AsyncImage(
                model = property.imageUrl,
                contentDescription = property.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
                    .clip(RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp))
            )
            Column(modifier = Modifier.padding(12.dp)) {
                Text(property.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextPrimary)
                Spacer(Modifier.height(4.dp))
                Text(property.price, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TealPrimary)
            }
        }
    }
}

@Composable
fun BrokerCard(broker: Broker, onViewProfile: () -> Unit, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = broker.photoUrl,
                contentDescription = broker.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(28.dp))
            )
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(broker.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextPrimary)
                Text(broker.title, fontSize = 12.sp, color = TextSecondary)
                Spacer(Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .background(ChipTealBg, RoundedCornerShape(20.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(broker.specialty, fontSize = 10.sp, color = TealPrimary, fontWeight = FontWeight.Medium)
                }
                Spacer(Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.Star, contentDescription = null, tint = StarYellow, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(3.dp))
                    Text("${broker.rating} (${broker.reviewCount})", fontSize = 12.sp, color = TextSecondary)
                }
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = onViewProfile,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(36.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
                    Text("View Profile", fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
fun JobCard(job: Job, onApply: () -> Unit, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(job.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextPrimary)
            Text(job.company, fontSize = 13.sp, color = TextSecondary)
            Spacer(Modifier.height(8.dp))
            Row {
                Text("📍 ${job.location}", fontSize = 12.sp, color = TextMuted)
                Spacer(Modifier.width(12.dp))
                Text("🕐 ${job.type}", fontSize = 12.sp, color = TextMuted)
            }
            Spacer(Modifier.height(4.dp))
            Text("💰 ${job.salary}", fontSize = 13.sp, color = TealPrimary, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(10.dp))
            Button(
                onClick = onApply,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(38.dp),
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text("Apply Now", fontSize = 13.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Bathtub
import androidx.compose.material.icons.filled.Bed
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.SquareFoot
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.propertymasters.app.data.repository.MockDataRepository
import com.propertymasters.app.ui.components.RoundedPrimaryButton
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.StarYellow
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.PropertyViewModel

@Composable
fun PropertyDetailScreen(
    propertyId: String,
    onBack: () -> Unit,
    onBrokerClick: (String) -> Unit
) {
    val vm: PropertyViewModel = viewModel()
    val property = MockDataRepository.getPropertyById(propertyId)
    val broker = property?.let { MockDataRepository.getBrokerById(it.brokerId) }

    if (property == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Property not found", color = TextMuted)
        }
        return
    }

    val isSaved = vm.isSaved(propertyId)

    Box(modifier = Modifier.fillMaxSize().background(BackgroundGray)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Image hero
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
            ) {
                AsyncImage(
                    model = property.galleryImages.firstOrNull() ?: property.imageUrl,
                    contentDescription = property.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                // Gradient overlay for back button
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .background(
                            androidx.compose.ui.graphics.Brush.verticalGradient(
                                colors = listOf(Color.Black.copy(alpha = 0.4f), Color.Transparent)
                            )
                        )
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                    FloatingActionButton(
                        onClick = { vm.toggleSave(propertyId) },
                        modifier = Modifier.size(48.dp),
                        shape = CircleShape,
                        containerColor = Color.White
                    ) {
                        Icon(
                            if (isSaved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = "Save",
                            tint = if (isSaved) Color.Red else TealPrimary
                        )
                    }
                }
            }

            Column(modifier = Modifier.padding(20.dp)) {
                // Status badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(TealPrimary.copy(alpha = 0.1f))
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        property.status,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TealPrimary
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(property.title, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextDark)
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                    Icon(Icons.Filled.LocationOn, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(16.dp))
                    Text(property.location, fontSize = 14.sp, color = TextMuted, modifier = Modifier.padding(start = 4.dp))
                }
                Text(
                    property.price,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = TealPrimary,
                    modifier = Modifier.padding(top = 8.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Specs row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    SpecItem(Icons.Filled.Bed, "${property.beds}", "Beds")
                    SpecItem(Icons.Filled.Bathtub, "${property.baths}", "Baths")
                    SpecItem(Icons.Filled.SquareFoot, "${property.areaSqft}", "Sq Ft")
                    SpecItem(Icons.Filled.DirectionsCar, "${property.parking}", "Parking")
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Description
                SectionTitle("Description")
                Text(property.description, fontSize = 14.sp, color = TextMuted, lineHeight = 22.sp)

                Spacer(modifier = Modifier.height(20.dp))

                // Amenities
                if (property.amenities.isNotEmpty()) {
                    SectionTitle("Amenities")
                    Column(modifier = Modifier.padding(top = 8.dp)) {
                        property.amenities.chunked(2).forEach { row ->
                            Row(modifier = Modifier.padding(vertical = 4.dp)) {
                                row.forEach { amenity ->
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(
                                            Icons.Filled.Check,
                                            contentDescription = null,
                                            tint = TealPrimary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Text(
                                            amenity,
                                            fontSize = 13.sp,
                                            color = TextDark,
                                            modifier = Modifier.padding(start = 6.dp)
                                        )
                                    }
                                }
                                if (row.size == 1) Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Year built
                SectionTitle("Details")
                DetailRow("Year Built", property.yearBuilt.toString())
                DetailRow("Category", property.category)
                DetailRow("Status", property.status)

                Spacer(modifier = Modifier.height(20.dp))

                // Broker card
                if (broker != null) {
                    SectionTitle("Listed By")
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AsyncImage(
                            model = broker.photoUrl,
                            contentDescription = broker.name,
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                        )
                        Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                            Text(broker.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                            Text(broker.specialty, fontSize = 12.sp, color = TextMuted)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.Star, contentDescription = null, tint = StarYellow, modifier = Modifier.size(12.dp))
                                Text(" ${broker.rating} | ${broker.reviewCount} reviews", fontSize = 11.sp, color = TextMuted)
                            }
                        }
                        RoundedPrimaryButton(text = "View") { onBrokerClick(broker.id) }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        RoundedPrimaryButton(
                            text = "Call",
                            modifier = Modifier.weight(1f),
                            onClick = { /* In production: Intent.ACTION_DIAL */ }
                        )
                        RoundedPrimaryButton(
                            text = "WhatsApp",
                            modifier = Modifier.weight(1f),
                            onClick = { /* In production: WhatsApp intent */ }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecItem(icon: androidx.compose.ui.graphics.vector.ImageVector, value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = label, tint = TealPrimary, modifier = Modifier.size(24.dp))
        Text(value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextDark, modifier = Modifier.padding(top = 4.dp))
        Text(label, fontSize = 11.sp, color = TextMuted)
    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 14.sp, color = TextMuted)
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = TextDark)
    }
}

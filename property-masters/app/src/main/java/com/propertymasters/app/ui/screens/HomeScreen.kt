package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.House
import androidx.compose.material.icons.filled.Villa
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.Star
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
import com.propertymasters.app.data.model.ExploreCategory
import com.propertymasters.app.ui.components.FeaturedPropertyCard
import com.propertymasters.app.ui.components.RatingBadge
import com.propertymasters.app.ui.components.RemoteAvatar
import com.propertymasters.app.ui.components.SearchBar
import com.propertymasters.app.ui.components.SectionHeader
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TealLight
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.BrokerViewModel
import com.propertymasters.app.viewmodel.PropertyViewModel

@Composable
fun HomeScreen(
    onPropertyClick: (String) -> Unit,
    onBrokerClick: (String) -> Unit,
    onSearchClick: () -> Unit
) {
    val propertyVm: PropertyViewModel = viewModel()
    val brokerVm: BrokerViewModel = viewModel()

    val exploreCategories = listOf(
        ExploreCategory("Houses", Icons.Filled.House),
        ExploreCategory("Apartments", Icons.Filled.Apartment),
        ExploreCategory("Villas", Icons.Filled.Villa),
        ExploreCategory("Commercial", Icons.Filled.Business),
        ExploreCategory("Condos", Icons.Filled.LocationCity)
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item {
            // Greeting
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(TealPrimary, TealPrimary.copy(alpha = 0.9f))
                        )
                    )
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Text(
                    "Welcome back,",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.8f)
                )
                Text(
                    "Find Your Dream Home",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(16.dp))
                SearchBar(
                    placeholder = "Search properties...",
                    onFilterClick = onSearchClick
                )
            }
        }

        // Explore Categories
        item {
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
                SectionHeader(title = "Explore Categories")
                Spacer(modifier = Modifier.height(12.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(exploreCategories) { category ->
                        CategoryCircleCard(category)
                    }
                }
            }
        }

        // Featured Properties
        item {
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)) {
                SectionHeader(
                    title = "Featured Properties",
                    actionText = "See All",
                    onActionClick = onSearchClick
                )
                Spacer(modifier = Modifier.height(12.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    items(propertyVm.featuredProperties) { property ->
                        FeaturedPropertyCard(
                            property = property,
                            onClick = { onPropertyClick(property.id) }
                        )
                    }
                }
            }
        }

        // Top Brokers
        item {
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
                SectionHeader(title = "Top Brokers")
                Spacer(modifier = Modifier.height(12.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(brokerVm.filteredBrokers.take(5)) { broker ->
                        BrokerCircleCard(
                            name = broker.name,
                            photoUrl = broker.photoUrl,
                            specialty = broker.specialty,
                            rating = broker.rating,
                            onClick = { onBrokerClick(broker.id) }
                        )
                    }
                }
            }
        }

        // Recent Listings
        item {
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)) {
                SectionHeader(
                    title = "Recent Listings",
                    actionText = "See All",
                    onActionClick = onSearchClick
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
        }

        items(propertyVm.filteredProperties.take(6)) { property ->
            RecentPropertyRow(property) { onPropertyClick(property.id) }
        }
    }
}

@Composable
private fun CategoryCircleCard(category: ExploreCategory) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(80.dp)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(TealLight),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                category.icon,
                contentDescription = category.name,
                tint = TealPrimary,
                modifier = Modifier.size(30.dp)
            )
        }
        Text(
            category.name,
            fontSize = 12.sp,
            color = TextDark,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(top = 6.dp)
        )
    }
}

@Composable
private fun BrokerCircleCard(
    name: String,
    photoUrl: String,
    specialty: String,
    rating: Double,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(90.dp)
    ) {
        Card(
            modifier = Modifier.size(72.dp),
            shape = RoundedCornerShape(36.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            onClick = onClick
        ) {
            RemoteAvatar(photoUrl, size = 72.dp)
        }
        Text(
            name,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextDark,
            maxLines = 1,
            modifier = Modifier.padding(top = 6.dp)
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.Star, contentDescription = null, tint = Color(0xFFFFB800), modifier = Modifier.size(10.dp))
            Text(" $rating", fontSize = 10.sp, color = TextMuted)
        }
    }
}

@Composable
private fun RecentPropertyRow(
    property: com.propertymasters.app.data.model.Property,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        onClick = onClick
    ) {
        Row(modifier = Modifier.padding(10.dp)) {
            androidx.compose.foundation.layout.Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(12.dp))
            ) {
                coil.compose.AsyncImage(
                    model = property.imageUrl,
                    contentDescription = property.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = androidx.compose.ui.layout.ContentScale.Crop
                )
            }
            Column(
                modifier = Modifier
                    .padding(start = 12.dp)
                    .weight(1f)
            ) {
                Text(property.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Text(property.location, fontSize = 12.sp, color = TextMuted, modifier = Modifier.padding(top = 2.dp))
                Row(modifier = Modifier.padding(top = 4.dp)) {
                    Text("${property.beds} beds", fontSize = 11.sp, color = TextMuted, modifier = Modifier.padding(end = 8.dp))
                    Text("${property.baths} baths", fontSize = 11.sp, color = TextMuted)
                }
                Text(
                    property.price,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TealPrimary,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}

package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.MockData
import com.propertymasters.app.ui.components.FeaturedPropertyCard
import com.propertymasters.app.ui.components.SearchBarUi
import com.propertymasters.app.ui.components.SectionHeader
import com.propertymasters.app.ui.theme.ChipTealBg
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TextPrimary

@Composable
fun HomeScreen(onPropertyClick: (Int) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Text(
            "Property Master",
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
            color = TextPrimary
        )
        Spacer(Modifier.height(14.dp))

        SearchBarUi(placeholder = "Search homes, condos...")
        Spacer(Modifier.height(20.dp))

        SectionHeader(title = "Explore Categories")
        Spacer(Modifier.height(12.dp))

        LazyRow(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            items(MockData.categories) { category ->
                CategoryChip(icon = category.icon, label = category.name)
            }
        }

        Spacer(Modifier.height(24.dp))

        SectionHeader(title = "Featured Properties", actionLabel = "See all")
        Spacer(Modifier.height(12.dp))

        LazyRow(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            items(MockData.properties.filter { it.isFeatured }) { property ->
                FeaturedPropertyCard(property = property, onView = { onPropertyClick(property.id) })
            }
        }

        Spacer(Modifier.height(80.dp))
    }
}

@Composable
private fun CategoryChip(icon: String, label: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(70.dp)
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .background(ChipTealBg, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(icon, fontSize = 22.sp)
        }
        Spacer(Modifier.height(6.dp))
        Text(
            label,
            fontSize = 11.sp,
            color = TextPrimary,
            textAlign = TextAlign.Center,
            maxLines = 1
        )
    }
}

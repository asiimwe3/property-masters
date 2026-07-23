package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.ui.components.CategoryChip
import com.propertymasters.app.ui.components.PropertyGridCard
import com.propertymasters.app.ui.components.SearchBar
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.PropertyViewModel

@Composable
fun PropertiesScreen(
    onPropertyClick: (String) -> Unit
) {
    val vm: PropertyViewModel = viewModel()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray)
    ) {
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Text("Properties", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextDark)
                Spacer(modifier = Modifier.height(12.dp))
                SearchBar(
                    placeholder = "Search properties...",
                    onFilterClick = { vm.toggleFilters() },
                    onSearchChange = { vm.updateSearchQuery(it) }
                )
                Spacer(modifier = Modifier.height(12.dp))

                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(vm.categories) { category ->
                        CategoryChip(
                            label = category,
                            isSelected = vm.selectedCategory == category,
                            onClick = { vm.updateCategory(category) }
                        )
                    }
                }

                if (vm.showFilters) {
                    FilterPanel(vm)
                }
            }
        }

        item {
            Text(
                "${vm.filteredProperties.size} properties found",
                fontSize = 13.sp,
                color = TextMuted,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
            )
        }

        val propertyPairs = vm.filteredProperties.chunked(2)
        items(propertyPairs) { pair ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                pair.forEach { property ->
                    Column(modifier = Modifier.weight(1f)) {
                        PropertyGridCard(property = property, onViewClick = { onPropertyClick(property.id) })
                    }
                }
                if (pair.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun FilterPanel(vm: PropertyViewModel) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Filters", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                IconButton(onClick = { vm.toggleFilters() }) {
                    Icon(Icons.Filled.Close, contentDescription = "Close", tint = TextMuted)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text("Min Bedrooms: ${if (vm.minBeds == 0) "Any" else vm.minBeds}", fontSize = 13.sp, color = TextMuted)
            Slider(
                value = vm.minBeds.toFloat(),
                onValueChange = { vm.updateMinBeds(it.toInt()) },
                valueRange = 0f..6f,
                steps = 5,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))
            Text("Max Price: $${"%,d".format(vm.maxPrice)}", fontSize = 13.sp, color = TextMuted)
            Slider(
                value = vm.maxPrice.toFloat(),
                onValueChange = { vm.updatePriceRange(vm.minPrice, it.toInt()) },
                valueRange = 50_000f..700_000f,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = { vm.resetFilters() }) {
                    Text("Reset", color = TealPrimary, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

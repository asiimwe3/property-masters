package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.MockData
import com.propertymasters.app.ui.components.FilterBarUi
import com.propertymasters.app.ui.components.PropertyGridCard
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TextPrimary

@Composable
fun PropertiesScreen(onPropertyClick: (Int) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Text(
            "Properties",
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
            color = TextPrimary
        )
        Spacer(Modifier.height(14.dp))

        FilterBarUi(placeholder = "Filter by location, price...")
        Spacer(Modifier.height(16.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(MockData.properties) { property ->
                PropertyGridCard(property = property, onView = { onPropertyClick(property.id) })
            }
        }
    }
}

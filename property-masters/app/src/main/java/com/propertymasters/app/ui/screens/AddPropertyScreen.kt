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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.data.model.Property
import com.propertymasters.app.ui.components.RoundedPrimaryButton
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.ChipBackground
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.PropertyViewModel

@Composable
fun AddPropertyScreen(
    onBack: () -> Unit,
    onSubmitted: () -> Unit
) {
    val vm: PropertyViewModel = viewModel()

    var title by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var imageUrl by remember { mutableStateOf("") }
    var beds by remember { mutableStateOf("") }
    var baths by remember { mutableStateOf("") }
    var areaSqft by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("House") }
    var description by remember { mutableStateOf("") }
    var parking by remember { mutableStateOf("") }
    var yearBuilt by remember { mutableStateOf("") }

    val fieldModifier = Modifier.fillMaxWidth()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TealPrimary)
            }
            Text("List a Property", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
        }

        Column(modifier = Modifier.padding(20.dp)) {
            Text("Property Details", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Spacer(modifier = Modifier.height(16.dp))

            StyledTextField("Title *", title, { title = it }, "e.g. Cozy Suburban House", fieldModifier)
            Spacer(modifier = Modifier.height(12.dp))
            StyledTextField("Location *", location, { location = it }, "e.g. Kampala, Naguru", fieldModifier)
            Spacer(modifier = Modifier.height(12.dp))
            StyledTextField("Price *", price, { price = it }, "e.g. $185,000", fieldModifier)
            Spacer(modifier = Modifier.height(12.dp))
            StyledTextField("Image URL", imageUrl, { imageUrl = it }, "https://...", fieldModifier)

            Spacer(modifier = Modifier.height(16.dp))

            // Category chips
            Text("Category", fontSize = 14.sp, color = TextDark, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("House", "Condo", "Villa", "Apartment", "Commercial").forEach { cat ->
                    com.propertymasters.app.ui.components.CategoryChip(
                        label = cat,
                        isSelected = category == cat,
                        onClick = { category = cat }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StyledTextField("Beds", beds, { beds = it }, "0", Modifier.weight(1f))
                StyledTextField("Baths", baths, { baths = it }, "0", Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StyledTextField("Area (sqft)", areaSqft, { areaSqft = it }, "0", Modifier.weight(1f))
                StyledTextField("Parking", parking, { parking = it }, "0", Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(12.dp))
            StyledTextField("Year Built", yearBuilt, { yearBuilt = it }, "2024", fieldModifier)
            Spacer(modifier = Modifier.height(12.dp))
            StyledTextField(
                "Description",
                description,
                { description = it },
                "Describe your property...",
                fieldModifier,
                singleLine = false
            )

            Spacer(modifier = Modifier.height(24.dp))

            RoundedPrimaryButton(
                text = "Submit Listing",
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    if (title.isNotBlank() && location.isNotBlank() && price.isNotBlank()) {
                        val property = Property(
                            id = "p${System.currentTimeMillis()}",
                            title = title,
                            location = location,
                            price = price,
                            imageUrl = if (imageUrl.isNotBlank()) imageUrl else "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
                            beds = beds.toIntOrNull() ?: 0,
                            baths = baths.toIntOrNull() ?: 0,
                            areaSqft = areaSqft.toIntOrNull() ?: 0,
                            category = category,
                            description = description,
                            parking = parking.toIntOrNull() ?: 0,
                            yearBuilt = yearBuilt.toIntOrNull() ?: 0,
                            brokerId = "b1"
                        )
                        vm.addProperty(property)
                        onSubmitted()
                    }
                }
            )
        }
    }
}

@Composable
private fun StyledTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    singleLine: Boolean = true
) {
    Column(modifier = modifier) {
        Text(label, fontSize = 13.sp, color = TextDark, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(placeholder, color = TextMuted, fontSize = 14.sp) },
            singleLine = singleLine,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedContainerColor = Color.White,
                focusedContainerColor = Color.White,
                unfocusedBorderColor = ChipBackground,
                focusedBorderColor = TealPrimary
            )
        )
    }
}

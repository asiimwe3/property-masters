package com.propertymasters.app.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bathtub
import androidx.compose.material.icons.filled.Bed
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import coil.compose.AsyncImage
import com.propertymasters.app.data.model.Property
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted

@Composable
fun FeaturedPropertyCard(property: Property, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    Card(
        modifier = modifier.width(260.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column {
            AsyncImage(
                model = property.imageUrl,
                contentDescription = property.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.5f)
                    .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(14.dp)) {
                Text(property.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                Text(property.location, fontSize = 12.sp, color = TextMuted, modifier = Modifier.padding(top = 2.dp))
                Text(property.price, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TealPrimary, modifier = Modifier.padding(top = 6.dp))
            }
        }
    }
}

@Composable
fun PropertyGridCard(property: Property, onViewClick: () -> Unit = {}) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column {
            AsyncImage(
                model = property.imageUrl,
                contentDescription = property.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.2f)
                    .clip(RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp)),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(12.dp)) {
                Text(property.title, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = TextDark, maxLines = 1)
                Row(modifier = Modifier.padding(top = 4.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SpecTag(Icons.Filled.Bed, "${property.beds}")
                    SpecTag(Icons.Filled.Bathtub, "${property.baths}")
                }
                Text(property.price, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TealPrimary, modifier = Modifier.padding(top = 6.dp))
                RoundedPrimaryButton(text = "View", modifier = Modifier.fillMaxWidth().padding(top = 8.dp), onClick = onViewClick)
            }
        }
    }
}

@Composable
private fun SpecTag(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = TextMuted, modifier = Modifier.size(14.dp).padding(end = 3.dp))
        Text(label, fontSize = 12.sp, color = TextMuted)
    }
}

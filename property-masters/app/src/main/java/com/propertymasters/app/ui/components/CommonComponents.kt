package com.propertymasters.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.propertymasters.app.ui.theme.ChipBackground
import com.propertymasters.app.ui.theme.StarYellow
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted

@Composable
fun SearchBar(
    placeholder: String = "Search homes, condos...",
    onFilterClick: (() -> Unit)? = null
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        OutlinedTextField(
            value = "",
            onValueChange = {},
            modifier = Modifier.weight(1f),
            placeholder = { Text(placeholder, color = TextMuted, fontSize = 14.sp) },
            leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null, tint = TextMuted) },
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedContainerColor = Color.White,
                focusedContainerColor = Color.White,
                unfocusedBorderColor = ChipBackground,
                focusedBorderColor = TealPrimary
            )
        )
        if (onFilterClick != null) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(TealPrimary),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.Tune, contentDescription = "Filter", tint = Color.White)
            }
        }
    }
}

@Composable
fun RoundedPrimaryButton(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {}
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(50),
        colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
    ) {
        Text(text, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
    }
}

@Composable
fun RatingBadge(rating: Double, reviewCount: Int) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Filled.Star, contentDescription = null, tint = StarYellow, modifier = Modifier.size(14.dp))
        Text(
            text = " $rating | $reviewCount",
            fontSize = 12.sp,
            color = TextMuted,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun SectionHeader(title: String, actionText: String? = null, onActionClick: () -> Unit = {}) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
        if (actionText != null) {
            Text(
                actionText,
                fontSize = 13.sp,
                color = TealPrimary,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(4.dp)
            )
        }
    }
}

@Composable
fun CategoryChip(label: String, isSelected: Boolean = false, onClick: () -> Unit = {}) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(if (isSelected) TealPrimary else ChipBackground)
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            label,
            color = if (isSelected) Color.White else TextDark,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun RemoteAvatar(url: String, size: androidx.compose.ui.unit.Dp) {
    AsyncImage(
        model = url,
        contentDescription = null,
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
    )
}

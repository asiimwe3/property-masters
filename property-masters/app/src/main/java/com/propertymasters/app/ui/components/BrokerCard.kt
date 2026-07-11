package com.propertymasters.app.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted

@Composable
fun BrokerCard(broker: Broker, onViewProfile: () -> Unit = {}) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RemoteAvatar(broker.photoUrl, size = 56.dp)
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Text(broker.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                Text(broker.specialty, fontSize = 12.sp, color = TextMuted, modifier = Modifier.padding(top = 2.dp))
                Row(modifier = Modifier.padding(top = 4.dp)) {
                    RatingBadge(rating = broker.rating, reviewCount = broker.reviewCount)
                }
            }
            RoundedPrimaryButton(text = "View Profile", onClick = onViewProfile)
        }
    }
}

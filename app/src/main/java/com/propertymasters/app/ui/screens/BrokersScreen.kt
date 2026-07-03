package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.MockData
import com.propertymasters.app.ui.components.BrokerCard
import com.propertymasters.app.ui.components.SearchBarUi
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextPrimary

@Composable
fun BrokersScreen(onViewProfile: (Int) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Text(
            "Property Master",
            fontWeight = FontWeight.Medium,
            fontSize = 13.sp,
            color = TealPrimary
        )
        Text(
            "Brokers",
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
            color = TextPrimary
        )
        Spacer(Modifier.height(14.dp))

        SearchBarUi(placeholder = "Search by name, specialty...")
        Spacer(Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(MockData.brokers) { broker ->
                BrokerCard(broker = broker, onViewProfile = { onViewProfile(broker.id) })
            }
            item { Spacer(Modifier.height(70.dp)) }
        }
    }
}

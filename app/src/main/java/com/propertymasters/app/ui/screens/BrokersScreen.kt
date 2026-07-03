package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.Broker
import com.propertymasters.app.data.FirebaseRepository
import com.propertymasters.app.ui.components.BrokerCard
import com.propertymasters.app.ui.components.SearchBarUi
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextPrimary

@Composable
fun BrokersScreen(onViewProfile: (Int) -> Unit) {
    var brokers by remember { mutableStateOf<List<Broker>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        brokers = FirebaseRepository.getBrokers()
        isLoading = false
    }

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

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = TealPrimary)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(brokers) { broker ->
                    BrokerCard(broker = broker, onViewProfile = { onViewProfile(broker.id) })
                }
                item { Spacer(Modifier.height(70.dp)) }
            }
        }
    }
}

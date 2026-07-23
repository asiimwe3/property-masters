package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.ui.components.BrokerCard
import com.propertymasters.app.ui.components.SearchBar
import com.propertymasters.app.ui.components.SectionHeader
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.viewmodel.BrokerViewModel

@Composable
fun BrokersScreen(
    onBrokerClick: (String) -> Unit
) {
    val vm: BrokerViewModel = viewModel()

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
                SectionHeader(title = "Find a Broker")
                Spacer(modifier = Modifier.height(12.dp))
                SearchBar(
                    placeholder = "Search brokers...",
                    onFilterClick = null,
                    onSearchChange = { vm.updateSearchQuery(it) }
                )
            }
        }

        items(vm.filteredBrokers) { broker ->
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp)) {
                BrokerCard(broker = broker, onViewProfile = { onBrokerClick(broker.id) })
            }
        }
    }
}

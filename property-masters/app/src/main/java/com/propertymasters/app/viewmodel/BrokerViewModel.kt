package com.propertymasters.app.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.data.repository.MockDataRepository

class BrokerViewModel : ViewModel() {

    private val allBrokers = MockDataRepository.brokers

    var searchQuery by mutableStateOf("")
        private set

    val filteredBrokers: List<Broker>
        get() {
            if (searchQuery.isBlank()) return allBrokers
            val q = searchQuery.lowercase()
            return allBrokers.filter {
                it.name.lowercase().contains(q) ||
                it.specialty.lowercase().contains(q)
            }
        }

    fun updateSearchQuery(query: String) {
        searchQuery = query
    }

    fun getBrokerById(id: String): Broker? = MockDataRepository.getBrokerById(id)

    fun getPropertiesByBroker(brokerId: String) =
        MockDataRepository.getPropertiesByBroker(brokerId)
}

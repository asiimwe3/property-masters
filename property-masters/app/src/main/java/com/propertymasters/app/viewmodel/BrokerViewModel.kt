package com.propertymasters.app.viewmodel

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.data.repository.FirebaseRepository
import com.propertymasters.app.data.repository.MockDataRepository
import kotlinx.coroutines.launch

class BrokerViewModel : ViewModel() {

    private val TAG = "BrokerVM"

    private var allBrokers = MockDataRepository.brokers

    var isLoading by mutableStateOf(true)
        private set

    var searchQuery by mutableStateOf("")
        private set

    init {
        loadBrokers()
    }

    private fun loadBrokers() {
        viewModelScope.launch {
            isLoading = true
            try {
                allBrokers = FirebaseRepository.fetchBrokers()
                Log.i(TAG, "Loaded ${allBrokers.size} brokers")
            } catch (e: Exception) {
                Log.w(TAG, "Failed to load brokers, using mock", e)
                allBrokers = MockDataRepository.brokers
            } finally {
                isLoading = false
            }
        }
    }

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

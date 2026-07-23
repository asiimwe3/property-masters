package com.propertymasters.app.viewmodel

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.propertymasters.app.data.model.Property
import com.propertymasters.app.data.repository.FirebaseRepository
import com.propertymasters.app.data.repository.MockDataRepository
import kotlinx.coroutines.launch

class PropertyViewModel : ViewModel() {

    private val TAG = "PropertyVM"

    private var allProperties = MockDataRepository.properties

    var isLoading by mutableStateOf(true)
        private set

    var searchQuery by mutableStateOf("")
        private set

    var selectedCategory by mutableStateOf("All")
        private set

    var minPrice by mutableStateOf(0)
        private set

    var maxPrice by mutableStateOf(700_000)
        private set

    var minBeds by mutableStateOf(0)
        private set

    var showFilters by mutableStateOf(false)
        private set

    val savedPropertyIds = mutableStateListOf<String>()

    val categories = FirebaseRepository.propertyCategories

    init {
        loadProperties()
    }

    private fun loadProperties() {
        viewModelScope.launch {
            isLoading = true
            try {
                allProperties = FirebaseRepository.fetchProperties()
                Log.i(TAG, "Loaded ${allProperties.size} properties (mock=${FirebaseRepository.useMockData})")
            } catch (e: Exception) {
                Log.w(TAG, "Failed to load properties, using mock", e)
                allProperties = MockDataRepository.properties
            } finally {
                isLoading = false
            }
        }
    }

    val filteredProperties: List<Property>
        get() {
            var result = allProperties

            if (selectedCategory != "All") {
                result = result.filter { it.category == selectedCategory }
            }

            if (searchQuery.isNotBlank()) {
                val q = searchQuery.lowercase()
                result = result.filter {
                    it.title.lowercase().contains(q) ||
                    it.location.lowercase().contains(q) ||
                    it.category.lowercase().contains(q)
                }
            }

            val priceToInt: (String) -> Int = { s ->
                s.replace(Regex("[^0-9]"), "").toIntOrNull() ?: 0
            }

            result = result.filter { p ->
                val price = priceToInt(p.price)
                price in minPrice..maxPrice
            }

            if (minBeds > 0) {
                result = result.filter { it.beds >= minBeds }
            }

            return result
        }

    val featuredProperties: List<Property>
        get() = allProperties.filter { it.isFeatured }

    fun updateSearchQuery(query: String) {
        searchQuery = query
    }

    fun updateCategory(category: String) {
        selectedCategory = category
    }

    fun updatePriceRange(min: Int, max: Int) {
        minPrice = min
        maxPrice = max
    }

    fun updateMinBeds(beds: Int) {
        minBeds = beds
    }

    fun toggleFilters() {
        showFilters = !showFilters
    }

    fun resetFilters() {
        searchQuery = ""
        selectedCategory = "All"
        minPrice = 0
        maxPrice = 700_000
        minBeds = 0
    }

    fun toggleSave(propertyId: String) {
        if (savedPropertyIds.contains(propertyId)) {
            savedPropertyIds.remove(propertyId)
        } else {
            savedPropertyIds.add(propertyId)
        }
    }

    fun isSaved(propertyId: String): Boolean = savedPropertyIds.contains(propertyId)

    fun getSavedProperties(): List<Property> =
        allProperties.filter { savedPropertyIds.contains(it.id) }

    fun addProperty(property: Property) {
        allProperties = listOf(property) + allProperties
        viewModelScope.launch {
            FirebaseRepository.addPropertyToFirestore(property)
        }
    }
}

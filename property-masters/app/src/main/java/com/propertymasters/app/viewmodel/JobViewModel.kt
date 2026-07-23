package com.propertymasters.app.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.data.repository.MockDataRepository

class JobViewModel : ViewModel() {

    private val allJobs = MockDataRepository.jobs

    var searchQuery by mutableStateOf("")
        private set

    var selectedCategory by mutableStateOf("All")
        private set

    val categories = MockDataRepository.jobCategories

    val filteredJobs: List<Job>
        get() {
            var result = allJobs

            if (selectedCategory != "All") {
                result = result.filter { it.category == selectedCategory }
            }

            if (searchQuery.isNotBlank()) {
                val q = searchQuery.lowercase()
                result = result.filter {
                    it.title.lowercase().contains(q) ||
                    it.company.lowercase().contains(q) ||
                    it.location.lowercase().contains(q)
                }
            }

            return result
        }

    fun updateSearchQuery(query: String) {
        searchQuery = query
    }

    fun updateCategory(category: String) {
        selectedCategory = category
    }

    fun getJobById(id: String): Job? = MockDataRepository.getJobById(id)
}

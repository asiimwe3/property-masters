package com.propertymasters.app.viewmodel

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.data.repository.FirebaseRepository
import com.propertymasters.app.data.repository.MockDataRepository
import kotlinx.coroutines.launch

class JobViewModel : ViewModel() {

    private val TAG = "JobVM"

    private var allJobs = MockDataRepository.jobs

    var isLoading by mutableStateOf(true)
        private set

    var searchQuery by mutableStateOf("")
        private set

    var selectedCategory by mutableStateOf("All")
        private set

    val categories = FirebaseRepository.jobCategories

    init {
        loadJobs()
    }

    private fun loadJobs() {
        viewModelScope.launch {
            isLoading = true
            try {
                allJobs = FirebaseRepository.fetchJobs()
                Log.i(TAG, "Loaded ${allJobs.size} jobs")
            } catch (e: Exception) {
                Log.w(TAG, "Failed to load jobs, using mock", e)
                allJobs = MockDataRepository.jobs
            } finally {
                isLoading = false
            }
        }
    }

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

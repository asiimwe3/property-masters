package com.propertymasters.app.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.propertymasters.app.data.model.UserProfile
import com.propertymasters.app.data.repository.MockDataRepository

class AppViewModel : ViewModel() {

    var isLoggedIn by mutableStateOf(false)
        private set

    var currentUser by mutableStateOf<UserProfile?>(null)
        private set

    var showLogin by mutableStateOf(false)
        private set

    init {
        // Start with the mock user logged in for demo purposes
        currentUser = MockDataRepository.currentUser
        isLoggedIn = true
    }

    fun login(email: String, password: String): Boolean {
        if (email.isNotBlank() && password.length >= 4) {
            currentUser = UserProfile(
                name = email.substringBefore("@").replace(".", " ")
                    .replaceFirstChar { it.uppercase() },
                email = email,
                photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
                isVerified = false,
                phone = "",
                joinedDate = "Today",
                savedProperties = emptyList(),
                listedProperties = emptyList()
            )
            isLoggedIn = true
            showLogin = false
            return true
        }
        return false
    }

    fun signup(name: String, email: String, password: String): Boolean {
        if (name.isNotBlank() && email.isNotBlank() && password.length >= 4) {
            currentUser = UserProfile(
                name = name,
                email = email,
                photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
                isVerified = false,
                phone = "",
                joinedDate = "Today",
                savedProperties = emptyList(),
                listedProperties = emptyList()
            )
            isLoggedIn = true
            showLogin = false
            return true
        }
        return false
    }

    fun logout() {
        isLoggedIn = false
        currentUser = null
    }

    fun showLoginScreen() {
        showLogin = true
    }

    fun dismissLogin() {
        showLogin = false
    }
}

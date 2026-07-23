package com.propertymasters.app.viewmodel

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.propertymasters.app.data.model.UserProfile
import com.propertymasters.app.data.repository.FirebaseRepository
import com.propertymasters.app.data.repository.MockDataRepository
import kotlinx.coroutines.launch

class AppViewModel : ViewModel() {

    private val TAG = "AppVM"

    var isLoggedIn by mutableStateOf(false)
        private set

    var currentUser by mutableStateOf<UserProfile?>(null)
        private set

    var showLogin by mutableStateOf(false)
        private set

    var authError by mutableStateOf("")
        private set

    init {
        // Check if Firebase user is already logged in
        val firebaseUser = FirebaseRepository.getCurrentFirebaseUser()
        if (firebaseUser != null) {
            currentUser = UserProfile(
                name = firebaseUser.displayName ?: "User",
                email = firebaseUser.email ?: "",
                photoUrl = firebaseUser.photoUrl?.toString() ?: "https://randomuser.me/api/portraits/women/65.jpg",
                isVerified = firebaseUser.isEmailVerified,
                phone = firebaseUser.phoneNumber ?: "",
                joinedDate = "Today",
                savedProperties = emptyList(),
                listedProperties = emptyList()
            )
            isLoggedIn = true
        } else {
            // Start with mock user for demo (works without Firebase)
            currentUser = MockDataRepository.currentUser
            isLoggedIn = true
        }
    }

    fun login(email: String, password: String): Boolean {
        if (email.isNotBlank() && password.length >= 4) {
            // Try Firebase Auth first
            viewModelScope.launch {
                val result = FirebaseRepository.signInWithEmail(email, password)
                if (result.isSuccess) {
                    val user = result.getOrNull()!!
                    currentUser = UserProfile(
                        name = user.displayName ?: email.substringBefore("@").replace(".", " ")
                            .replaceFirstChar { it.uppercase() },
                        email = user.email ?: email,
                        photoUrl = user.photoUrl?.toString() ?: "https://randomuser.me/api/portraits/women/65.jpg",
                        isVerified = user.isEmailVerified,
                        phone = user.phoneNumber ?: "",
                        joinedDate = "Today"
                    )
                    isLoggedIn = true
                    authError = ""
                    Log.i(TAG, "Firebase login success: ${user.email}")
                } else {
                    // Firebase failed — use local login as fallback
                    Log.w(TAG, "Firebase auth failed, using local login", result.exceptionOrNull())
                    localLogin(email)
                }
            }
            // Return true optimistically (UI updates via state)
            return true
        }
        return false
    }

    fun signup(name: String, email: String, password: String): Boolean {
        if (name.isNotBlank() && email.isNotBlank() && password.length >= 4) {
            viewModelScope.launch {
                val result = FirebaseRepository.signUpWithEmail(name, email, password)
                if (result.isSuccess) {
                    val user = result.getOrNull()!!
                    currentUser = UserProfile(
                        name = name,
                        email = user.email ?: email,
                        photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
                        isVerified = false,
                        phone = "",
                        joinedDate = "Today"
                    )
                    isLoggedIn = true
                    authError = ""
                    Log.i(TAG, "Firebase signup success: ${user.email}")
                } else {
                    // Firebase failed — use local signup as fallback
                    Log.w(TAG, "Firebase signup failed, using local signup", result.exceptionOrNull())
                    localSignup(name, email)
                }
            }
            return true
        }
        return false
    }

    private fun localLogin(email: String) {
        currentUser = UserProfile(
            name = email.substringBefore("@").replace(".", " ")
                .replaceFirstChar { it.uppercase() },
            email = email,
            photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
            isVerified = false,
            phone = "",
            joinedDate = "Today"
        )
        isLoggedIn = true
    }

    private fun localSignup(name: String, email: String) {
        currentUser = UserProfile(
            name = name,
            email = email,
            photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
            isVerified = false,
            phone = "",
            joinedDate = "Today"
        )
        isLoggedIn = true
    }

    fun logout() {
        FirebaseRepository.signOut()
        isLoggedIn = false
        currentUser = null
    }

    fun showLoginScreen() {
        showLogin = true
    }

    fun dismissLogin() {
        showLogin = false
    }

    fun clearAuthError() {
        authError = ""
    }
}

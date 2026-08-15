package com.propertymasters.app.viewmodel

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.propertymasters.app.data.model.UserProfile
import com.propertymasters.app.data.repository.MockDataRepository
import com.propertymasters.app.data.repository.SupabaseRepository
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
        // Check if Supabase user is already logged in
        if (SupabaseRepository.isSignedIn) {
            currentUser = UserProfile(
                name = "User",
                email = "",
                photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
                isVerified = false,
                phone = "",
                joinedDate = "Today",
                savedProperties = emptyList(),
                listedProperties = emptyList()
            )
            isLoggedIn = true
        } else {
            // Start with mock user for demo
            currentUser = MockDataRepository.currentUser
            isLoggedIn = true
        }
    }

    fun login(email: String, password: String): Boolean {
        if (email.isNotBlank() && password.length >= 4) {
            viewModelScope.launch {
                val result = SupabaseRepository.signInWithEmail(email, password)
                if (result.isSuccess) {
                    val json = result.getOrNull()!!
                    val userJson = json.optJSONObject("user")
                    val meta = userJson?.optJSONObject("user_metadata") ?: json.optJSONObject("data")
                    currentUser = UserProfile(
                        name = meta?.optString("full_name")
                            ?: email.substringBefore("@").replace(".", " ")
                                .replaceFirstChar { it.uppercase() },
                        email = json.optString("email", userJson?.optString("email", email)),
                        photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
                        isVerified = json.optBoolean("email_confirmed", false),
                        phone = "",
                        joinedDate = "Today"
                    )
                    isLoggedIn = true
                    authError = ""
                    Log.i(TAG, "Supabase login success: ${currentUser?.email}")
                } else {
                    Log.w(TAG, "Supabase auth failed, using local login", result.exceptionOrNull())
                    localLogin(email)
                }
            }
            return true
        }
        return false
    }

    fun signup(name: String, email: String, password: String): Boolean {
        if (name.isNotBlank() && email.isNotBlank() && password.length >= 4) {
            viewModelScope.launch {
                val result = SupabaseRepository.signUpWithEmail(name, email, password)
                if (result.isSuccess) {
                    currentUser = UserProfile(
                        name = name,
                        email = email,
                        photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
                        isVerified = false,
                        phone = "",
                        joinedDate = "Today"
                    )
                    isLoggedIn = true
                    authError = ""
                    Log.i(TAG, "Supabase signup success: $email")
                } else {
                    Log.w(TAG, "Supabase signup failed, using local signup", result.exceptionOrNull())
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
        SupabaseRepository.signOut()
        isLoggedIn = false
        currentUser = null
    }

    fun showLoginScreen() { showLogin = true }
    fun dismissLogin() { showLogin = false }
    fun clearAuthError() { authError = "" }
}

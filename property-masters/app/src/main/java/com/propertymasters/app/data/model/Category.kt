package com.propertymasters.app.data.model

import androidx.compose.ui.graphics.vector.ImageVector

data class ExploreCategory(
    val name: String,
    val icon: ImageVector
)

data class UserProfile(
    val name: String,
    val email: String,
    val photoUrl: String,
    val isVerified: Boolean
)

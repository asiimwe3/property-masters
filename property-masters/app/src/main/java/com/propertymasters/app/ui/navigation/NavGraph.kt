package com.propertymasters.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Work
import androidx.compose.material.icons.outlined.Business
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Work
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(
    val route: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object Home : Screen("home", "Home", Icons.Filled.Home, Icons.Outlined.Home)
    object Properties : Screen("properties", "Properties", Icons.Filled.Business, Icons.Outlined.Business)
    object Brokers : Screen("brokers", "Brokers", Icons.Filled.Person, Icons.Outlined.Person)
    object Jobs : Screen("jobs", "Jobs", Icons.Filled.Work, Icons.Outlined.Work)
    object Account : Screen("account", "Account", Icons.Filled.Person, Icons.Outlined.Person)
}

sealed class DetailScreen(val route: String) {
    object PropertyDetail : DetailScreen("property/{propertyId}") {
        fun createRoute(propertyId: String) = "property/$propertyId"
    }
    object BrokerDetail : DetailScreen("broker/{brokerId}") {
        fun createRoute(brokerId: String) = "broker/$brokerId"
    }
    object JobDetail : DetailScreen("job/{jobId}") {
        fun createRoute(jobId: String) = "job/$jobId"
    }
    object AddProperty : DetailScreen("add_property")
    object Login : DetailScreen("login")
    object BookViewing : DetailScreen("book/{propertyTitle}") {
        fun createRoute(propertyTitle: String) = "book/${java.net.URLEncoder.encode(propertyTitle, "UTF-8")}"
    }
    object BookViewingWithId : DetailScreen("book_id/{propertyId}/{propertyTitle}") {
        fun createRoute(propertyId: String, propertyTitle: String) =
            "book_id/${propertyId}/${java.net.URLEncoder.encode(propertyTitle, "UTF-8")}"
    }
    object Contact : DetailScreen("contact")
    object BrokerRegister : DetailScreen("broker_register")
    object Plans : DetailScreen("plans")
    object Projects : DetailScreen("projects")
    object Faq : DetailScreen("faq")
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Properties,
    Screen.Brokers,
    Screen.Jobs,
    Screen.Account
)

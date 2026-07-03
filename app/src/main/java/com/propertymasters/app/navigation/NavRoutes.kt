package com.propertymasters.app.navigation

sealed class NavRoutes(val route: String, val label: String, val icon: String) {
    object Home : NavRoutes("home", "Home", "🏠")
    object Properties : NavRoutes("properties", "Properties", "🏘")
    object Brokers : NavRoutes("brokers", "Brokers", "👨‍💼")
    object Jobs : NavRoutes("jobs", "Jobs", "💼")
    object Account : NavRoutes("account", "Account", "👤")

    companion object {
        val bottomNavItems = listOf(Home, Properties, Brokers, Jobs, Account)
    }
}

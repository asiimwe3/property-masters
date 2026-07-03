package com.propertymasters.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.propertymasters.app.navigation.NavRoutes
import com.propertymasters.app.ui.components.BottomNavBar
import com.propertymasters.app.ui.screens.AccountScreen
import com.propertymasters.app.ui.screens.BrokersScreen
import com.propertymasters.app.ui.screens.HomeScreen
import com.propertymasters.app.ui.screens.JobsScreen
import com.propertymasters.app.ui.screens.PropertiesScreen
import com.propertymasters.app.ui.theme.PropertyMastersTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PropertyMastersTheme {
                Surface {
                    PropertyMastersApp()
                }
            }
        }
    }
}

@Composable
fun PropertyMastersApp() {
    val navController: NavHostController = rememberNavController()

    Scaffold(
        bottomBar = { BottomNavBar(navController) }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = NavRoutes.Home.route,
            modifier = Modifier.padding(bottom = innerPadding.calculateBottomPadding())
        ) {
            composable(NavRoutes.Home.route) {
                HomeScreen(onPropertyClick = { /* navigate to property detail (future) */ })
            }
            composable(NavRoutes.Properties.route) {
                PropertiesScreen(onPropertyClick = { /* navigate to property detail (future) */ })
            }
            composable(NavRoutes.Brokers.route) {
                BrokersScreen(onViewProfile = { /* navigate to broker profile (future) */ })
            }
            composable(NavRoutes.Jobs.route) {
                JobsScreen(onApply = { /* navigate to job application (future) */ })
            }
            composable(NavRoutes.Account.route) {
                AccountScreen(onLogout = { /* handle logout (future) */ })
            }
        }
    }
}

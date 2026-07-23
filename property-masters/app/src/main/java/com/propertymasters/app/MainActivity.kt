package com.propertymasters.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.propertymasters.app.ui.navigation.DetailScreen
import com.propertymasters.app.ui.navigation.Screen
import com.propertymasters.app.ui.navigation.bottomNavItems
import com.propertymasters.app.ui.screens.AccountScreen
import com.propertymasters.app.ui.screens.AddPropertyScreen
import com.propertymasters.app.ui.screens.BrokerDetailScreen
import com.propertymasters.app.ui.screens.BrokersScreen
import com.propertymasters.app.ui.screens.HomeScreen
import com.propertymasters.app.ui.screens.JobDetailScreen
import com.propertymasters.app.ui.screens.JobsScreen
import com.propertymasters.app.ui.screens.LoginScreen
import com.propertymasters.app.ui.screens.PropertyDetailScreen
import com.propertymasters.app.ui.screens.PropertiesScreen
import com.propertymasters.app.ui.theme.PropertyMastersTheme
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextMuted

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PropertyMastersTheme {
                PropertyMastersApp()
            }
        }
    }
}

@Composable
fun PropertyMastersApp() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    val showBottomBar = currentRoute in bottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = Color.White,
                    tonalElevation = 8.dp
                ) {
                    bottomNavItems.forEach { screen ->
                        val isSelected = currentRoute == screen.route
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.startDestinationId)
                                    launchSingleTop = true
                                }
                            },
                            icon = {
                                Icon(
                                    if (isSelected) screen.selectedIcon else screen.unselectedIcon,
                                    contentDescription = screen.label,
                                    tint = if (isSelected) TealPrimary else TextMuted
                                )
                            },
                            label = {
                                Text(
                                    screen.label,
                                    color = if (isSelected) TealPrimary else TextMuted,
                                    fontSize = 11.sp
                                )
                            },
                            colors = androidx.compose.material3.NavigationBarItemDefaults.colors(
                                indicatorColor = TealPrimary.copy(alpha = 0.1f)
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onPropertyClick = { id -> navController.navigate(DetailScreen.PropertyDetail.createRoute(id)) },
                    onBrokerClick = { id -> navController.navigate(DetailScreen.BrokerDetail.createRoute(id)) },
                    onSearchClick = { navController.navigate(Screen.Properties.route) }
                )
            }

            composable(Screen.Properties.route) {
                PropertiesScreen(
                    onPropertyClick = { id -> navController.navigate(DetailScreen.PropertyDetail.createRoute(id)) }
                )
            }

            composable(Screen.Brokers.route) {
                BrokersScreen(
                    onBrokerClick = { id -> navController.navigate(DetailScreen.BrokerDetail.createRoute(id)) }
                )
            }

            composable(Screen.Jobs.route) {
                JobsScreen(
                    onJobClick = { id -> navController.navigate(DetailScreen.JobDetail.createRoute(id)) }
                )
            }

            composable(Screen.Account.route) {
                AccountScreen(
                    onPropertyClick = { id -> navController.navigate(DetailScreen.PropertyDetail.createRoute(id)) },
                    onAddProperty = { navController.navigate(DetailScreen.AddProperty.route) },
                    onLogout = { navController.navigate(DetailScreen.Login.route) }
                )
            }

            composable(
                route = DetailScreen.PropertyDetail.route,
                arguments = listOf(navArgument("propertyId") { type = NavType.StringType })
            ) { entry ->
                val propertyId = entry.arguments?.getString("propertyId") ?: ""
                PropertyDetailScreen(
                    propertyId = propertyId,
                    onBack = { navController.popBackStack() },
                    onBrokerClick = { id -> navController.navigate(DetailScreen.BrokerDetail.createRoute(id)) }
                )
            }

            composable(
                route = DetailScreen.BrokerDetail.route,
                arguments = listOf(navArgument("brokerId") { type = NavType.StringType })
            ) { entry ->
                val brokerId = entry.arguments?.getString("brokerId") ?: ""
                BrokerDetailScreen(
                    brokerId = brokerId,
                    onBack = { navController.popBackStack() },
                    onPropertyClick = { id -> navController.navigate(DetailScreen.PropertyDetail.createRoute(id)) }
                )
            }

            composable(
                route = DetailScreen.JobDetail.route,
                arguments = listOf(navArgument("jobId") { type = NavType.StringType })
            ) { entry ->
                val jobId = entry.arguments?.getString("jobId") ?: ""
                JobDetailScreen(
                    jobId = jobId,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(DetailScreen.AddProperty.route) {
                AddPropertyScreen(
                    onBack = { navController.popBackStack() },
                    onSubmitted = { navController.popBackStack() }
                )
            }

            composable(DetailScreen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(navController.graph.startDestinationId)
                            launchSingleTop = true
                        }
                    }
                )
            }
        }
    }
}

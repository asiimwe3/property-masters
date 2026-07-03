package com.propertymasters.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.propertymasters.app.data.AuthRepository
import com.propertymasters.app.navigation.NavRoutes
import com.propertymasters.app.ui.components.BottomNavBar
import com.propertymasters.app.ui.screens.AccountScreen
import com.propertymasters.app.ui.screens.AuthScreen
import com.propertymasters.app.ui.screens.BrokersScreen
import com.propertymasters.app.ui.screens.HomeScreen
import com.propertymasters.app.ui.screens.JobsScreen
import com.propertymasters.app.ui.screens.PropertiesScreen
import com.propertymasters.app.ui.theme.PropertyMastersTheme
import com.propertymasters.app.update.UpdateAvailableDialog
import com.propertymasters.app.update.UpdateChecker
import com.propertymasters.app.update.UpdateInfo

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PropertyMastersTheme {
                Surface {
                    PropertyMastersRoot()
                }
            }
        }
    }
}

@Composable
fun PropertyMastersRoot() {
    var isLoggedIn by remember { mutableStateOf(AuthRepository.isLoggedIn()) }
    var updateInfo by remember { mutableStateOf<UpdateInfo?>(null) }

    LaunchedEffect(Unit) {
        updateInfo = UpdateChecker.checkForUpdate(BuildConfig.VERSION_CODE)
    }

    updateInfo?.let { info ->
        UpdateAvailableDialog(update = info, onDismiss = { updateInfo = null })
    }

    if (isLoggedIn) {
        PropertyMastersApp(onLogout = {
            AuthRepository.signOut()
            isLoggedIn = false
        })
    } else {
        AuthScreen(onAuthenticated = { isLoggedIn = true })
    }
}

@Composable
fun PropertyMastersApp(onLogout: () -> Unit) {
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
                AccountScreen(onLogout = onLogout)
            }
        }
    }
}

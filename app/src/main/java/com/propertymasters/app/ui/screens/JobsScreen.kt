package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.FirebaseRepository
import com.propertymasters.app.data.Job
import com.propertymasters.app.ui.components.JobCard
import com.propertymasters.app.ui.components.PillTab
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextPrimary

@Composable
fun JobsScreen(onApply: (Int) -> Unit) {
    var selectedTab by remember { mutableStateOf("All Jobs") }
    var jobs by remember { mutableStateOf<List<Job>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val tabs = listOf("All Jobs", "Agents", "Project Managers")

    LaunchedEffect(Unit) {
        jobs = FirebaseRepository.getJobs()
        isLoading = false
    }

    val filteredJobs = when (selectedTab) {
        "Agents" -> jobs.filter { it.category == "Agents" }
        "Project Managers" -> jobs.filter { it.category == "Project Managers" }
        else -> jobs
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Text(
            "Real Estate Jobs",
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
            color = TextPrimary
        )
        Spacer(Modifier.height(14.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            tabs.forEach { tab ->
                PillTab(label = tab, selected = selectedTab == tab, onClick = { selectedTab = tab })
            }
        }

        Spacer(Modifier.height(16.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = TealPrimary)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(filteredJobs) { job ->
                    JobCard(job = job, onApply = { onApply(job.id) })
                }
                item { Spacer(Modifier.height(70.dp)) }
            }
        }
    }
}

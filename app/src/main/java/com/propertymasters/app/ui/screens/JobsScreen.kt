package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.MockData
import com.propertymasters.app.ui.components.JobCard
import com.propertymasters.app.ui.components.PillTab
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TextPrimary

@Composable
fun JobsScreen(onApply: (Int) -> Unit) {
    var selectedTab by remember { mutableStateOf("All Jobs") }
    val tabs = listOf("All Jobs", "Agents", "Project Managers")

    val filteredJobs = when (selectedTab) {
        "Agents" -> MockData.jobs.filter { it.category == "Agents" }
        "Project Managers" -> MockData.jobs.filter { it.category == "Project Managers" }
        else -> MockData.jobs
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

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(filteredJobs) { job ->
                JobCard(job = job, onApply = { onApply(job.id) })
            }
            item { Spacer(Modifier.height(70.dp)) }
        }
    }
}

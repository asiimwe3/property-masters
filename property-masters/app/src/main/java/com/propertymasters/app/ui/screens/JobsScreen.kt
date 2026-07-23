package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.ui.components.CategoryChip
import com.propertymasters.app.ui.components.SearchBar
import com.propertymasters.app.ui.components.SectionHeader
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TealLight
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.JobViewModel

@Composable
fun JobsScreen(
    onJobClick: (String) -> Unit
) {
    val vm: JobViewModel = viewModel()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray)
    ) {
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                SectionHeader(title = "Job Opportunities")
                Spacer(modifier = Modifier.height(12.dp))
                SearchBar(placeholder = "Search jobs...", onFilterClick = null, onSearchChange = { vm.updateSearchQuery(it) })
                Spacer(modifier = Modifier.height(12.dp))

                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(vm.categories) { category ->
                        CategoryChip(
                            label = category,
                            isSelected = vm.selectedCategory == category,
                            onClick = { vm.updateCategory(category) }
                        )
                    }
                }
            }
        }

        item {
            Text(
                "${vm.filteredJobs.size} jobs found",
                fontSize = 13.sp,
                color = TextMuted,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
            )
        }

        items(vm.filteredJobs) { job ->
            JobCard(job = job, onClick = { onJobClick(job.id) })
        }
    }
}

@Composable
private fun JobCard(job: Job, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        onClick = onClick
    ) {
        Row(modifier = Modifier.padding(16.dp)) {
            // Job icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(TealLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.Work, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(24.dp))
            }

            Column(
                modifier = Modifier
                    .padding(start = 12.dp)
                    .weight(1f)
            ) {
                Text(job.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                Text(job.company, fontSize = 13.sp, color = TealPrimary, modifier = Modifier.padding(top = 2.dp))

                Row(
                    modifier = Modifier.padding(top = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Filled.LocationOn, contentDescription = null, tint = TextMuted, modifier = Modifier.size(12.dp))
                    Text(job.location, fontSize = 12.sp, color = TextMuted, modifier = Modifier.padding(start = 3.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Icon(Icons.Filled.AccessTime, contentDescription = null, tint = TextMuted, modifier = Modifier.size(12.dp))
                    Text(
                        if (job.postedDaysAgo == 0) " Today" else " ${job.postedDaysAgo}d ago",
                        fontSize = 12.sp,
                        color = TextMuted,
                        modifier = Modifier.padding(start = 3.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(TealLight)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(job.jobType, fontSize = 11.sp, color = TealPrimary, fontWeight = FontWeight.Medium)
                    }
                    Text(job.salary, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextDark)
                }
            }
        }
    }
}

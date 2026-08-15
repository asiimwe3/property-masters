package com.propertymasters.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectsScreen(onBack: () -> Unit) {
    val sagecoTeal = Color(0xFF0F766E)
    val sagecoLight = Color(0xFFCCFBF1)

    val projects = listOf(
        ProjectData(
            "Agro-Forestry Land Partnerships",
            "Western Uganda",
            "Open for partners",
            "Connect landowners and investors with tree-based farming projects that protect soil, improve yields, and create long-term land value.",
            listOf("Tree planting", "Soil protection", "Farmer income")
        ),
        ProjectData(
            "Eco Lodge and Nature Stay Sites",
            "Kyenjojo and surrounding districts",
            "Site identification",
            "Identify scenic, low-impact land suitable for eco lodges, nature stays, camping, and responsible tourism developments.",
            listOf("Eco tourism", "Low-impact building", "Local jobs")
        ),
        ProjectData(
            "Solar-Ready Property Development",
            "Uganda",
            "Planning",
            "Promote properties that can support solar installations, reliable water systems, and lower operating costs for homes and businesses.",
            listOf("Solar power", "Water systems", "Efficient buildings")
        ),
        ProjectData(
            "Community Nursery Beds",
            "Kyenjojo",
            "Community proposal",
            "Support local seedling production for fruit trees, shade trees, boundary planting, and restoration of degraded land.",
            listOf("Seedlings", "Youth work", "Restoration")
        ),
    )

    val impact = listOf("4" to "Project tracks", "UGX" to "Local investment", "Green" to "Property category", "Open" to "Partner enquiries")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Green Projects", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = sagecoTeal, titleContentColor = Color.White, navigationIconContentColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)
        ) {
            // Hero
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = sagecoTeal)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Sustainable real estate", fontSize = 12.sp, color = sagecoLight, fontWeight = FontWeight.Bold)
                    Text("Green Projects in Uganda", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(vertical = 8.dp))
                    Text("Connecting land, property, and investment with practical environmental projects.", fontSize = 13.sp, color = sagecoLight)
                }
            }

            Spacer(Modifier.height(12.dp))

            // Impact stats
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                impact.forEach { (value, label) ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = sagecoTeal)
                        Text(label, fontSize = 10.sp, color = Color.Gray)
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            Text("Active Green Project Areas", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = sagecoTeal, modifier = Modifier.padding(bottom = 12.dp))

            projects.forEach { project ->
                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(project.title, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text(project.location, fontSize = 12.sp, color = Color.Gray)
                            }
                            AssistChip(
                                onClick = {},
                                label = { Text(project.status, fontSize = 10.sp) },
                                colors = AssistChipDefaults.assistChipColors(containerColor = sagecoLight, labelColor = sagecoTeal)
                            )
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(project.summary, fontSize = 13.sp, color = Color.Gray)
                        Spacer(Modifier.height(8.dp))
                        Row {
                            project.focus.forEach { tag ->
                                AssistChip(
                                    onClick = {},
                                    label = { Text(tag, fontSize = 10.sp) },
                                    modifier = Modifier.padding(end = 4.dp),
                                    colors = AssistChipDefaults.assistChipColors(containerColor = Color(0xFFF3F4F6))
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

private data class ProjectData(
    val title: String,
    val location: String,
    val status: String,
    val summary: String,
    val focus: List<String>
)

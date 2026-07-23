package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.data.repository.MockDataRepository
import com.propertymasters.app.ui.components.RoundedPrimaryButton
import com.propertymasters.app.ui.theme.BackgroundGray
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TealLight
import com.propertymasters.app.ui.theme.TextDark
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.viewmodel.JobViewModel

@Composable
fun JobDetailScreen(
    jobId: String,
    onBack: () -> Unit
) {
    val vm: JobViewModel = viewModel()
    val job = MockDataRepository.getJobById(jobId)

    if (job == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Job not found", color = TextMuted)
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(TealPrimary, TealPrimary.copy(alpha = 0.9f))))
                .statusBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text("Job Details", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Filled.Work, contentDescription = null, tint = Color.White, modifier = Modifier.size(28.dp))
                }
                Column(modifier = Modifier.padding(start = 12.dp)) {
                    Text(job.title, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(job.company, fontSize = 14.sp, color = Color.White.copy(alpha = 0.85f))
                }
            }
        }

        Column(modifier = Modifier.padding(20.dp)) {
            // Quick info
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = androidx.compose.material3.CardDefaults.cardColors(containerColor = Color.White),
                elevation = androidx.compose.material3.CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    InfoRow(Icons.Filled.LocationOn, "Location", job.location)
                    Spacer(modifier = Modifier.height(8.dp))
                    InfoRow(Icons.Filled.AccessTime, "Type", job.jobType)
                    Spacer(modifier = Modifier.height(8.dp))
                    InfoRow(Icons.Filled.Business, "Category", job.category)
                    Spacer(modifier = Modifier.height(8.dp))
                    InfoRow(Icons.Filled.Work, "Salary", job.salary)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Description
            Text("Description", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text(job.description, fontSize = 14.sp, color = TextMuted, lineHeight = 22.sp, modifier = Modifier.padding(top = 8.dp))

            Spacer(modifier = Modifier.height(20.dp))

            // Requirements
            if (job.requirements.isNotEmpty()) {
                Text("Requirements", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    job.requirements.forEach { req ->
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                            Icon(Icons.Filled.Check, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(16.dp))
                            Text(req, fontSize = 14.sp, color = TextDark, modifier = Modifier.padding(start = 8.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Responsibilities
            if (job.responsibilities.isNotEmpty()) {
                Text("Responsibilities", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    job.responsibilities.forEach { resp ->
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                            Icon(Icons.Filled.Check, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(16.dp))
                            Text(resp, fontSize = 14.sp, color = TextDark, modifier = Modifier.padding(start = 8.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Contact
            Text("Apply Now", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text("Contact the employer:", fontSize = 13.sp, color = TextMuted, modifier = Modifier.padding(top = 4.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Email, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(18.dp))
                Text(job.contactEmail, fontSize = 14.sp, color = TextDark, modifier = Modifier.padding(start = 12.dp))
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Call, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(18.dp))
                Text(job.contactPhone, fontSize = 14.sp, color = TextDark, modifier = Modifier.padding(start = 12.dp))
            }

            Spacer(modifier = Modifier.height(16.dp))
            RoundedPrimaryButton(
                text = "Apply Now",
                modifier = Modifier.fillMaxWidth(),
                onClick = {}
            )
        }
    }
}

@Composable
private fun InfoRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(18.dp))
        Text(label, fontSize = 13.sp, color = TextMuted, modifier = Modifier.padding(start = 8.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = TextDark)
    }
}

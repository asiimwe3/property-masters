package com.propertymasters.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.BorderStroke
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
fun PlansScreen(onBack: () -> Unit) {
    val sagecoTeal = Color(0xFF0F766E)
    val sagecoLight = Color(0xFFCCFBF1)

    val plans = listOf(
        PlanData("Free", 0, "No expiry", listOf("List up to 3 properties", "Basic broker profile", "Email support")),
        PlanData("Basic", 15000, "1 month", listOf("List up to 10 properties", "Standard broker profile", "Email support")),
        PlanData("Pro", 25000, "1 month", listOf("List up to 50 properties", "Featured broker profile", "Priority placement", "WhatsApp badge"), true),
        PlanData("Premium", 30000, "1 month", listOf("Unlimited listings", "Top placement", "Verified badge", "Priority support", "Analytics dashboard")),
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Broker Plans", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = sagecoTeal, titleContentColor = Color.White, navigationIconContentColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)
        ) {
            Text("Choose Your Plan", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = sagecoTeal)
            Text("Premium broker features for listing properties across Uganda.", fontSize = 13.sp, color = Color.Gray, modifier = Modifier.padding(top = 4.dp, bottom = 16.dp))

            plans.forEach { plan ->
                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = if (plan.popular) sagecoLight else Color.White),
                    border = androidx.compose.foundation.layout.BorderStroke(2.dp, sagecoTeal)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(plan.name, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = sagecoTeal)
                                Text(plan.duration, fontSize = 12.sp, color = Color.Gray)
                            }
                            Text(
                                if (plan.price == 0) "FREE" else "UGX ${"%,.0f".format(plan.price.toDouble())}",
                                fontSize = 18.sp, fontWeight = FontWeight.Bold, color = sagecoTeal
                            )
                        }
                        if (plan.popular) {
                            Spacer(Modifier.height(4.dp))
                            AssistChip(onClick = {}, label = { Text("Most Popular", fontSize = 10.sp) }, colors = AssistChipDefaults.assistChipColors(containerColor = sagecoTeal, labelColor = Color.White))
                        }
                        Spacer(Modifier.height(12.dp))
                        plan.features.forEach { feature ->
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                                Text("✓", color = sagecoTeal, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Spacer(Modifier.width(8.dp))
                                Text(feature, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            Text("Payments via MTN MoMo, Airtel Money, or Card through PesaPal.", fontSize = 11.sp, color = Color.Gray)
        }
    }
}

private data class PlanData(
    val name: String,
    val price: Int,
    val duration: String,
    val features: List<String>,
    val popular: Boolean = false
)

package com.propertymasters.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private data class FaqCategory(val category: String, val items: List<FaqItem>)
private data class FaqItem(val q: String, val a: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaqScreen(onBack: () -> Unit) {
    val sagecoTeal = Color(0xFF0F766E)

    val faqs = listOf(
        FaqCategory("Booking & Payments", listOf(
            FaqItem("How much does it cost to book a viewing?", "UGX 30,000 for property viewing (UGX 10,000 to SAGECO, UGX 20,000 to broker). Consultation costs UGX 15,000."),
            FaqItem("What payment methods are accepted?", "MTN Mobile Money, Airtel Money, and bank cards through PesaPal."),
            FaqItem("What happens after I pay?", "Your booking is confirmed. Our team contacts you within 24 hours to confirm time and location."),
            FaqItem("Can I get a refund?", "Bookings are non-refundable once the broker is notified. To reschedule, WhatsApp 0750 414 366 within 24 hours."),
        )),
        FaqCategory("Properties", listOf(
            FaqItem("How do I list a property?", "Go to Add Property, fill in details, upload photos, and submit. Our team reviews within 48 hours."),
            FaqItem("What types of properties are available?", "Residential homes, commercial spaces, land plots, and green/eco-friendly projects across Uganda."),
            FaqItem("Where is SAGECO EVERGREEN based?", "Kyenjojo, Western Uganda. We serve clients across the entire country."),
        )),
        FaqCategory("Brokers", listOf(
            FaqItem("How do I become a broker?", "Register via the Broker Registration screen. Your application is reviewed within 48 hours."),
            FaqItem("What plans are available?", "Free (3 listings), Basic UGX 15K (10 listings), Pro UGX 25K (50 listings), Premium UGX 30K (unlimited)."),
        )),
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("FAQ", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, null) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = sagecoTeal, titleContentColor = Color.White, navigationIconContentColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)
        ) {
            faqs.forEach { category ->
                Text(category.category, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = sagecoTeal, modifier = Modifier.padding(vertical = 8.dp))
                category.items.forEach { item ->
                    var expanded by remember { mutableStateOf(false) }
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(item.q, fontSize = 14.sp, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
                                IconButton(onClick = { expanded = !expanded }) {
                                    Icon(if (expanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore, contentDescription = null, tint = sagecoTeal)
                                }
                            }
                            if (expanded) {
                                Text(item.a, fontSize = 13.sp, color = Color.Gray, modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

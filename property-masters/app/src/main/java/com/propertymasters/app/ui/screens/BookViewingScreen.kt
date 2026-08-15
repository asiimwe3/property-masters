package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.data.repository.SupabaseRepository
import kotlinx.coroutines.launch

data class BookingType(
    val value: String,
    val label: String,
    val icon: String,
    val desc: String,
    val fee: Double
)

class BookViewingViewModel : ViewModel() {
    var name by mutableStateOf("")
    var email by mutableStateOf("")
    var phone by mutableStateOf("")
    var date by mutableStateOf("")
    var timeSlot by mutableStateOf("")
    var bookingType by mutableStateOf("viewing")
    var message by mutableStateOf("")
    var status by mutableStateOf("")
    var loading by mutableStateOf(false)

    private val bookingTypes = listOf(
        BookingType("viewing", "Property Viewing", "🏡", "Visit and inspect a specific property", 30000.0),
        BookingType("consultation", "Consultation", "💬", "Talk to our team about your needs", 15000.0),
        BookingType("site_visit", "Site Visit", "📍", "Visit a green project or land site", 30000.0),
    )

    private val timeSlots = listOf(
        "08:00-10:00" to "Morning · 8:00 AM – 10:00 AM",
        "10:00-12:00" to "Late Morning · 10:00 AM – 12:00 PM",
        "13:00-15:00" to "Afternoon · 1:00 PM – 3:00 PM",
        "15:00-17:00" to "Late Afternoon · 3:00 PM – 5:00 PM",
    )

    fun getBookingTypes() = bookingTypes
    fun getTimeSlots() = timeSlots
    fun getCurrentFee(): Double = bookingTypes.find { it.value == bookingType }?.fee ?: 30000.0

    fun canSubmit(): Boolean =
        name.isNotBlank() && email.isNotBlank() && phone.isNotBlank() && date.isNotBlank() && timeSlot.isNotBlank()

    fun submit(propertyTitle: String, propertyId: String?) {
        if (!canSubmit() || loading) return
        loading = true
        status = "processing"
        viewModelScope.launch {
            val reference = "${bookingType.uppercase()}-${propertyId ?: "GEN"}-${System.currentTimeMillis()}"
            val fee = getCurrentFee()
            val success = SupabaseRepository.saveBooking(
                reference = reference,
                propertyId = propertyId,
                propertyTitle = propertyTitle,
                customerName = name,
                customerEmail = email,
                customerPhone = phone,
                preferredDate = date,
                timeSlot = timeSlot,
                bookingType = bookingType,
                message = message.ifBlank { "Viewing request for: $propertyTitle" },
                totalAmount = fee,
                businessShare = fee,
                brokerShare = 0.0
            )
            loading = false
            status = if (success) "success" else "error"
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookViewingScreen(
    propertyTitle: String = "Property",
    propertyId: String? = null,
    onBack: () -> Unit
) {
    val vm: BookViewingViewModel = viewModel()
    val sagecoTeal = Color(0xFF0F766E)
    val sagecoLight = Color(0xFFCCFBF1)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Book Viewing", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = sagecoTeal, titleContentColor = Color.White, navigationIconContentColor = Color.White)
            )
        }
    ) { padding ->
        if (vm.status == "success") {
            Column(
                modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Filled.Check, contentDescription = null, tint = sagecoTeal, modifier = Modifier.size(80.dp))
                Spacer(Modifier.height(16.dp))
                Text("Booking Confirmed!", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = sagecoTeal)
                Spacer(Modifier.height(8.dp))
                Text("Our team will contact you within 24 hours to confirm the exact time and location.", color = Color.Gray, fontSize = 14.sp)
                Spacer(Modifier.height(8.dp))
                Text("WhatsApp: 0750 414 366", color = sagecoTeal, fontWeight = FontWeight.Medium)
                Spacer(Modifier.height(24.dp))
                Button(onClick = onBack, colors = ButtonDefaults.buttonColors(containerColor = sagecoTeal)) {
                    Text("Done")
                }
            }
            return@Scaffold
        }

        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)
        ) {
            // Property info
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = sagecoLight)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Booking for", fontSize = 12.sp, color = Color.Gray)
                    Text(propertyTitle, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = sagecoTeal)
                    Text("Fee: UGX ${"%,.0f".format(vm.getCurrentFee())}", fontSize = 14.sp, color = Color.Gray, modifier = Modifier.padding(top = 4.dp))
                }
            }

            Spacer(Modifier.height(16.dp))

            // Booking type selector
            Text("Booking Type", fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.padding(bottom = 8.dp))
            vm.getBookingTypes().forEach { type ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = vm.bookingType == type.value,
                        onClick = { vm.bookingType = type.value },
                        colors = RadioButtonDefaults.colors(selectedColor = sagecoTeal)
                    )
                    Column {
                        Text("${type.icon} ${type.label}", fontWeight = FontWeight.Medium, fontSize = 14.sp)
                        Text(type.desc, fontSize = 12.sp, color = Color.Gray)
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // Form fields
            OutlinedTextField(
                value = vm.name, onValueChange = { vm.name = it },
                label = { Text("Full Name") }, leadingIcon = { Icon(Icons.Filled.Person, null) },
                modifier = Modifier.fillMaxWidth(), singleLine = true
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = vm.email, onValueChange = { vm.email = it },
                label = { Text("Email") }, leadingIcon = { Icon(Icons.Filled.Email, null) },
                modifier = Modifier.fillMaxWidth(), singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = vm.phone, onValueChange = { vm.phone = it },
                label = { Text("Phone / WhatsApp") }, leadingIcon = { Icon(Icons.Filled.Phone, null) },
                modifier = Modifier.fillMaxWidth(), singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = vm.date, onValueChange = { vm.date = it },
                label = { Text("Preferred Date (YYYY-MM-DD)") }, leadingIcon = { Icon(Icons.Filled.CalendarToday, null) },
                modifier = Modifier.fillMaxWidth(), singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            Spacer(Modifier.height(12.dp))

            Text("Time Slot", fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.padding(bottom = 8.dp))
            vm.getTimeSlots().forEach { (value, label) ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = vm.timeSlot == value,
                        onClick = { vm.timeSlot = value },
                        colors = RadioButtonDefaults.colors(selectedColor = sagecoTeal)
                    )
                    Text(label, fontSize = 13.sp)
                }
            }

            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = vm.message, onValueChange = { vm.message = it },
                label = { Text("Message (optional)") },
                modifier = Modifier.fillMaxWidth(), minLines = 2, maxLines = 4
            )

            Spacer(Modifier.height(16.dp))

            if (vm.status == "error") {
                Text("Something went wrong. Please try again or WhatsApp 0750 414 366.", color = Color.Red, fontSize = 13.sp)
                Spacer(Modifier.height(8.dp))
            }

            Button(
                onClick = { vm.submit(propertyTitle, propertyId) },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = vm.canSubmit() && !vm.loading,
                colors = ButtonDefaults.buttonColors(containerColor = sagecoTeal),
                shape = RoundedCornerShape(26.dp)
            ) {
                if (vm.loading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
                } else {
                    Text("Book Now — UGX ${"%,.0f".format(vm.getCurrentFee())}", fontWeight = FontWeight.Bold)
                }
            }

            Spacer(Modifier.height(8.dp))
            Text("Pay via MTN MoMo, Airtel Money, or Card. Our team confirms within 24 hours.", fontSize = 11.sp, color = Color.Gray, modifier = Modifier.padding(horizontal = 8.dp))
        }
    }
}

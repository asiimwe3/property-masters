package com.propertymasters.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.data.repository.SupabaseRepository
import kotlinx.coroutines.launch

class ContactViewModel : ViewModel() {
    var name by mutableStateOf("")
    var email by mutableStateOf("")
    var phone by mutableStateOf("")
    var subject by mutableStateOf("")
    var message by mutableStateOf("")
    var loading by mutableStateOf(false)
    var status by mutableStateOf("")

    fun canSubmit() = name.isNotBlank() && email.isNotBlank() && message.isNotBlank()

    fun submit() {
        if (!canSubmit() || loading) return
        loading = true
        status = ""
        viewModelScope.launch {
            val fullMessage = if (subject.isNotBlank()) "[$subject] $message" else message
            val success = SupabaseRepository.sendContactMessage(name, email, fullMessage, phone)
            loading = false
            status = if (success) "success" else "error"
            if (success) {
                name = ""; email = ""; phone = ""; subject = ""; message = ""
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContactScreen(onBack: () -> Unit) {
    val vm: ContactViewModel = viewModel()
    val sagecoTeal = Color(0xFF0F766E)
    val sagecoLight = Color(0xFFCCFBF1)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Contact Us", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, null) } },
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
                Icon(Icons.Filled.Check, contentDescription = null, tint = sagecoTeal, modifier = Modifier.size(64.dp))
                Spacer(Modifier.height(12.dp))
                Text("Message Sent!", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = sagecoTeal)
                Text("We'll get back to you soon.", color = Color.Gray, fontSize = 14.sp)
                Spacer(Modifier.height(24.dp))
                Button(onClick = onBack, colors = ButtonDefaults.buttonColors(containerColor = sagecoTeal)) { Text("Done") }
            }
            return@Scaffold
        }

        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)
        ) {
            // Contact info
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = sagecoLight)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Get In Touch", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = sagecoTeal)
                    Spacer(Modifier.height(12.dp))
                    ContactInfoRow(Icons.Filled.LocationOn, "Address", "Kyenjojo, Western Uganda")
                    ContactInfoRow(Icons.Filled.Phone, "Phone / WhatsApp", "0750 414 366 · 0782 067 425")
                    ContactInfoRow(Icons.Filled.Email, "Email", "sagecoevergreen@gmail.com")
                    ContactInfoRow(Icons.Filled.Schedule, "Hours", "Mon–Sat, 8 AM – 6 PM EAT")
                }
            }

            Spacer(Modifier.height(16.dp))

            // Form
            OutlinedTextField(value = vm.name, onValueChange = { vm.name = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.email, onValueChange = { vm.email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.phone, onValueChange = { vm.phone = it }, label = { Text("Phone (optional)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.subject, onValueChange = { vm.subject = it }, label = { Text("Subject") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.message, onValueChange = { vm.message = it }, label = { Text("Message") }, modifier = Modifier.fillMaxWidth(), minLines = 3, maxLines = 5)

            Spacer(Modifier.height(16.dp))

            if (vm.status == "error") {
                Text("Something went wrong. Please try again.", color = Color.Red, fontSize = 13.sp)
                Spacer(Modifier.height(8.dp))
            }

            Button(
                onClick = { vm.submit() },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = vm.canSubmit() && !vm.loading,
                colors = ButtonDefaults.buttonColors(containerColor = sagecoTeal),
                shape = RoundedCornerShape(26.dp)
            ) {
                if (vm.loading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
                } else {
                    Text("Send Message", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun ContactInfoRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(modifier = Modifier.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = sagecoTeal, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(12.dp))
        Column {
            Text(label, fontSize = 11.sp, color = Color.Gray)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        }
    }
}

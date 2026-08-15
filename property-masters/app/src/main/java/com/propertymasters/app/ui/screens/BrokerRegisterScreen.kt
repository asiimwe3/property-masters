package com.propertymasters.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
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

class BrokerRegisterViewModel : ViewModel() {
    var fullName by mutableStateOf("")
    var email by mutableStateOf("")
    var phone by mutableStateOf("")
    var location by mutableStateOf("")
    var specialization by mutableStateOf("Residential")
    var bio by mutableStateOf("")
    var experienceYears by mutableStateOf("")
    var loading by mutableStateOf(false)
    var status by mutableStateOf("")

    val specializations = listOf("Residential", "Commercial", "Land", "Green Projects", "Mixed")

    fun canSubmit() = fullName.isNotBlank() && email.isNotBlank() && phone.isNotBlank() && location.isNotBlank()

    fun submit() {
        if (!canSubmit() || loading) return
        loading = true
        status = ""
        viewModelScope.launch {
            val success = SupabaseRepository.registerBroker(
                fullName = fullName,
                email = email,
                phone = phone,
                location = location,
                specialization = specialization,
                bio = bio,
                experienceYears = experienceYears.toIntOrNull() ?: 0
            )
            loading = false
            status = if (success) "success" else "error"
            if (success) {
                fullName = ""; email = ""; phone = ""; location = ""; bio = ""; experienceYears = ""
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BrokerRegisterScreen(onBack: () -> Unit) {
    val vm: BrokerRegisterViewModel = viewModel()
    val sagecoTeal = Color(0xFF0F766E)
    val sagecoLight = Color(0xFFCCFBF1)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Register as Broker", fontWeight = FontWeight.Bold) },
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
                Text("Registration Submitted!", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = sagecoTeal)
                Text("Your application is pending review. We'll contact you within 48 hours.", color = Color.Gray, fontSize = 14.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                Spacer(Modifier.height(24.dp))
                Button(onClick = onBack, colors = ButtonDefaults.buttonColors(containerColor = sagecoTeal)) { Text("Done") }
            }
            return@Scaffold
        }

        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = sagecoLight)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Join SAGECO EVERGREEN", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = sagecoTeal)
                    Text("Become a verified broker and start listing properties across Uganda.", fontSize = 13.sp, color = Color.Gray, modifier = Modifier.padding(top = 4.dp))
                }
            }

            Spacer(Modifier.height(16.dp))

            OutlinedTextField(value = vm.fullName, onValueChange = { vm.fullName = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.email, onValueChange = { vm.email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.phone, onValueChange = { vm.phone = it }, label = { Text("Phone / WhatsApp") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.location, onValueChange = { vm.location = it }, label = { Text("Location (e.g. Kampala, Kyenjojo)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))

            Text("Specialization", fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.padding(vertical = 8.dp))
            vm.specializations.forEach { spec ->
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(selected = vm.specialization == spec, onClick = { vm.specialization = spec }, colors = RadioButtonDefaults.colors(selectedColor = sagecoTeal))
                    Text(spec, fontSize = 14.sp)
                }
            }

            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.experienceYears, onValueChange = { vm.experienceYears = it }, label = { Text("Years of Experience") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = vm.bio, onValueChange = { vm.bio = it }, label = { Text("Tell us about yourself") }, modifier = Modifier.fillMaxWidth(), minLines = 2, maxLines = 4)

            Spacer(Modifier.height(16.dp))

            if (vm.status == "error") {
                Text("Registration failed. Please try again.", color = Color.Red, fontSize = 13.sp)
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
                    Text("Submit Application", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

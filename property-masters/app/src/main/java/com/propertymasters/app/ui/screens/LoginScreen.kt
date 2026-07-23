package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.propertymasters.app.ui.components.RoundedPrimaryButton
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TealPrimaryDark
import com.propertymasters.app.viewmodel.AppViewModel

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit
) {
    val appVm: AppViewModel = viewModel()

    var isSignup by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(TealPrimary, TealPrimaryDark)))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .background(Color.White.copy(alpha = 0.15f), RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.Person, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp))
            }

            Spacer(modifier = Modifier.height(16.dp))
            Text("Property Masters", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text(
                if (isSignup) "Create your account" else "Welcome back",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.8f),
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            if (isSignup) {
                LoginField(Icons.Filled.Person, "Full Name", name, { name = it })
                Spacer(modifier = Modifier.height(12.dp))
            }

            LoginField(Icons.Filled.Email, "Email", email, { email = it }, KeyboardType.Email)
            Spacer(modifier = Modifier.height(12.dp))
            LoginField(Icons.Filled.Lock, "Password", password, { password = it }, KeyboardType.Password, isPassword = true)

            if (error.isNotEmpty()) {
                Text(error, fontSize = 13.sp, color = Color(0xFFFFCDD2), modifier = Modifier.padding(top = 8.dp))
            }

            Spacer(modifier = Modifier.height(24.dp))

            RoundedPrimaryButton(
                text = if (isSignup) "Sign Up" else "Login",
                modifier = Modifier.fillMaxWidth().height(48.dp),
                onClick = {
                    val success = if (isSignup) appVm.signup(name, email, password)
                    else appVm.login(email, password)
                    if (success) onLoginSuccess() else error = "Please fill in all fields (min 4 char password)"
                }
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                if (isSignup) "Already have an account? Login" else "Don't have an account? Sign up",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.8f),
                modifier = Modifier.clickable { isSignup = !isSignup }
            )
        }
    }
}

@Composable
private fun LoginField(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    keyboardType: KeyboardType = KeyboardType.Text,
    isPassword: Boolean = false
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label, color = Color.White.copy(alpha = 0.7f), fontSize = 14.sp) },
        leadingIcon = { Icon(icon, contentDescription = null, tint = Color.White.copy(alpha = 0.5f)) },
        singleLine = true,
        shape = RoundedCornerShape(16.dp),
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        visualTransformation = if (isPassword) PasswordVisualTransformation() else VisualTransformation.None,
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedContainerColor = Color.White.copy(alpha = 0.1f),
            focusedContainerColor = Color.White.copy(alpha = 0.15f),
            unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
            focusedBorderColor = Color.White.copy(alpha = 0.4f),
            unfocusedTextColor = Color.White,
            focusedTextColor = Color.White,
            cursorColor = Color.White
        )
    )
}

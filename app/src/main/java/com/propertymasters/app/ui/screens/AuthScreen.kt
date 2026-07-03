package com.propertymasters.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.propertymasters.app.data.AuthRepository
import com.propertymasters.app.ui.theme.OffWhite
import com.propertymasters.app.ui.theme.TealPrimary
import com.propertymasters.app.ui.theme.TextMuted
import com.propertymasters.app.ui.theme.TextPrimary
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(onAuthenticated: () -> Unit) {
    var isSignUp by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OffWhite)
            .padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Property Master",
            fontWeight = FontWeight.Bold,
            fontSize = 26.sp,
            color = TealPrimary
        )
        Spacer(Modifier.height(4.dp))
        Text(
            if (isSignUp) "Create your account" else "Welcome back",
            fontSize = 15.sp,
            color = TextMuted
        )
        Spacer(Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(Modifier.height(14.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        if (errorMessage != null) {
            Spacer(Modifier.height(10.dp))
            Text(errorMessage!!, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
        }

        Spacer(Modifier.height(22.dp))

        Button(
            onClick = {
                errorMessage = null
                if (email.isBlank() || password.isBlank()) {
                    errorMessage = "Please enter both email and password"
                    return@Button
                }
                isLoading = true
                scope.launch {
                    val result = if (isSignUp) {
                        AuthRepository.signUp(email.trim(), password)
                    } else {
                        AuthRepository.signIn(email.trim(), password)
                    }
                    isLoading = false
                    result.onSuccess { onAuthenticated() }
                        .onFailure { errorMessage = it.message ?: "Something went wrong" }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(25.dp),
            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = androidx.compose.ui.graphics.Color.White)
            } else {
                Text(if (isSignUp) "Sign Up" else "Log In", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
            }
        }

        Spacer(Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                if (isSignUp) "Already have an account?" else "Don't have an account?",
                color = TextMuted,
                fontSize = 13.sp
            )
            Spacer(Modifier.width(6.dp))
            Text(
                if (isSignUp) "Log In" else "Sign Up",
                color = TealPrimary,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
                modifier = Modifier.clickable { isSignUp = !isSignUp; errorMessage = null }
            )
        }
    }
}

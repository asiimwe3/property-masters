package com.propertymasters.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = TealPrimary,
    onPrimary = Color.White,
    secondary = TealAccent,
    background = BackgroundGray,
    surface = CardWhite,
    onBackground = TextDark,
    onSurface = TextDark,
)

@Composable
fun PropertyMastersTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = PropertyMastersTypography,
        content = content
    )
}

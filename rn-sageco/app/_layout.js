import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from '../context/AuthContext'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  const greenHeader = {
    headerStyle: { backgroundColor: '#1a5c38' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '700' },
  }

  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#1a5c38" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="property/[id]" options={{ headerShown: true, title: 'Property Details', ...greenHeader }} />
        <Stack.Screen name="broker/[id]" options={{ headerShown: true, title: 'Broker Profile', ...greenHeader }} />
        <Stack.Screen name="book" options={{ headerShown: false }} />
        <Stack.Screen name="broker-register" options={{ headerShown: false }} />
        <Stack.Screen name="upload-property" options={{ headerShown: false }} />
        <Stack.Screen name="my-bookings" options={{ headerShown: false }} />
        <Stack.Screen name="my-properties" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="faq" options={{ headerShown: false }} />
        <Stack.Screen name="contact" options={{ headerShown: false }} />
        <Stack.Screen name="careers" options={{ headerShown: false }} />
        <Stack.Screen name="plans" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  )
}

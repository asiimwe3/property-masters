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

  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#1a5c38" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="property/[id]" options={{ headerShown: true, title: 'Property Details', headerStyle: { backgroundColor: '#1a5c38' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="broker/[id]" options={{ headerShown: true, title: 'Broker Profile', headerStyle: { backgroundColor: '#1a5c38' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="book" options={{ headerShown: true, title: 'Book a Viewing', headerStyle: { backgroundColor: '#1a5c38' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="payment" options={{ headerShown: true, title: 'Payment', headerStyle: { backgroundColor: '#1a5c38' }, headerTintColor: '#fff' }} />
      </Stack>
    </AuthProvider>
  )
}

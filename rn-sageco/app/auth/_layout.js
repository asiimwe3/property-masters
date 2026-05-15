import { Stack } from 'expo-router'
import { colors } from '../../lib/theme'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
    </Stack>
  )
}

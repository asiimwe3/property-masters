import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      await signIn({ email: email.trim(), password })
      router.replace('/tabs/account')
    } catch (e) {
      setError(e.message || 'Sign in failed')
    }
    setLoading(false)
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <Text style={styles.logoTitle}>SAGECO <Text style={{ color: colors.secondary }}>EVERGREEN</Text></Text>
        <Text style={styles.logoSub}>Welcome back</Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.red500} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.gray400}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passBox}>
          <TextInput
            style={styles.passInput}
            placeholder="Your password"
            placeholderTextColor={colors.gray400}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/signup')}>
          <Text style={styles.secondaryBtnText}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.gray100 },
  container: { padding: spacing.lg, paddingTop: spacing.xl },
  logoArea: { alignItems: 'center', marginBottom: spacing.xl },
  logoIcon: { width: 70, height: 70, borderRadius: radius.xl, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  logoEmoji: { fontSize: 36 },
  logoTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  logoSub: { fontSize: fontSize.base, color: colors.gray500, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, ...shadow.md },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { flex: 1, fontSize: fontSize.sm, color: colors.red500 },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark, marginBottom: 6, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.base, color: colors.dark, marginBottom: 4 },
  passBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: 4 },
  passInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.base, color: colors.dark },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  btnText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
  secondaryBtn: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  secondaryBtnText: { fontSize: fontSize.sm, color: colors.gray500 },
})

import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

export default function SignupScreen() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const handleSignUp = async () => {
    if (!form.full_name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      await signUp({ email: form.email.trim(), password: form.password, full_name: form.full_name })
      setSuccess(true)
    } catch (e) {
      setError(e.message || 'Sign up failed')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.successTitle}>Account Created!</Text>
        <Text style={styles.successSub}>Check your email to verify your account, then sign in.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.btnText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoArea}>
        <View style={styles.logoIcon}><Text style={styles.logoEmoji}>🌿</Text></View>
        <Text style={styles.logoTitle}>SAGECO <Text style={{ color: colors.secondary }}>EVERGREEN</Text></Text>
        <Text style={styles.logoSub}>Create your account</Text>
      </View>

      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.red500} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {[
          { label: 'Full Name', key: 'full_name', placeholder: 'John Doe', type: 'default' },
          { label: 'Email', key: 'email', placeholder: 'you@example.com', type: 'email-address' },
        ].map(({ label, key, placeholder, type }) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={colors.gray400}
              value={form[key]}
              onChangeText={set(key)}
              keyboardType={type}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
            />
          </View>
        ))}

        <Text style={styles.label}>Password</Text>
        <View style={styles.passBox}>
          <TextInput
            style={styles.passInput}
            placeholder="Min. 6 characters"
            placeholderTextColor={colors.gray400}
            value={form.password}
            onChangeText={set('password')}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat password"
          placeholderTextColor={colors.gray400}
          value={form.confirm}
          onChangeText={set('confirm')}
          secureTextEntry={!showPass}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.secondaryBtnText}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text></Text>
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
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md, backgroundColor: colors.gray100 },
  successEmoji: { fontSize: 60 },
  successTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  successSub: { fontSize: fontSize.base, color: colors.gray500, textAlign: 'center' },
})

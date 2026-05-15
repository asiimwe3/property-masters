import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const REG_FEE = 32000
const ACTIVATION_FEE = 45000

export default function BrokerRegisterScreen() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1=form, 2=payment
  const [paymentUrl, setPaymentUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', location: '', specialization: '', bio: '' })

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.phone) { setError('Name, email and phone are required'); return }
    setLoading(true); setError('')
    try {
      // Save broker record first
      const { data: broker, error: dbErr } = await supabase
        .from('brokers')
        .insert([{ ...form, registration_status: 'pending' }])
        .select().single()
      if (dbErr) throw dbErr

      // Initiate PesaPal payment
      const reference = `BROKER-REG-${broker.id}-${Date.now()}`
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/pesapal/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: REG_FEE,
          currency: 'UGX',
          description: 'Broker Registration Fee — SAGECO EVERGREEN',
          email: form.email,
          phone: form.phone,
          first_name: form.full_name.split(' ')[0],
          last_name: form.full_name.split(' ').slice(1).join(' ') || 'N/A',
          reference,
          callback_url: `${process.env.EXPO_PUBLIC_SITE_URL}/broker-success?broker=${broker.id}&ref=${reference}`,
        }),
      })
      const data = await res.json()
      if (data.redirect_url) { setPaymentUrl(data.redirect_url); setStep(2) }
      else throw new Error(data.error || 'Payment initiation failed')
    } catch (e) {
      setError(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  if (step === 2 && paymentUrl) {
    return <SafeAreaView style={{ flex: 1 }}><WebView source={{ uri: paymentUrl }} style={{ flex: 1 }} /></SafeAreaView>
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Broker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Pricing Cards */}
        <View style={styles.pricingRow}>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Registration</Text>
            <Text style={styles.priceAmt}>UGX 32,000</Text>
            <Text style={styles.priceNote}>One-time</Text>
          </View>
          <View style={[styles.priceCard, styles.priceCardActive]}>
            <Text style={[styles.priceLabel, { color: colors.dark }]}>Dashboard Activation</Text>
            <Text style={[styles.priceAmt, { color: colors.dark }]}>UGX 45,000</Text>
            <Text style={[styles.priceNote, { color: colors.dark }]}>Unlock dashboard</Text>
          </View>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.red500} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {[
            { label: 'Full Name *', key: 'full_name', placeholder: 'Your full name', type: 'default' },
            { label: 'Email *', key: 'email', placeholder: 'your@email.com', type: 'email-address' },
            { label: 'Phone *', key: 'phone', placeholder: '+256 7XX XXX XXX', type: 'phone-pad' },
            { label: 'Location', key: 'location', placeholder: 'e.g. Kampala, Uganda', type: 'default' },
            { label: 'Specialization', key: 'specialization', placeholder: 'e.g. Residential, Commercial', type: 'default' },
          ].map(({ label, key, placeholder, type }) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={colors.gray400} value={form[key]} onChangeText={set(key)} keyboardType={type} autoCapitalize="none" />
            </View>
          ))}

          <Text style={styles.label}>Bio</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Tell clients about yourself..." placeholderTextColor={colors.gray400} value={form.bio} onChangeText={set('bio')} multiline numberOfLines={4} textAlignVertical="top" />

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.dark} /> : (
              <>
                <Ionicons name="card-outline" size={18} color={colors.dark} />
                <Text style={styles.btnText}>Pay UGX 32,000 to Register</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.secureNote}>🔒 Secure payment via PesaPal</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  container: { padding: spacing.md, paddingBottom: spacing.xxl },
  pricingRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  priceCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', gap: 4, ...shadow.sm },
  priceCardActive: { backgroundColor: colors.secondary },
  priceLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  priceAmt: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  priceNote: { fontSize: fontSize.xs, color: colors.gray500 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, ...shadow.md },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { flex: 1, fontSize: fontSize.sm, color: colors.red500 },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark, marginBottom: 6, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.base, color: colors.dark },
  textarea: { minHeight: 90, paddingTop: spacing.md },
  btn: { backgroundColor: colors.secondary, borderRadius: radius.full, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.lg },
  btnText: { color: colors.dark, fontSize: fontSize.base, fontWeight: '700' },
  secureNote: { textAlign: 'center', fontSize: fontSize.xs, color: colors.gray400, marginTop: spacing.sm },
})

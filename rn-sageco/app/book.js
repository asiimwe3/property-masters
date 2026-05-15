import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const BOOKING_FEE = 30000
const PESAPAL_ENV = process.env.EXPO_PUBLIC_PESAPAL_ENV || 'sandbox'

export default function BookScreen() {
  const params = useLocalSearchParams()
  const propertyTitle = params.title ? decodeURIComponent(params.title) : 'Property'
  const propertyId = params.property || ''
  const brokerId = params.broker_id || ''
  const brokerName = params.broker_name ? decodeURIComponent(params.broker_name) : ''

  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', message: brokerId ? `Viewing request via broker: ${brokerName}` : `Viewing request for: ${propertyTitle}` })
  const [status, setStatus] = useState('idle') // idle | loading | payment
  const [paymentUrl, setPaymentUrl] = useState('')
  const [error, setError] = useState('')

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) { setError('Please fill in name, email and phone'); return }
    setStatus('loading'); setError('')
    try {
      const reference = `VIEWING-${propertyId || 'PROP'}-${Date.now()}`
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/pesapal/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: BOOKING_FEE,
          currency: 'UGX',
          description: brokerId ? `Property Viewing Fee — via ${brokerName}` : `Property Viewing Fee — ${propertyTitle}`,
          email: form.email,
          phone: form.phone,
          first_name: form.name.split(' ')[0],
          last_name: form.name.split(' ').slice(1).join(' ') || 'N/A',
          reference,
          callback_url: `${process.env.EXPO_PUBLIC_SITE_URL}/payment-success?order=${reference}`,
        }),
      })
      const data = await res.json()
      if (data.redirect_url) {
        setPaymentUrl(data.redirect_url)
        setStatus('payment')
      } else {
        throw new Error(data.error || 'Failed to initiate payment')
      }
    } catch (e) {
      setError(e.message || 'Something went wrong')
      setStatus('idle')
    }
  }

  if (status === 'payment' && paymentUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <WebView source={{ uri: paymentUrl }} style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Book a Property Viewing</Text>
            <Text style={styles.infoSub}>{propertyTitle}</Text>
            <Text style={styles.infoFee}>Viewing Fee: UGX {BOOKING_FEE.toLocaleString()}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.red500} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {[
            { label: 'Full Name *', key: 'name', placeholder: 'Your full name', type: 'default' },
            { label: 'Email *', key: 'email', placeholder: 'your@email.com', type: 'email-address' },
            { label: 'Phone *', key: 'phone', placeholder: '+256 7XX XXX XXX', type: 'phone-pad' },
            { label: 'Preferred Viewing Date', key: 'date', placeholder: 'e.g. 2026-06-01', type: 'default' },
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
                autoCapitalize="none"
              />
            </View>
          ))}

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Any additional notes..."
            placeholderTextColor={colors.gray400}
            value={form.message}
            onChangeText={set('message')}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={status === 'loading'}>
            {status === 'loading'
              ? <ActivityIndicator color={colors.white} />
              : <>
                  <Ionicons name="card-outline" size={18} color={colors.dark} />
                  <Text style={styles.btnText}>Pay UGX {BOOKING_FEE.toLocaleString()} via PesaPal</Text>
                </>
            }
          </TouchableOpacity>
          <Text style={styles.secureNote}>🔒 Secure payment via PesaPal</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  container: { padding: spacing.md, paddingBottom: spacing.xl },
  infoBanner: { backgroundColor: colors.green100, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, alignItems: 'flex-start' },
  infoTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  infoSub: { fontSize: fontSize.sm, color: colors.gray600 },
  infoFee: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary, marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { flex: 1, fontSize: fontSize.sm, color: colors.red500 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, ...shadow.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark, marginBottom: 6, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.base, color: colors.dark },
  textarea: { minHeight: 90, paddingTop: spacing.md },
  btn: { backgroundColor: colors.secondary, borderRadius: radius.full, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.lg },
  btnText: { color: colors.dark, fontSize: fontSize.base, fontWeight: '700' },
  secureNote: { textAlign: 'center', fontSize: fontSize.xs, color: colors.gray400, marginTop: spacing.sm },
})

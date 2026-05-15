import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const FAQS = [
  { q: 'How do I book a property viewing?', a: 'Go to any property or broker listing and tap "Book a Viewing". Fill in your details and pay the UGX 30,000 viewing fee via PesaPal. You will receive a confirmation and our team will reach out to schedule.' },
  { q: 'How do I become a registered broker?', a: 'Tap "Brokers" then "Register Now". Fill in your professional details and pay the UGX 32,000 registration fee. Dashboard activation costs an additional UGX 45,000.' },
  { q: 'Are the properties on SAGECO EVERGREEN verified?', a: 'Yes. All properties listed go through a review process. We work with verified brokers and conduct due diligence on listings.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major mobile money providers (MTN, Airtel) and cards via PesaPal — Uganda\'s leading payment gateway.' },
  { q: 'Can I list my property on the platform?', a: 'Yes! Create an account, go to Account > My Properties > Add Property. Fill in details and submit. Your listing will be live immediately.' },
  { q: 'What is a Green Project?', a: 'Green Projects are eco-friendly land and property developments that meet environmental sustainability standards. SAGECO EVERGREEN is committed to green real estate in Uganda.' },
  { q: 'How do I contact SAGECO EVERGREEN?', a: 'Call or WhatsApp 0750 414 366, call 0782 067 425, or email info@sagecoevergreen.com. We are based in Kyenjojo, Uganda.' },
  { q: 'Is my payment information secure?', a: 'Yes. All payments are processed through PesaPal, a PCI DSS compliant payment gateway. We never store your card details.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <TouchableOpacity style={styles.item} onPress={() => setOpen(o => !o)} activeOpacity={0.85}>
      <View style={styles.itemTop}>
        <Text style={styles.question}>{q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
      </View>
      {open && <Text style={styles.answer}>{a}</Text>}
    </TouchableOpacity>
  )
}

export default function FaqScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Got questions? We've got answers.</Text>
        {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  container: { padding: spacing.md, paddingBottom: spacing.xxl },
  intro: { fontSize: fontSize.base, color: colors.gray500, marginBottom: spacing.md },
  item: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  question: { flex: 1, fontSize: fontSize.base, fontWeight: '700', color: colors.dark, lineHeight: 22 },
  answer: { fontSize: fontSize.base, color: colors.gray600, lineHeight: 24, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray100 },
})

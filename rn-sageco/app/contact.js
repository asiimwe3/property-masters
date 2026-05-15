import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const CONTACTS = [
  { icon: 'call', label: 'Call Us', value: '0750 414 366 (WhatsApp)', action: () => Linking.openURL('tel:0750414366'), color: colors.primary },
  { icon: 'call-outline', label: 'Alternate Line', value: '0782 067 425', action: () => Linking.openURL('tel:0782067425'), color: colors.primary },
  { icon: 'logo-whatsapp', label: 'WhatsApp', value: '+256 750 414 366', action: () => Linking.openURL('https://wa.me/256750414366'), color: '#25D366' },
  { icon: 'mail', label: 'Email', value: 'info@sagecoevergreen.com', action: () => Linking.openURL('mailto:info@sagecoevergreen.com'), color: '#EA4335' },
  { icon: 'location', label: 'Office', value: 'Kyenjojo, Western Uganda', action: () => Linking.openURL('https://maps.google.com/?q=Kyenjojo+Uganda'), color: colors.secondary },
  { icon: 'globe', label: 'Website', value: 'sageco-evergreen.vercel.app', action: () => Linking.openURL('https://sageco-evergreen.vercel.app'), color: colors.primary },
]

export default function ContactScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>📞</Text>
          <Text style={styles.heroTitle}>We're Here to Help</Text>
          <Text style={styles.heroSub}>Reach us anytime — we respond fast</Text>
        </View>

        <View style={styles.card}>
          {CONTACTS.map(({ icon, label, value, action, color }) => (
            <TouchableOpacity key={label} style={styles.row} onPress={action}>
              <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={22} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, { marginBottom: spacing.xxl }]}>
          <Text style={styles.officeTitle}>🏢 Office Hours</Text>
          <Text style={styles.officeText}>Monday – Friday: 8:00 AM – 6:00 PM</Text>
          <Text style={styles.officeText}>Saturday: 9:00 AM – 3:00 PM</Text>
          <Text style={styles.officeText}>Sunday: Closed</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  container: { padding: spacing.md },
  hero: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white },
  heroSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  iconBox: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: fontSize.xs, color: colors.gray400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: fontSize.base, color: colors.dark, fontWeight: '500' },
  officeTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  officeText: { fontSize: fontSize.base, color: colors.gray600, paddingVertical: 4 },
})

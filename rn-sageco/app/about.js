import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const TEAM = [
  { name: 'Executive Management', icon: '👔' },
  { name: 'Property Consultants', icon: '🏠' },
  { name: 'Legal & Compliance', icon: '⚖️' },
  { name: 'Marketing & Sales', icon: '📣' },
]

const VALUES = [
  { icon: '🌿', title: 'Environmental Stewardship', desc: 'We are committed to eco-friendly development and green real estate across Uganda.' },
  { icon: '🤝', title: 'Integrity', desc: 'Honest, transparent dealings with every client, broker, and partner.' },
  { icon: '🏆', title: 'Excellence', desc: 'Premium service and quality properties — always.' },
  { icon: '🌍', title: 'Community', desc: 'Building Uganda, one property at a time.' },
]

export default function AboutScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About SAGECO</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🌿</Text>
          <Text style={styles.heroTitle}>SAGECO EVERGREEN</Text>
          <Text style={styles.heroSub}>Premier Real Estate Platform in Uganda</Text>
        </View>

        <View style={styles.body}>
          {/* Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.bodyText}>
              SAGECO EVERGREEN is Uganda's leading real estate platform, connecting buyers, sellers, and verified brokers across the country. We specialize in residential, commercial, land, and green eco-friendly property developments.
            </Text>
          </View>

          {/* Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Values</Text>
            {VALUES.map(({ icon, title, desc }) => (
              <View key={title} style={styles.valueCard}>
                <Text style={styles.valueIcon}>{icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.valueTitle}>{title}</Text>
                  <Text style={styles.valueDesc}>{desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Team</Text>
            <View style={styles.teamGrid}>
              {TEAM.map(({ name, icon }) => (
                <View key={name} style={styles.teamCard}>
                  <Text style={styles.teamIcon}>{icon}</Text>
                  <Text style={styles.teamName}>{name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact */}
          <View style={[styles.section, { marginBottom: spacing.xxl }]}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            {[
              { icon: 'call-outline', label: '0750 414 366', action: () => Linking.openURL('tel:0750414366') },
              { icon: 'logo-whatsapp', label: 'WhatsApp Us', action: () => Linking.openURL('https://wa.me/256750414366') },
              { icon: 'mail-outline', label: 'info@sagecoevergreen.com', action: () => Linking.openURL('mailto:info@sagecoevergreen.com') },
              { icon: 'globe-outline', label: 'sageco-evergreen.vercel.app', action: () => Linking.openURL('https://sageco-evergreen.vercel.app') },
            ].map(({ icon, label, action }) => (
              <TouchableOpacity key={label} style={styles.contactRow} onPress={action}>
                <Ionicons name={icon} size={20} color={colors.primary} />
                <Text style={styles.contactLabel}>{label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  hero: { backgroundColor: colors.primary, padding: spacing.xl, alignItems: 'center', paddingBottom: spacing.xxl },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.white },
  heroSub: { fontSize: fontSize.base, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  body: { padding: spacing.md, marginTop: -spacing.md },
  section: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  bodyText: { fontSize: fontSize.base, color: colors.gray600, lineHeight: 24 },
  valueCard: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  valueIcon: { fontSize: 24 },
  valueTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark, marginBottom: 2 },
  valueDesc: { fontSize: fontSize.sm, color: colors.gray500, lineHeight: 20 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  teamCard: { width: '47%', backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 6 },
  teamIcon: { fontSize: 28 },
  teamName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark, textAlign: 'center' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  contactLabel: { flex: 1, fontSize: fontSize.base, color: colors.dark },
})

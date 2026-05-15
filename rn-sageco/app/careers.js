import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const OPENINGS = [
  { title: 'Real Estate Sales Agent', type: 'Full-time', location: 'Kampala', desc: 'Help clients find their dream properties. Commission-based with strong earning potential.' },
  { title: 'Property Photographer', type: 'Freelance', location: 'Nationwide', desc: 'Capture stunning images of properties across Uganda for our listings.' },
  { title: 'Customer Relations Officer', type: 'Full-time', location: 'Kyenjojo', desc: 'Manage client relationships and support property bookings and inquiries.' },
  { title: 'Digital Marketing Specialist', type: 'Part-time', location: 'Remote', desc: 'Grow SAGECO EVERGREEN\'s online presence across social media and search.' },
]

const PERKS = [
  { icon: '💰', text: 'Competitive commissions' },
  { icon: '📈', text: 'Growth opportunities' },
  { icon: '🌿', text: 'Purpose-driven work' },
  { icon: '🤝', text: 'Supportive team' },
]

export default function CareersScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Careers</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🌿</Text>
          <Text style={styles.heroTitle}>Join Our Team</Text>
          <Text style={styles.heroSub}>Build Uganda's real estate future with us</Text>
        </View>

        <View style={styles.body}>
          {/* Perks */}
          <Text style={styles.sectionTitle}>Why SAGECO EVERGREEN?</Text>
          <View style={styles.perksRow}>
            {PERKS.map(({ icon, text }) => (
              <View key={text} style={styles.perkCard}>
                <Text style={styles.perkIcon}>{icon}</Text>
                <Text style={styles.perkText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Openings */}
          <Text style={styles.sectionTitle}>Current Openings</Text>
          {OPENINGS.map(({ title, type, location, desc }) => (
            <View key={title} style={styles.jobCard}>
              <View style={styles.jobTop}>
                <Text style={styles.jobTitle}>{title}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{type}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={13} color={colors.gray400} />
                <Text style={styles.jobLocation}>{location}</Text>
              </View>
              <Text style={styles.jobDesc}>{desc}</Text>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => Linking.openURL(`mailto:info@sagecoevergreen.com?subject=Application: ${title}&body=Hello SAGECO EVERGREEN, I am interested in the ${title} position.`)}
              >
                <Text style={styles.applyBtnText}>Apply via Email</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={[styles.jobCard, { marginBottom: spacing.xxl }]}>
            <Text style={styles.jobTitle}>Don't see your role?</Text>
            <Text style={styles.jobDesc}>Send your CV to info@sagecoevergreen.com and we'll be in touch when something opens up.</Text>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => Linking.openURL('mailto:info@sagecoevergreen.com?subject=Open Application — SAGECO EVERGREEN')}
            >
              <Text style={styles.applyBtnText}>Send Open Application</Text>
            </TouchableOpacity>
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
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm, marginTop: spacing.md },
  perksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  perkCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 6, ...shadow.sm },
  perkIcon: { fontSize: 28 },
  perkText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark, textAlign: 'center' },
  jobCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: 8, ...shadow.sm },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobTitle: { flex: 1, fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  typeBadge: { backgroundColor: colors.green100, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  typeText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobLocation: { fontSize: fontSize.sm, color: colors.gray400 },
  jobDesc: { fontSize: fontSize.sm, color: colors.gray600, lineHeight: 20 },
  applyBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.sm, alignItems: 'center' },
  applyBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
})

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'
import { useAuth } from '../../context/AuthContext'

const STATS = [
  { n: '500+', l: 'Properties' },
  { n: '200+', l: 'Happy Clients' },
  { n: '15+', l: 'Expert Brokers' },
  { n: '10+', l: 'Years' },
]

const QUICK_LINKS = [
  { icon: 'business-outline', label: 'Properties', route: '/tabs/properties', color: '#dcfce7' },
  { icon: 'people-outline', label: 'Brokers', route: '/tabs/brokers', color: '#fefce8' },
  { icon: 'leaf-outline', label: 'Green Projects', route: '/tabs/projects', color: '#d1fae5' },
  { icon: 'calendar-outline', label: 'Book Viewing', route: '/book', color: '#fef3c7' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, profile } = useAuth()

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>
                {user ? `Hello, ${profile?.full_name?.split(' ')[0] || 'there'} 👋` : 'Welcome 👋'}
              </Text>
              <Text style={styles.heroTitle}>SAGECO{'\n'}<Text style={{ color: colors.secondary }}>EVERGREEN</Text></Text>
            </View>
            <TouchableOpacity onPress={() => router.push(user ? '/tabs/account' : '/auth/login')} style={styles.avatarBtn}>
              <Ionicons name={user ? 'person' : 'person-outline'} size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroSub}>Premier Real Estate Platform in Uganda</Text>

          <TouchableOpacity style={styles.heroCta} onPress={() => router.push('/tabs/properties')}>
            <Ionicons name="search" size={16} color={colors.dark} />
            <Text style={styles.heroCtaText}>Search Properties...</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map(({ n, l }) => (
            <View key={l} style={styles.statCard}>
              <Text style={styles.statNum}>{n}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {QUICK_LINKS.map(({ icon, label, route, color }) => (
              <TouchableOpacity key={label} style={[styles.quickCard, { backgroundColor: color }]} onPress={() => router.push(route)}>
                <Ionicons name={icon} size={28} color={colors.primary} />
                <Text style={styles.quickLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Book Viewing Banner */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.bookBanner} onPress={() => router.push('/book')}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookBannerTitle}>📅 Book a Viewing</Text>
              <Text style={styles.bookBannerSub}>Schedule a property visit — UGX 30,000</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Contact */}
        <View style={[styles.section, { marginBottom: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            {[
              { icon: 'call-outline', text: '0750 414 366 (WhatsApp)' },
              { icon: 'call-outline', text: '0782 067 425' },
              { icon: 'mail-outline', text: 'info@sagecoevergreen.com' },
              { icon: 'location-outline', text: 'Kyenjojo, Uganda' },
            ].map(({ icon, text }) => (
              <View key={text} style={styles.contactRow}>
                <Ionicons name={icon} size={18} color={colors.primary} />
                <Text style={styles.contactText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  hero: { backgroundColor: colors.primary, padding: spacing.lg, paddingBottom: spacing.xl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  heroGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginBottom: 4 },
  heroTitle: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '800', lineHeight: 34 },
  avatarBtn: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.sm, marginBottom: spacing.md },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: radius.full, paddingVertical: 12, paddingHorizontal: spacing.md },
  heroCtaText: { color: colors.gray400, fontSize: fontSize.base },
  statsRow: { flexDirection: 'row', backgroundColor: colors.white, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, ...shadow.sm },
  statCard: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.gray500, marginTop: 2 },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickCard: { width: '47%', borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 8, ...shadow.sm },
  quickLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark },
  bookBanner: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', ...shadow.md },
  bookBannerTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: '700', marginBottom: 4 },
  bookBannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.sm },
  contactCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, ...shadow.sm },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  contactText: { fontSize: fontSize.base, color: colors.gray600 },
})

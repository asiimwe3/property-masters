import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

const MENU_ITEMS = [
  { icon: 'home-outline', label: 'My Properties', route: '/my-properties' },
  { icon: 'calendar-outline', label: 'My Bookings', route: '/my-bookings' },
  { icon: 'card-outline', label: 'Subscription Plans', route: '/plans' },
  { icon: 'briefcase-outline', label: 'Careers', route: '/careers' },
  { icon: 'document-text-outline', label: 'FAQ', route: '/faq' },
  { icon: 'information-circle-outline', label: 'About SAGECO', route: '/about' },
  { icon: 'call-outline', label: 'Contact Us', route: '/contact' },
]

export default function AccountScreen() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={80} color={colors.gray200} />
          <Text style={styles.guestTitle}>You're not signed in</Text>
          <Text style={styles.guestSub}>Sign in to access your bookings, properties, and more.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpBtn} onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signUpBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  const initial = profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile?.role || 'customer'}</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map(({ icon, label, route }) => (
            <TouchableOpacity key={label} style={styles.menuItem} onPress={() => router.push(route)}>
              <Ionicons name={icon} size={22} color={colors.primary} />
              <Text style={styles.menuLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.red500} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>SAGECO EVERGREEN v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  profileHeader: { backgroundColor: colors.primary, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: radius.full, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  profileName: { fontSize: fontSize.md, fontWeight: '700', color: colors.white },
  profileEmail: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  roleText: { fontSize: fontSize.xs, color: colors.white, textTransform: 'capitalize', fontWeight: '600' },
  menuSection: { margin: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuLabel: { flex: 1, fontSize: fontSize.base, color: colors.dark, fontWeight: '500' },
  signOutBtn: { marginHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow.sm },
  signOutText: { fontSize: fontSize.base, color: colors.red500, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: fontSize.xs, color: colors.gray400, marginBottom: spacing.xl },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  guestTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.dark },
  guestSub: { fontSize: fontSize.base, color: colors.gray500, textAlign: 'center' },
  signInBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radius.full, padding: spacing.md, alignItems: 'center' },
  signInBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
  signUpBtn: { width: '100%', borderWidth: 2, borderColor: colors.primary, borderRadius: radius.full, padding: spacing.md, alignItems: 'center' },
  signUpBtnText: { color: colors.primary, fontSize: fontSize.base, fontWeight: '700' },
})

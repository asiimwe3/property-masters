/**
 * SageCo Evergreen — Home Screen (FIXED)
 * ========================================
 * Fixes audit finding:
 * - "Hardcoded stats ("500+ Properties" when there are 7)"
 *   → Now fetches real counts from Supabase
 *
 * Also:
 * - Uses centralized config for contact info
 * - Proper error handling
 * - Loading state
 */

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme';
import { useAuth } from '../../context/AuthContext';
import { CONTACT, BRAND } from '../../lib/config';
import { supabase } from '../../lib/supabase';

// Quick link navigation cards
const QUICK_LINKS = [
  { icon: 'business-outline', label: 'Properties', route: '/tabs/properties', color: '#dcfce7' },
  { icon: 'people-outline', label: 'Brokers', route: '/tabs/brokers', color: '#fefce8' },
  { icon: 'leaf-outline', label: 'Green Projects', route: '/tabs/projects', color: '#d1fae5' },
  { icon: 'calendar-outline', label: 'Book Viewing', route: '/book', color: '#fef3c7' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // Dynamic stats (fetched from Supabase)
  const [stats, setStats] = useState([
    { n: '...', l: 'Properties' },
    { n: '...', l: 'Brokers' },
    { n: '...', l: 'Green Projects' },
    { n: '2+', l: 'Years' }, // Based on platform age, not a DB count
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  // ─── Fetch real stats from Supabase ─────────────────────
  useEffect(() => {
    async function fetchStats() {
      try {
        // Count available properties
        const { count: propCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available');

        // Count active brokers
        const { count: brokerCount } = await supabase
          .from('brokers')
          .select('*', { count: 'exact', head: true })
          .in('registration_status', ['registered', 'active']);

        // Count green projects
        const { count: greenCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'Green Project')
          .eq('status', 'available');

        setStats([
          { n: `${propCount || 0}+`, l: 'Properties' },
          { n: `${brokerCount || 0}+`, l: 'Brokers' },
          { n: `${greenCount || 0}+`, l: 'Green Projects' },
          { n: '2+', l: 'Years' },
        ]);
      } catch (err) {
        console.error('[Home] Stats fetch error:', err);
        // Fall back to showing zeros rather than fake numbers
        setStats([
          { n: '0', l: 'Properties' },
          { n: '0', l: 'Brokers' },
          { n: '0', l: 'Green Projects' },
          { n: '2+', l: 'Years' },
        ]);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>
                {user
                  ? `Hello, ${profile?.full_name?.split(' ')[0] || 'there'} 👋`
                  : 'Welcome 👋'}
              </Text>
              <Text style={styles.heroTitle}>
                {BRAND.name.split(' ')[0]}{'\n'}
                <Text style={{ color: colors.secondary }}>{BRAND.name.split(' ')[1]}</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(user ? '/tabs/account' : '/auth/login')}
              style={styles.avatarBtn}
            >
              <Ionicons name={user ? 'person' : 'person-outline'} size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroSub}>{BRAND.tagline}</Text>

          {/* Search bar */}
          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => router.push('/tabs/properties')}
          >
            <Ionicons name="search" size={16} color={colors.dark} />
            <Text style={styles.heroCtaText}>Search Properties...</Text>
          </TouchableOpacity>
        </View>

        {/* Stats (real data from Supabase) */}
        <View style={styles.statsRow}>
          {statsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ padding: 12 }} />
          ) : (
            stats.map(({ n, l }) => (
              <View key={l} style={styles.statCard}>
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))
          )}
        </View>

        {/* Quick Access Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {QUICK_LINKS.map(({ icon, label, route, color: bgColor }) => (
              <TouchableOpacity
                key={label}
                style={[styles.quickCard, { backgroundColor: bgColor }]}
                onPress={() => router.push(route)}
              >
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
              <Text style={styles.bookBannerSub}>
                Schedule a property visit — UGX 30,000
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Contact (from centralized config) */}
        <View style={[styles.section, { marginBottom: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            {[
              { icon: 'call-outline', text: `${CONTACT.phonePrimary} (WhatsApp)` },
              { icon: 'call-outline', text: CONTACT.phoneSecondary },
              { icon: 'mail-outline', text: CONTACT.email },
              { icon: 'location-outline', text: CONTACT.location },
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
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  hero: { backgroundColor: colors.primary, padding: spacing.lg, paddingBottom: spacing.xl },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.sm,
  },
  heroGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginBottom: 4 },
  heroTitle: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '800', lineHeight: 34 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.sm, marginBottom: spacing.md },
  heroCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: radius.full,
    paddingVertical: 12, paddingHorizontal: spacing.md,
  },
  heroCtaText: { color: colors.gray400, fontSize: fontSize.base },
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm, ...shadow.sm,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.gray500, marginTop: 2 },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickCard: {
    width: '47%', borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', gap: 8, ...shadow.sm,
  },
  quickLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark },
  bookBanner: {
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', ...shadow.md,
  },
  bookBannerTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: '700', marginBottom: 4 },
  bookBannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.sm },
  contactCard: {
    backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md,
    gap: spacing.sm, ...shadow.sm,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  contactText: { fontSize: fontSize.base, color: colors.gray600 },
});

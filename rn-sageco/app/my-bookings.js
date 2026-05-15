import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const STATUS_COLOR = {
  pending: '#fde68a',
  confirmed: '#bbf7d0',
  completed: '#bfdbfe',
  cancelled: '#fecaca',
}

export default function MyBookingsScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetch() {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    fetch()
  }, [user])

  if (!user) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.gray200} />
        <Text style={styles.emptyText}>Sign in to view your bookings</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/book')}>
            <Text style={styles.btnText}>Book a Viewing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.property_title || 'Property Viewing'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] || '#e5e7eb' }]}>
                  <Text style={styles.statusText}>{item.status || 'pending'}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Ionicons name="person-outline" size={14} color={colors.gray400} />
                <Text style={styles.cardMeta}>{item.customer_name}</Text>
              </View>
              {item.customer_phone && (
                <View style={styles.row}>
                  <Ionicons name="call-outline" size={14} color={colors.gray400} />
                  <Text style={styles.cardMeta}>{item.customer_phone}</Text>
                </View>
              )}
              {item.preferred_date && (
                <View style={styles.row}>
                  <Ionicons name="calendar-outline" size={14} color={colors.gray400} />
                  <Text style={styles.cardMeta}>Requested: {item.preferred_date}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Ionicons name="card-outline" size={14} color={colors.primary} />
                <Text style={[styles.cardMeta, { color: colors.primary, fontWeight: '700' }]}>
                  UGX {Number(item.amount || 30000).toLocaleString()} — {item.payment_status || 'paid'}
                </Text>
              </View>
              <Text style={styles.ref}>Ref: {item.reference}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { padding: 4 },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyText: { fontSize: fontSize.base, color: colors.gray400, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  btnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: 6, ...shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  statusBadge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.dark, textTransform: 'capitalize' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMeta: { fontSize: fontSize.sm, color: colors.gray500 },
  ref: { fontSize: fontSize.xs, color: colors.gray400, marginTop: 4 },
})

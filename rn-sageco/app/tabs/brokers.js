import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

function BrokerCard({ broker, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {broker.photo_url ? (
        <Image source={{ uri: broker.photo_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{broker.full_name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{broker.full_name}</Text>
        {broker.location && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={13} color={colors.gray400} />
            <Text style={styles.cardSub}>{broker.location}</Text>
          </View>
        )}
        {broker.specialization && (
          <Text style={styles.cardSpec}>{broker.specialization}</Text>
        )}
        <View style={styles.row}>
          <Ionicons name="call-outline" size={13} color={colors.primary} />
          <Text style={styles.cardPhone}>{broker.phone}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
    </TouchableOpacity>
  )
}

export default function BrokersScreen() {
  const [brokers, setBrokers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchBrokers() {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .in('registration_status', ['registered', 'active'])
        .order('created_at', { ascending: false })
      if (!error) setBrokers(data || [])
      setLoading(false)
    }
    fetchBrokers()
  }, [])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Brokers 🤝</Text>
        <Text style={styles.headerSub}>Verified real estate professionals</Text>
      </View>

      {/* Register CTA */}
      <TouchableOpacity style={styles.registerBanner} onPress={() => router.push('/broker-register')}>
        <View style={{ flex: 1 }}>
          <Text style={styles.registerTitle}>Are you a real estate agent?</Text>
          <Text style={styles.registerSub}>Register as a SAGECO EVERGREEN broker</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={28} color={colors.secondary} />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : brokers.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyText}>No brokers found yet</Text>
        </View>
      ) : (
        <FlatList
          data={brokers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BrokerCard broker={item} onPress={() => router.push(`/broker/${item.id}`)} />
          )}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { color: colors.white, fontSize: fontSize.xl, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm },
  registerBanner: { margin: spacing.md, backgroundColor: colors.yellow50, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.yellow200 },
  registerTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  registerSub: { fontSize: fontSize.sm, color: colors.gray500 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: spacing.sm, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow.sm },
  avatar: { width: 60, height: 60, borderRadius: radius.full },
  avatarPlaceholder: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.white, fontSize: fontSize.xl, fontWeight: '800' },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardSub: { fontSize: fontSize.sm, color: colors.gray400 },
  cardSpec: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  cardPhone: { fontSize: fontSize.sm, color: colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: fontSize.base, color: colors.gray400 },
})

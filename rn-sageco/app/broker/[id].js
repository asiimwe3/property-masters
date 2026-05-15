import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Linking } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

export default function BrokerDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [broker, setBroker] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: b }, { data: p }] = await Promise.all([
        supabase.from('brokers').select('*').eq('id', id).single(),
        supabase.from('properties').select('*').eq('broker_id', id).eq('status', 'available'),
      ])
      setBroker(b)
      setProperties(p || [])
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, marginTop: 80 }} />
  if (!broker) return <View style={styles.empty}><Text style={styles.emptyText}>Broker not found</Text></View>

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        {broker.photo_url ? (
          <Image source={{ uri: broker.photo_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{broker.full_name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
        )}
        <Text style={styles.name}>{broker.full_name}</Text>
        {broker.specialization && <Text style={styles.spec}>{broker.specialization}</Text>}
        {broker.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.location}>{broker.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* Contact buttons */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${broker.phone}`)}>
            <Ionicons name="call" size={20} color={colors.white} />
            <Text style={styles.contactBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, styles.whatsappBtn]} onPress={() => Linking.openURL(`https://wa.me/${broker.phone?.replace(/\s|[^0-9]/g, '')}`)}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, styles.emailBtn]} onPress={() => Linking.openURL(`mailto:${broker.email}`)}>
            <Ionicons name="mail" size={20} color={colors.white} />
            <Text style={styles.contactBtnText}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        {broker.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{broker.bio}</Text>
          </View>
        )}

        {/* Book through broker */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push(`/book?broker_id=${id}&broker_name=${encodeURIComponent(broker.full_name)}`)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.dark} />
          <Text style={styles.bookBtnText}>Book Viewing via {broker.full_name.split(' ')[0]}</Text>
        </TouchableOpacity>

        {/* Broker's Properties */}
        {properties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Properties by {broker.full_name.split(' ')[0]}</Text>
            {properties.map(p => (
              <TouchableOpacity key={p.id} style={styles.propCard} onPress={() => router.push(`/property/${p.id}`)}>
                {p.images?.[0] && <Image source={{ uri: p.images[0] }} style={styles.propImage} resizeMode="cover" />}
                <View style={styles.propInfo}>
                  <Text style={styles.propTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.propLocation}>{p.location}</Text>
                  <Text style={styles.propPrice}>UGX {Number(p.price).toLocaleString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.xl, alignItems: 'center', paddingBottom: spacing.xxl },
  avatar: { width: 90, height: 90, borderRadius: radius.full, marginBottom: spacing.md, borderWidth: 3, borderColor: colors.secondary },
  avatarPlaceholder: { backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: fontSize.xxxl, fontWeight: '800', color: colors.white },
  name: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white, marginBottom: 4 },
  spec: { fontSize: fontSize.sm, color: colors.secondary, fontWeight: '600', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)' },
  body: { padding: spacing.md, marginTop: -spacing.md },
  contactRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, ...shadow.md },
  contactBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  whatsappBtn: { backgroundColor: '#25D366' },
  emailBtn: { backgroundColor: '#EA4335' },
  contactBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700' },
  section: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  bio: { fontSize: fontSize.base, color: colors.gray600, lineHeight: 24 },
  bookBtn: { backgroundColor: colors.secondary, borderRadius: radius.full, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow.md, marginBottom: spacing.md },
  bookBtnText: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  propCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  propImage: { width: 60, height: 60, borderRadius: radius.sm },
  propInfo: { flex: 1, gap: 2 },
  propTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.dark },
  propLocation: { fontSize: fontSize.xs, color: colors.gray400 },
  propPrice: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: fontSize.base, color: colors.gray400 },
})

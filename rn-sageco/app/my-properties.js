import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

export default function MyPropertiesScreen() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchProperties() {
    if (!user) return
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('broker_id', user.id)
      .order('created_at', { ascending: false })
    setProperties(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProperties() }, [user])

  const handleDelete = (id) => {
    Alert.alert('Delete Property', 'Remove this property listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('properties').delete().eq('id', id)
          fetchProperties()
        }
      }
    ])
  }

  if (!user) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.gray200} />
        <Text style={styles.emptyText}>Sign in to manage your properties</Text>
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
        <Text style={styles.headerTitle}>My Properties</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/upload-property')}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : properties.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="business-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyText}>No listings yet</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/upload-property')}>
            <Text style={styles.btnText}>+ Add Property</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Ionicons name="business" size={24} color={colors.gray200} />
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.location}</Text>
                  <Text style={styles.cardPrice}>UGX {Number(item.price).toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? '#bbf7d0' : '#fecaca' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/property/${item.id}`)}>
                  <Ionicons name="eye-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.red500 }]} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={16} color={colors.red500} />
                  <Text style={[styles.actionText, { color: colors.red500 }]}>Delete</Text>
                </TouchableOpacity>
              </View>
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
  addBtn: { marginLeft: 'auto', padding: 4 },
  headerTitle: { flex: 1, color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyText: { fontSize: fontSize.base, color: colors.gray400, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  btnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm },
  cardRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  thumb: { width: 80, height: 80, borderRadius: radius.md },
  thumbPlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  cardSub: { fontSize: fontSize.sm, color: colors.gray400 },
  cardPrice: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  statusBadge: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.dark, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.full, paddingVertical: 8 },
  actionText: { fontSize: fontSize.sm, fontWeight: '600' },
})

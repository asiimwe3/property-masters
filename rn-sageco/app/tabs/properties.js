import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Land', 'Green Project']

function PropertyCard({ item, onPress }) {
  const image = item.images?.[0]
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {image ? (
        <Image source={{ uri: image }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Ionicons name="business" size={40} color={colors.gray200} />
        </View>
      )}
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>⭐ Featured</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={13} color={colors.gray400} />
          <Text style={styles.cardSub} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          {item.bedrooms ? <Text style={styles.cardMeta}>🛏 {item.bedrooms}</Text> : null}
          {item.bathrooms ? <Text style={styles.cardMeta}>🚿 {item.bathrooms}</Text> : null}
          {item.area_sqft ? <Text style={styles.cardMeta}>📐 {item.area_sqft} sqft</Text> : null}
        </View>
        <Text style={styles.cardPrice}>
          UGX {Number(item.price).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default function PropertiesScreen() {
  const [properties, setProperties] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    let res = properties
    if (category !== 'All') res = res.filter(p => p.category === category)
    if (search) res = res.filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(res)
  }, [properties, category, search])

  async function fetchProperties() {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    if (!error) setProperties(data || [])
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Properties 🏠</Text>
        <Text style={styles.headerSub}>Browse listings across Uganda</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            placeholderTextColor={colors.gray400}
            value={search}
            onChangeText={setSearch}
          />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={colors.gray400} /></TouchableOpacity> : null}
        </View>
      </View>

      {/* Category filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={c => c}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategory(item)}
            style={[styles.filterBtn, category === item && styles.filterBtnActive]}
          >
            <Text style={[styles.filterBtnText, category === item && styles.filterBtnTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyText}>No properties found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PropertyCard item={item} onPress={() => router.push(`/property/${item.id}`)} />
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
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm, marginBottom: spacing.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: spacing.md, gap: 8, height: 42 },
  searchInput: { flex: 1, fontSize: fontSize.base, color: colors.dark },
  filterRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 8 },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray600 },
  filterBtnTextActive: { color: colors.white },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden', ...shadow.md },
  cardImage: { width: '100%', height: 180 },
  cardImagePlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  featuredBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.secondary, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  featuredText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.dark },
  cardBody: { padding: spacing.md, gap: 6 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.dark },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cardSub: { fontSize: fontSize.sm, color: colors.gray500, flex: 1 },
  cardCategory: { fontSize: fontSize.xs, color: colors.primary, backgroundColor: colors.green100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, fontWeight: '600' },
  cardMeta: { fontSize: fontSize.xs, color: colors.gray500 },
  cardPrice: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: fontSize.base, color: colors.gray400 },
})

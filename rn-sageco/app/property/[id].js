import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

const { width } = Dimensions.get('window')

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function fetchProperty() {
      const { data } = await supabase.from('properties').select('*').eq('id', id).single()
      setProperty(data)
      setLoading(false)
    }
    if (id) fetchProperty()
  }, [id])

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, marginTop: 80 }} />
  if (!property) return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Property not found</Text>
    </View>
  )

  const images = property.images || []

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Image Gallery */}
      {images.length > 0 ? (
        <View>
          <Image source={{ uri: images[activeImage] }} style={styles.mainImage} resizeMode="cover" />
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <Image source={{ uri: img }} style={[styles.thumb, i === activeImage && styles.thumbActive]} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={[styles.mainImage, styles.imagePlaceholder]}>
          <Ionicons name="business" size={60} color={colors.gray200} />
        </View>
      )}

      <View style={styles.body}>
        {/* Title & Price */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.gray400} />
              <Text style={styles.location}>{property.location}</Text>
            </View>
          </View>
          <View>
            {property.featured && <Text style={styles.featuredBadge}>⭐ Featured</Text>}
            <Text style={styles.category}>{property.category}</Text>
          </View>
        </View>

        <Text style={styles.price}>UGX {Number(property.price).toLocaleString()}</Text>

        {/* Specs */}
        <View style={styles.specsRow}>
          {property.bedrooms && <View style={styles.spec}><Text style={styles.specIcon}>🛏</Text><Text style={styles.specText}>{property.bedrooms} Beds</Text></View>}
          {property.bathrooms && <View style={styles.spec}><Text style={styles.specIcon}>🚿</Text><Text style={styles.specText}>{property.bathrooms} Baths</Text></View>}
          {property.area_sqft && <View style={styles.spec}><Text style={styles.specIcon}>📐</Text><Text style={styles.specText}>{property.area_sqft} sqft</Text></View>}
        </View>

        {/* Description */}
        {property.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push(`/book?property=${id}&title=${encodeURIComponent(property.title)}`)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.dark} />
          <Text style={styles.bookBtnText}>Book a Viewing — UGX 30,000</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.gray100 },
  mainImage: { width: '100%', height: 260 },
  imagePlaceholder: { backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' },
  thumbRow: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.dark },
  thumb: { width: 60, height: 60, borderRadius: radius.sm, marginRight: 6, opacity: 0.6 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: colors.secondary },
  body: { padding: spacing.md },
  titleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: fontSize.sm, color: colors.gray500 },
  featuredBadge: { fontSize: fontSize.xs, color: colors.dark, backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  category: { fontSize: fontSize.xs, color: colors.primary, backgroundColor: colors.green100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, fontWeight: '600', textAlign: 'center' },
  price: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary, marginBottom: spacing.md },
  specsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  spec: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', gap: 4, ...shadow.sm },
  specIcon: { fontSize: 20 },
  specText: { fontSize: fontSize.xs, color: colors.gray600, fontWeight: '600' },
  section: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  description: { fontSize: fontSize.base, color: colors.gray600, lineHeight: 24 },
  bookBtn: { backgroundColor: colors.secondary, borderRadius: radius.full, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow.md, marginBottom: spacing.xl },
  bookBtnText: { fontSize: fontSize.base, fontWeight: '700', color: colors.dark },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: fontSize.base, color: colors.gray400 },
})

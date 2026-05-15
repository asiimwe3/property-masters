import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme'

function ProjectCard({ item }) {
  const image = item.images?.[0]
  return (
    <View style={styles.card}>
      {image ? (
        <Image source={{ uri: image }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.imagePlaceholder]}>
          <Ionicons name="leaf" size={40} color={colors.gray200} />
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>🌿 Green Project</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.location && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={13} color={colors.gray400} />
            <Text style={styles.cardSub}>{item.location}</Text>
          </View>
        )}
        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
        )}
        <Text style={styles.cardPrice}>UGX {Number(item.price).toLocaleString()}</Text>
      </View>
    </View>
  )
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('category', 'Green Project')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
      if (!error) setProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Green Projects 🌿</Text>
        <Text style={styles.headerSub}>Eco-friendly developments across Uganda</Text>
      </View>

      {/* Mission Banner */}
      <View style={styles.missionBanner}>
        <Text style={styles.missionText}>
          🌱 SAGECO EVERGREEN is committed to environmentally sustainable real estate. Our green projects promote eco-friendly living and land stewardship across Uganda.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : projects.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyText}>No green projects listed yet</Text>
          <Text style={styles.emptySubText}>Check back soon!</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ProjectCard item={item} />}
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
  missionBanner: { margin: spacing.md, backgroundColor: colors.green100, borderRadius: radius.md, padding: spacing.md },
  missionText: { fontSize: fontSize.sm, color: colors.green800, lineHeight: 20 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden', ...shadow.md },
  cardImage: { width: '100%', height: 180 },
  imagePlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: spacing.md, gap: 6 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: colors.green100, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  categoryText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.dark },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardSub: { fontSize: fontSize.sm, color: colors.gray400 },
  cardDesc: { fontSize: fontSize.sm, color: colors.gray600, lineHeight: 20 },
  cardPrice: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: fontSize.base, color: colors.gray400 },
  emptySubText: { fontSize: fontSize.sm, color: colors.gray400 },
})

import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const CATEGORIES = ['Residential', 'Commercial', 'Land', 'Green Project']

export default function UploadPropertyScreen() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '',
    category: 'Residential', bedrooms: '', bathrooms: '',
    area_sqft: '', images: '',
  })

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.location) {
      Alert.alert('Missing Fields', 'Please fill in title, price and location.')
      return
    }
    if (!user) { router.push('/auth/login'); return }
    setLoading(true)
    try {
      const imageUrls = form.images
        ? form.images.split('\n').map(u => u.trim()).filter(Boolean)
        : []
      const { error } = await supabase.from('properties').insert([{
        title: form.title,
        description: form.description || null,
        price: parseFloat(form.price),
        location: form.location,
        category: form.category,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        area_sqft: form.area_sqft ? parseFloat(form.area_sqft) : null,
        images: imageUrls,
        broker_id: user.id,
        status: 'available',
      }])
      if (error) throw error
      setSuccess(true)
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit property')
    }
    setLoading(false)
  }

  if (!user) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.gray200} />
        <Text style={styles.emptyText}>Sign in to list a property</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )

  if (success) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={{ fontSize: 60 }}>✅</Text>
        <Text style={styles.successTitle}>Property Submitted!</Text>
        <Text style={styles.successSub}>Your listing has been added and is now live on SAGECO EVERGREEN.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/tabs/properties')}>
          <Text style={styles.btnText}>Browse Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setSuccess(false); setForm({ title: '', description: '', price: '', location: '', category: 'Residential', bedrooms: '', bathrooms: '', area_sqft: '', images: '' }) }}>
          <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 8 }}>Add Another</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List a Property</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.label}>Property Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. 3 Bedroom House in Kololo" placeholderTextColor={colors.gray400} value={form.title} onChangeText={set('title')} />

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.catRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} onPress={() => set('category')(c)} style={[styles.catBtn, form.category === c && styles.catBtnActive]}>
                <Text style={[styles.catText, form.category === c && styles.catTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Location */}
          <Text style={styles.label}>Location *</Text>
          <TextInput style={styles.input} placeholder="e.g. Kololo, Kampala" placeholderTextColor={colors.gray400} value={form.location} onChangeText={set('location')} />

          {/* Price */}
          <Text style={styles.label}>Price (UGX) *</Text>
          <TextInput style={styles.input} placeholder="e.g. 450000000" placeholderTextColor={colors.gray400} value={form.price} onChangeText={set('price')} keyboardType="numeric" />

          {/* Bedrooms / Bathrooms / Area */}
          <View style={styles.threeRow}>
            <View style={styles.threeCol}>
              <Text style={styles.label}>Bedrooms</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.gray400} value={form.bedrooms} onChangeText={set('bedrooms')} keyboardType="numeric" />
            </View>
            <View style={styles.threeCol}>
              <Text style={styles.label}>Bathrooms</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.gray400} value={form.bathrooms} onChangeText={set('bathrooms')} keyboardType="numeric" />
            </View>
            <View style={styles.threeCol}>
              <Text style={styles.label}>Area (sqft)</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.gray400} value={form.area_sqft} onChangeText={set('area_sqft')} keyboardType="numeric" />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Describe the property..." placeholderTextColor={colors.gray400} value={form.description} onChangeText={set('description')} multiline numberOfLines={4} textAlignVertical="top" />

          {/* Image URLs */}
          <Text style={styles.label}>Image URLs (one per line)</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"} placeholderTextColor={colors.gray400} value={form.images} onChangeText={set('images')} multiline numberOfLines={4} textAlignVertical="top" autoCapitalize="none" />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.dark} /> : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color={colors.dark} />
                <Text style={styles.submitBtnText}>Submit Listing</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  container: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, ...shadow.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.dark, marginBottom: 6, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.base, color: colors.dark },
  textarea: { minHeight: 90, paddingTop: spacing.md },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.gray200 },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: fontSize.sm, color: colors.gray600, fontWeight: '600' },
  catTextActive: { color: colors.white },
  threeRow: { flexDirection: 'row', gap: spacing.sm },
  threeCol: { flex: 1 },
  submitBtn: { backgroundColor: colors.secondary, borderRadius: radius.full, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.lg },
  submitBtnText: { color: colors.dark, fontSize: fontSize.base, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyText: { fontSize: fontSize.base, color: colors.gray400, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  btnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
  successTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  successSub: { fontSize: fontSize.base, color: colors.gray500, textAlign: 'center' },
})

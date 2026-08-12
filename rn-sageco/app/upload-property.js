/**
 * SageCo Evergreen — Upload Property (FIXED)
 * ============================================
 * Fixes audit findings:
 * - "No image upload from device" → uses expo-image-picker
 * - "No authorization check" → verifies user is a registered broker
 * - "No input validation" → uses validation utilities
 * - "No error handling" → proper try/catch with cleanup
 *
 * Flow:
 * 1. Check if user is authenticated and is a registered broker
 * 2. User picks images from device gallery
 * 3. Images are uploaded to Supabase Storage
 * 4. Property record is inserted with image URLs
 */

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { supabase, isVerifiedBroker } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme';
import { CATEGORIES } from '../lib/config';
import { validateProperty, sanitizeString } from '../lib/validation';

export default function UploadPropertyScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]); // Array of {uri, name}

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: 'Residential',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
  });

  const [error, setError] = useState('');
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  // ─── Pick images from device gallery ─────────────────────
  const pickImages = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7, // Compress to 70% quality
      selectionLimit: 5, // Max 5 images per property
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset, i) => ({
        uri: asset.uri,
        name: `property-${Date.now()}-${i}.jpg`,
      }));
      setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 total
    }
  };

  // ─── Upload images to Supabase Storage ───────────────────
  const uploadImagesToStorage = async (userId) => {
    if (images.length === 0) return [];

    setUploadingImages(true);
    const imageUrls = [];

    try {
      for (const img of images) {
        // Read the image as base64
        const base64 = await FileSystem.readAsStringAsync(img.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Upload to Supabase Storage
        const filePath = `properties/${userId}/${img.name}`;
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, decode(base64), {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (error) {
          console.error('[Upload] Image upload error:', error.message);
          continue; // Skip failed images
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      }
    } finally {
      setUploadingImages(false);
    }

    return imageUrls;
  };

  // ─── Submit property ─────────────────────────────────────
  const handleSubmit = async () => {
    // 1. Validate all inputs
    const errors = validateProperty(form);
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    // 2. Check authentication
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to list a property.', [
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    // 3. Check if user is a registered broker (audit: "No authorization check")
    const brokerOk = await isVerifiedBroker(supabase);
    if (!brokerOk) {
      Alert.alert(
        'Broker Registration Required',
        'Only registered brokers can list properties. Please register as a broker first.',
        [
          { text: 'Register', onPress: () => router.push('/broker-register') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 4. Upload images to Supabase Storage
      const imageUrls = await uploadImagesToStorage(user.id);

      // 5. Insert property record
      // RLS ensures broker_id must match the authenticated user
      const { error: insertErr } = await supabase.from('properties').insert([{
        title: sanitizeString(form.title),
        description: sanitizeString(form.description) || null,
        price: parseFloat(form.price),
        location: sanitizeString(form.location),
        category: form.category,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        area_sqft: form.area_sqft ? parseFloat(form.area_sqft) : null,
        images: imageUrls,
        broker_id: user.id, // RLS enforces this must be the authenticated user
        status: 'available',
      }]);

      if (insertErr) throw new Error(insertErr.message);

      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Failed to submit property. Please try again.');
    }

    setLoading(false);
  };

  // ─── Success screen ──────────────────────────────────────
  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Property Listed!</Text>
          <Text style={styles.successSub}>
            Your property is now live and visible to buyers.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/my-properties')}>
            <Text style={styles.btnText}>View My Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => {
            setSuccess(false);
            setForm({ title: '', description: '', price: '', location: '', category: 'Residential', bedrooms: '', bathrooms: '', area_sqft: '' });
            setImages([]);
          }}>
            <Text style={styles.secondaryBtnText}>List Another</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Not signed in ───────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.gray200} />
          <Text style={styles.emptyText}>Sign in to list properties</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Upload Form ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>List a Property</Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.red500} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Image picker section */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>Property Images (max 5)</Text>
          <View style={styles.imageRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumb}>
                <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                <TouchableOpacity
                  style={styles.removeImg}
                  onPress={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close-circle" size={20} color={colors.red500} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImgBtn} onPress={pickImages}>
                <Ionicons name="add" size={28} color={colors.gray400} />
                <Text style={styles.addImgText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3 Bedroom House in Kampala"
            placeholderTextColor={colors.gray400}
            value={form.title}
            onChangeText={set('title')}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe the property..."
            placeholderTextColor={colors.gray400}
            value={form.description}
            onChangeText={set('description')}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Price (UGX) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 150000000"
            placeholderTextColor={colors.gray400}
            value={form.price}
            onChangeText={set('price')}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kampala, Uganda"
            placeholderTextColor={colors.gray400}
            value={form.location}
            onChangeText={set('location')}
          />

          {/* Category selector */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, form.category === cat && styles.categoryActive]}
                onPress={() => set('category')(cat)}
              >
                <Text
                  style={styles.categoryText}
                  style2={form.category === cat ? styles.categoryTextActive : styles.categoryText}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bedroom / Bathroom */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Bedrooms</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 3"
                placeholderTextColor={colors.gray400}
                value={form.bedrooms}
                onChangeText={set('bedrooms')}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.label}>Bathrooms</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2"
                placeholderTextColor={colors.gray400}
                value={form.bathrooms}
                onChangeText={set('bathrooms')}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Area (sqft)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2000"
            placeholderTextColor={colors.gray400}
            value={form.area_sqft}
            onChangeText={set('area_sqft')}
            keyboardType="numeric"
          />

          {/* Submit */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleSubmit}
            disabled={loading || uploadingImages}
          >
            {(loading || uploadingImages) ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={18} color={colors.white} />
                <Text style={styles.btnText}>List Property</Text>
              </>
            )}
          </TouchableOpacity>
          {uploadingImages && <Text style={styles.uploadText}>Uploading images...</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  container: { paddingBottom: spacing.xl },
  header: {
    backgroundColor: colors.primary, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: radius.md, padding: spacing.sm,
    margin: spacing.md, marginBottom: 0,
  },
  errorText: { flex: 1, fontSize: fontSize.sm, color: colors.red500 },
  imageSection: { margin: spacing.md },
  label: {
    fontSize: fontSize.sm, fontWeight: '600', color: colors.dark,
    marginBottom: 6, marginTop: spacing.sm,
  },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },
  imageThumb: { width: 80, height: 80, borderRadius: radius.md, position: 'relative' },
  thumbImg: { width: 80, height: 80, borderRadius: radius.md },
  removeImg: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.white, borderRadius: radius.full },
  addImgBtn: {
    width: 80, height: 80, borderRadius: radius.md, borderWidth: 2, borderColor: colors.gray200,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  addImgText: { fontSize: fontSize.xs, color: colors.gray400, marginTop: 2 },
  card: {
    margin: spacing.md, backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, ...shadow.md,
  },
  input: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md,
    padding: spacing.md, fontSize: fontSize.base, color: colors.dark,
  },
  textarea: { minHeight: 90, paddingTop: spacing.md, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryBtn: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  categoryActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  categoryText: { fontSize: fontSize.sm, color: colors.gray600 },
  categoryTextActive: { fontSize: fontSize.sm, color: colors.white, fontWeight: '600' },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.full, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: spacing.lg,
  },
  btnText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
  uploadText: { textAlign: 'center', fontSize: fontSize.xs, color: colors.gray400, marginTop: 4 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  successEmoji: { fontSize: 56 },
  successTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  successSub: { fontSize: fontSize.base, color: colors.gray500, textAlign: 'center' },
  secondaryBtn: { marginTop: spacing.sm },
  secondaryBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyText: { fontSize: fontSize.base, color: colors.gray400, textAlign: 'center' },
});

// Helper: decode base64 to ArrayBuffer for Supabase upload
function decode(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

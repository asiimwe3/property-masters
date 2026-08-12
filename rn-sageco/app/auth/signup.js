/**
 * SageCo Evergreen — Signup Screen (FIXED)
 * =========================================
 * Fixes:
 * - Better validation with clear error messages
 * - Email verification notice after signup
 * - Password confirmation check
 * - Uses validation utilities
 */

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme';
import { isValidEmail } from '../../lib/validation';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // ─── Handle signup ──────────────────────────────────────
  const handleSignUp = async () => {
    // Validate all fields
    if (!form.full_name || form.full_name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    if (!form.email || !isValidEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
      });
      setSuccess(true);
    } catch (e) {
      // Handle specific Supabase errors
      if (e.message.includes('already registered') || e.message.includes('already been registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (e.message.includes('password')) {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(e.message || 'Sign up failed. Please try again.');
      }
    }
    setLoading(false);
  };

  // ─── Success screen (after signup) ──────────────────────
  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>📧</Text>
        <Text style={styles.successTitle}>Check Your Email!</Text>
        <Text style={styles.successSub}>
          We sent a verification link to{'\n'}
          <Text style={{ fontWeight: '700', color: colors.dark }}>{form.email}</Text>
          {'\n\n'}Click the link to verify your account, then sign in.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.btnText}>Go to Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/tabs/home')}>
          <Text style={styles.secondaryBtnText}>Browse as Guest</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Signup form ────────────────────────────────────────
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoArea}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <Text style={styles.logoTitle}>
          SAGECO <Text style={{ color: colors.secondary }}>EVERGREEN</Text>
        </Text>
        <Text style={styles.logoSub}>Create your account</Text>
      </View>

      <View style={styles.card}>
        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.red500} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor={colors.gray400}
          value={form.full_name}
          onChangeText={(v) => { set('full_name')(v); setError(''); }}
        />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.gray400}
          value={form.email}
          onChangeText={(v) => { set('email')(v); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passBox}>
          <TextInput
            style={styles.passInput}
            placeholder="Min. 6 characters"
            placeholderTextColor={colors.gray400}
            value={form.password}
            onChangeText={(v) => { set('password')(v); setError(''); }}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat password"
          placeholderTextColor={colors.gray400}
          value={form.confirm}
          onChangeText={(v) => { set('confirm')(v); setError(''); }}
          secureTextEntry={!showPass}
        />

        {/* Sign up button */}
        <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.btnText}>Create Account</Text>
          }
        </TouchableOpacity>

        {/* Sign in link */}
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.secondaryBtnText}>
            Already have an account?{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.gray100 },
  container: { padding: spacing.lg, paddingTop: spacing.xl },
  logoArea: { alignItems: 'center', marginBottom: spacing.xl },
  logoIcon: {
    width: 70, height: 70, borderRadius: radius.xl, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  logoEmoji: { fontSize: 36 },
  logoTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  logoSub: { fontSize: fontSize.base, color: colors.gray500, marginTop: 4 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, ...shadow.md,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md,
  },
  errorText: { flex: 1, fontSize: fontSize.sm, color: colors.red500 },
  label: {
    fontSize: fontSize.sm, fontWeight: '600', color: colors.dark,
    marginBottom: 6, marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md,
    padding: spacing.md, fontSize: fontSize.base, color: colors.dark,
  },
  passBox: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: colors.gray200, borderRadius: radius.md, paddingHorizontal: spacing.md,
  },
  passInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.base, color: colors.dark },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.full, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.lg,
  },
  btnText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
  secondaryBtn: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  secondaryBtnText: { fontSize: fontSize.sm, color: colors.gray500 },
  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: spacing.md, backgroundColor: colors.gray100,
  },
  successEmoji: { fontSize: 56 },
  successTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.dark },
  successSub: {
    fontSize: fontSize.base, color: colors.gray500, textAlign: 'center', lineHeight: 24,
  },
  secondaryBtn: { marginTop: spacing.sm },
  secondaryBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
});

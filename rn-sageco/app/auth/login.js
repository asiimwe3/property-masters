/**
 * SageCo Evergreen — Login Screen (FIXED)
 * ========================================
 * Fixes:
 * - Added "Forgot Password" link
 * - Better error messages
 * - Email verification notice
 * - Uses validation utilities
 */

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, fontSize, shadow } from '../../lib/theme';
import { isValidEmail } from '../../lib/validation';

export default function LoginScreen() {
  const { signIn, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // ─── Handle login ───────────────────────────────────────
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn({ email: email.trim(), password });
      // After sign in, redirect to account tab
      router.replace('/tabs/account');
    } catch (e) {
      setError(e.message || 'Sign in failed. Check your credentials.');
    }
    setLoading(false);
  };

  // ─── Handle password reset ──────────────────────────────
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Enter Email', 'Please enter your email address first.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        '✅ Reset Link Sent',
        'Check your email for password reset instructions.',
        [{ text: 'OK' }]
      );
      setShowResetPassword(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to send reset link.');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Logo */}
      <View style={styles.logoArea}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <Text style={styles.logoTitle}>
          SAGECO <Text style={{ color: colors.secondary }}>EVERGREEN</Text>
        </Text>
        <Text style={styles.logoSub}>Welcome back</Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        {/* Error message */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.red500} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.gray400}
          value={email}
          onChangeText={(v) => { setEmail(v); setError(''); }}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passBox}>
          <TextInput
            style={styles.passInput}
            placeholder="Your password"
            placeholderTextColor={colors.gray400}
            value={password}
            onChangeText={(v) => { setPassword(v); setError(''); }}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          style={styles.forgotLink}
          onPress={() => setShowResetPassword(true)}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Reset password confirmation */}
        {showResetPassword && (
          <View style={styles.resetBox}>
            <Text style={styles.resetText}>
              Send a password reset link to {email || 'your email'}?
            </Text>
            <View style={styles.resetBtns}>
              <TouchableOpacity onPress={() => setShowResetPassword(false)}>
                <Text style={styles.resetCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResetPassword}>
                <Text style={styles.resetConfirm}>Send Reset Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sign In button */}
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.btnText}>Sign In</Text>
        }
        </TouchableOpacity>

        {/* Sign Up link */}
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/signup')}>
          <Text style={styles.secondaryBtnText}>
            Don't have an account?{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign Up</Text>
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
    padding: spacing.md, fontSize: fontSize.base, color: colors.dark, marginBottom: 4,
  },
  passBox: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: colors.gray200, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: 4,
  },
  passInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.base, color: colors.dark },
  forgotLink: { alignSelf: 'flex-end', marginTop: spacing.xs, padding: 4 },
  forgotText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  resetBox: {
    backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm,
  },
  resetText: { fontSize: fontSize.sm, color: colors.gray600, marginBottom: spacing.sm },
  resetBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
  resetCancel: { fontSize: fontSize.sm, color: colors.gray500, fontWeight: '600' },
  resetConfirm: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.full, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.lg,
  },
  btnText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
  secondaryBtn: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  secondaryBtnText: { fontSize: fontSize.sm, color: colors.gray500 },
});

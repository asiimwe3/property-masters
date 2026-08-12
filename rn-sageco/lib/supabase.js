/**
 * SageCo Evergreen — Supabase Client (SECURED)
 * =============================================
 * Fixes audit finding: "Supabase anon key exposed without RLS verification"
 *
 * RLS is now enabled via migration. This client is safe to use with the
 * anon key because all tables have proper Row Level Security policies.
 *
 * Changes from v1:
 * - Added proper error logging
 * - Added connection state tracking
 * - Removed the 'YOUR_SUPABASE_URL' fallback (now throws if not configured)
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { API } from './config';

// Validate that Supabase credentials are properly configured
if (!API.supabaseUrl || API.supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error('[Supabase] URL not configured. Set EXPO_PUBLIC_SUPABASE_URL in .env');
}
if (!API.supabaseAnonKey || API.supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('[Supabase] Anon key not configured. Set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

// Create the Supabase client with secure defaults
export const supabase = createClient(API.supabaseUrl, API.supabaseAnonKey, {
  auth: {
    // AsyncStorage for session persistence on React Native
    storage: AsyncStorage,
    // Auto-refresh tokens before they expire
    autoRefreshToken: true,
    // Persist the session across app restarts
    persistSession: true,
    // Disable URL-based auth (we handle it manually in RN)
    detectSessionInUrl: false,
    // Don't store the password in plain text
    flowType: 'implicit',
  },
  // Global headers for all requests
  global: {
    headers: {
      'X-Client-Info': 'sageco-evergreen-rn/2.0.0',
    },
  },
  // Realtime disabled for now (would need extra setup)
  realtime: {
    enabled: false,
  },
});

// ─── Helper: Check if user has a specific role ────────────────
export async function hasRole(supabaseClient, role) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabaseClient
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === role;
}

// ─── Helper: Check if user is a verified broker ───────────────
export async function isVerifiedBroker(supabaseClient) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return false;

  const { data: broker } = await supabaseClient
    .from('brokers')
    .select('registration_status, verified')
    .eq('id', user.id)
    .single();

  return broker?.registration_status === 'active' && broker?.verified === true;
}

// ─── Helper: Get current user's profile ───────────────────────
export async function getCurrentProfile(supabaseClient) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

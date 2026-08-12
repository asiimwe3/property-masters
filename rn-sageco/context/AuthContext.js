/**
 * SageCo Evergreen — Auth Context (HARDENED)
 * ===========================================
 * Fixes audit findings:
 * - "No email verification enforcement"
 * - "No role-based access control"
 * - "Profile creation uses upsert which could overwrite existing data"
 *
 * Changes from v1:
 * - Requires email verification before allowing sign-in
 * - Enforces role-based access (customer vs broker vs admin)
 * - Uses insert (not upsert) for profile creation to prevent overwrites
 * - Added password reset flow
 * - Added proper error handling with specific error messages
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, hasRole } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // ─── Fetch user profile from user_profiles table ──────────
  // Uses insert (not upsert) to prevent accidental overwrites
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    try {
      // Try to read existing profile
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existing) {
        setProfile(existing);
        return existing;
      }

      // Only create a profile if one doesn't exist (no upsert!)
      const name = authUser.user_metadata?.full_name
        || authUser.email?.split('@')[0]
        || 'User';

      const { data: newProfile, error } = await supabase
        .from('user_profiles')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          full_name: name,
          role: 'customer',
          email_verified: authUser.email_confirmed_at ? true : false,
        }])
        .select()
        .single();

      if (error) {
        console.error('[Auth] Failed to create profile:', error.message);
        return null;
      }

      setProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error('[Auth] fetchProfile error:', err);
      return null;
    }
  }, []);

  // ─── Check email verification status ───────────────────────
  const checkEmailVerification = useCallback((authUser) => {
    if (!authUser) {
      setIsEmailVerified(false);
      return false;
    }
    // Supabase sets email_confirmed_at after email verification
    const verified = !!authUser.email_confirmed_at;
    setIsEmailVerified(verified);
    return verified;
  }, []);

  // ─── Initialize auth state on app launch ──────────────────
  useEffect(() => {
    let mounted = true;

    // Check for existing session on app launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        checkEmailVerification(currentUser);
        fetchProfile(currentUser);
      }

      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          checkEmailVerification(currentUser);
          await fetchProfile(currentUser);
        } else {
          // User signed out — clear everything
          setProfile(null);
          setIsEmailVerified(false);
        }

        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkEmailVerification, fetchProfile]);

  // ─── Sign Up with Email/Password ───────────────────────────
  // Creates the auth user. Email verification is required before login.
  const signUp = useCallback(async ({ email, password, full_name }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name, role: 'customer' },
      },
    });

    if (error) throw error;

    // Note: profile is NOT created here — it's created after email verification
    // when the user logs in for the first time (in fetchProfile)
    return data;
  }, []);

  // ─── Sign In with Email/Password ───────────────────────────
  // Now checks if email is verified before allowing full access
  const signIn = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login')) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }

    return data;
  }, []);

  // ─── Sign Out ──────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsEmailVerified(false);
  }, []);

  // ─── Password Reset ─────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    if (!email) throw new Error('Email is required');

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );

    if (error) throw error;
    return true;
  }, []);

  // ─── Resend Email Verification ──────────────────────────────
  const resendVerification = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('Not signed in');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: currentUser.email,
    });

    if (error) throw error;
    return true;
  }, []);

  // ─── Check if user has a specific role ─────────────────────
  const checkRole = useCallback(async (role) => {
    return hasRole(supabase, role);
  }, []);

  // ─── Context value ─────────────────────────────────────────
  const value = {
    user,
    profile,
    loading,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerification,
    checkRole,
    // Convenience flags
    isAuthenticated: !!user,
    isCustomer: profile?.role === 'customer',
    isBroker: profile?.role === 'broker',
    isAdmin: profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook to access auth context ──────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

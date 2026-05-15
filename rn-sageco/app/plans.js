import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, radius, fontSize, shadow } from '../lib/theme'

const PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    priceNum: 0,
    color: colors.gray100,
    textColor: colors.dark,
    badge: null,
    features: ['Browse all properties', 'View broker profiles', 'Book viewings (fee applies)', 'Create account'],
  },
  {
    name: 'Broker',
    price: 'UGX 32,000',
    priceNum: 32000,
    sub: '+ UGX 45,000 activation',
    color: colors.primary,
    textColor: colors.white,
    badge: '⭐ Most Popular',
    features: ['List properties', 'Broker profile page', 'Client leads via platform', 'Dashboard access (activation)', 'Verified broker badge'],
    route: '/broker-register',
  },
  {
    name: 'Premium',
    price: 'Contact Us',
    priceNum: null,
    color: colors.secondary,
    textColor: colors.dark,
    badge: '🏆 Enterprise',
    features: ['Everything in Broker', 'Featured property listings', 'Priority placement', 'Dedicated account manager', 'Analytics dashboard'],
    route: '/contact',
  },
]

export default function PlansScreen() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose the plan that works for you</Text>

        {PLANS.map(({ name, price, sub, color, textColor, badge, features, route }) => (
          <View key={name} style={[styles.planCard, { backgroundColor: color }]}>
            {badge && (
              <View style={styles.badgeRow}>
                <Text style={[styles.badge, { color: textColor === colors.white ? colors.secondary : colors.primary }]}>{badge}</Text>
              </View>
            )}
            <Text style={[styles.planName, { color: textColor }]}>{name}</Text>
            <Text style={[styles.planPrice, { color: textColor }]}>{price}</Text>
            {sub && <Text style={[styles.planSub, { color: textColor === colors.white ? 'rgba(255,255,255,0.7)' : colors.gray500 }]}>{sub}</Text>}

            <View style={styles.featuresList}>
              {features.map(f => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={textColor === colors.white ? colors.secondary : colors.primary} />
                  <Text style={[styles.featureText, { color: textColor === colors.white ? 'rgba(255,255,255,0.9)' : colors.dark }]}>{f}</Text>
                </View>
              ))}
            </View>

            {route && (
              <TouchableOpacity
                style={[styles.planBtn, { backgroundColor: textColor === colors.white ? colors.secondary : colors.primary }]}
                onPress={() => router.push(route)}
              >
                <Text style={[styles.planBtnText, { color: textColor === colors.white ? colors.dark : colors.white }]}>
                  {name === 'Premium' ? 'Contact Sales' : 'Get Started'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray100 },
  header: { backgroundColor: colors.primary, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  container: { padding: spacing.md, paddingBottom: spacing.xxl },
  intro: { fontSize: fontSize.base, color: colors.gray500, marginBottom: spacing.md, textAlign: 'center' },
  planCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadow.md },
  badgeRow: { marginBottom: 4 },
  badge: { fontSize: fontSize.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  planName: { fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 },
  planPrice: { fontSize: fontSize.xxl, fontWeight: '900' },
  planSub: { fontSize: fontSize.sm, marginTop: 2, marginBottom: spacing.sm },
  featuresList: { marginTop: spacing.md, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: fontSize.base, flex: 1 },
  planBtn: { marginTop: spacing.lg, borderRadius: radius.full, padding: spacing.md, alignItems: 'center' },
  planBtnText: { fontSize: fontSize.base, fontWeight: '700' },
})

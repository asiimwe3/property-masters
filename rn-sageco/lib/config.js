/**
 * SageCo Evergreen — Central Configuration
 * =========================================
 * All hardcoded values (contact info, fees, API URLs) live here.
 * This fixes the audit finding: "Hardcoded contact info across 4+ files"
 *
 * Update values in ONE place and they propagate everywhere.
 */

// ─── Brand & Contact ───────────────────────────────────────────
export const BRAND = {
  name: 'SAGECO EVERGREEN',
  shortName: 'SAGECO',
  tagline: 'Premier Real Estate Platform in Uganda',
  emoji: '🌿',
  version: '2.0.0',
};

export const CONTACT = {
  phonePrimary: '0750 414 366',
  phonePrimaryTel: 'tel:0750414366',
  phoneSecondary: '0782 067 425',
  phoneSecondaryTel: 'tel:0782067425',
  whatsappNumber: '256750414366',
  whatsappUrl: 'https://wa.me/256750414366',
  email: 'info@sagecoevergreen.com',
  emailUrl: 'mailto:info@sagecoevergreen.com',
  location: 'Kyenjojo, Western Uganda',
  mapsUrl: 'https://maps.google.com/?q=Kyenjojo+Uganda',
  website: 'sageco-evergreen.vercel.app',
  websiteUrl: 'https://sageco-evergreen.vercel.app',
  officeHours: {
    weekdays: '8:00 AM – 6:00 PM',
    saturday: '9:00 AM – 3:00 PM',
    sunday: 'Closed',
  },
};

// ─── Payment Fees (all in UGX) ──────────────────────────────────
export const FEES = {
  VIEWING: 30000,          // Property viewing booking fee
  BROKER_REG: 32000,       // Broker registration fee
  BROKER_ACTIVATION: 45000, // Broker dashboard activation fee
};

export const CURRENCY = 'UGX';

// ─── API Configuration ─────────────────────────────────────────
export const API = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://sageco-evergreen.vercel.app',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  pesapalEnv: process.env.EXPO_PUBLIC_PESAPAL_ENV || 'sandbox',
};

// ─── Property Categories ───────────────────────────────────────
export const CATEGORIES = [
  'Residential',
  'Commercial',
  'Land',
  'Green Project',
];

// ─── App Colors (re-exported from theme) ───────────────────────
export const STATUS_COLORS = {
  pending: '#fde68a',
  confirmed: '#bbf7d0',
  completed: '#bfdbfe',
  cancelled: '#fecaca',
  available: '#bbf7d0',
  sold: '#fecaca',
};

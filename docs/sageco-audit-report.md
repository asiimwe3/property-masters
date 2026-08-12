# SAGECO EVERGREEN — Deep Technical Audit Report

**Auditor:** Derick AI
**Date:** August 11, 2026
**Scope:** Full-stack audit — web app (Vercel), React Native app (rn-sageco), native Android app (Kotlin/Compose), backend (Supabase)
**Live URL:** https://sageco-evergreen.vercel.app/
**Source repos:** github.com/asiimwe3/property-masters (rn-sageco + Kotlin), github.com/asiimwe3/sageco-evergreen-app (WebView wrapper)

---

## EXECUTIVE SUMMARY

SageCo Evergreen is a real estate platform targeting Uganda with property listings, broker registration, viewing bookings, and PesaPal payments. It exists across three codebases with significant fragmentation and divergent architectures.

**Overall Score: 32/100 — CRITICAL**

Functional UI and basic CRUD against Supabase, but critical security vulnerabilities, broken payment infrastructure, no financial ledger, no transactional integrity, and three disconnected codebases.

| Category | Score | Status |
|----------|-------|--------|
| Security | 15/100 | CRITICAL |
| Data Architecture | 35/100 | POOR |
| Payment/Financial Integrity | 10/100 | BROKEN |
| API Design | 30/100 | POOR |
| Frontend (Web) | 55/100 | FAIR |
| Frontend (React Native) | 60/100 | FAIR |
| Frontend (Kotlin) | 45/100 | POOR |
| Authentication | 40/100 | POOR |
| Scalability | 20/100 | CRITICAL |
| Code Quality | 50/100 | FAIR |
| DevOps/CI-CD | 45/100 | FAIR |
| Documentation | 30/100 | POOR |

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Three Codebases

1. **Next.js Web App** (Vercel) — No source in GitHub. 15+ pages, 7 API routes. Static export with client-side data fetching.
2. **React Native App** (Expo/RN) — In property-masters/rn-sageco. 17 screens. Uses Supabase directly.
3. **Kotlin Android App** (Jetpack Compose) — In property-masters/property-masters. 5 tabs. Uses Firebase.

### 1.2 Critical: THREE Backends

1. **Supabase (PostgreSQL)** — web app + React Native app
2. **Firebase (Firestore)** — Kotlin Android app only
3. **Supabase Storage** — property images (mixed with Base44 media CDN)

Property data entered via web (Supabase) is invisible to the Kotlin app (Firebase). The two mobile apps use entirely different databases with incompatible data models.

### 1.3 Two Supabase Projects Found

- `emldbjqegftrngxypeca` — web app (property image URLs)
- `eiyexnuhqdscomilwpqg` — backend functions (supabaseProxy.ts, tghProxy.ts)

Either two different projects or a stale migration reference.

---

## 2. SECURITY AUDIT

### 2.1 CRITICAL: No Row Level Security Verification

No RLS policies are defined or referenced anywhere. Without RLS:
- Any client can read ALL data (properties, brokers, bookings, user profiles)
- Any client can INSERT into any table
- Any client can DELETE any property by ID

The `my-properties.js` screen calls `supabase.from('properties').delete().eq('id', id)` with no ownership enforcement beyond client-side `broker_id` filtering.

### 2.2 CRITICAL: No Authorization on Property Creation

`upload-property.js` inserts properties with `broker_id: user.id` but:
- No check if user is a registered broker
- No check if broker's `registration_status` is 'active'
- No server-side role validation
- Any authenticated user can list properties under any `broker_id`

### 2.3 CRITICAL: PesaPal Credentials Invalid

The live `/api/pesapal/initiate` returns:
```json
{"error":"Payment initiation failed","detail":"Token parse error: <!DOCTYPE html>..."}
```
PesaPal is returning an HTML error page — credentials are invalid, expired, or endpoint URL is wrong.

### 2.4 HIGH: No Input Validation on API Routes

- `/api/contact` — checks for field presence only
- `/api/register-broker` — minimal field check
- `/api/add-property` — no validation (failed with schema error for nonexistent `views` column)
- No rate limiting on any endpoint
- No CORS restrictions

### 2.5 MEDIUM: Hardcoded Contact Info

Phone numbers, email, location hardcoded across 4+ files with no central config:
`0750 414 366`, `0782 067 425`, `info@sagecoevergreen.com`, Kyenjojo

### 2.6 MEDIUM: No SSL Pinning

Neither mobile app implements certificate pinning.

---

## 3. PAYMENT & FINANCIAL INTEGRITY

### 3.1 CRITICAL: PesaPal Integration is BROKEN

Payment endpoint returns token parse error. All revenue flows are non-functional:
- Property viewing bookings (UGX 30,000) — cannot pay
- Broker registration (UGX 32,000) — cannot pay
- Broker dashboard activation (UGX 45,000) — cannot pay

### 3.2 CRITICAL: No Double-Entry Ledger

No `transactions` table, no `ledger_entries` table, no double-entry bookkeeping, no reconciliation logic. No financial records of any kind.

### 3.3 CRITICAL: No Payment Verification

The flow creates a payment reference, redirects to PesaPal, then... nothing. No IPN handler, no callback verification, no database update. The `/payment-success` page is static with no server-side logic. Bookings stay "pending" forever.

### 3.4 CRITICAL: No Escrow System

No escrow mechanism for property purchases. No holding account, no dispute resolution, no refund logic.

### 3.5 HIGH: Broker Record Created Before Payment

`broker-register.js` inserts broker record to Supabase FIRST, then initiates payment. If user abandons payment, there's an orphaned pending broker with no cleanup mechanism.

---

## 4. DATA ARCHITECTURE

### 4.1 Supabase Schema (Web + RN)

Tables: `properties`, `brokers`, `bookings`, `user_profiles`

Property fields: id, title, location, price (numeric), category, images (array), featured (bool), is_negotiable (bool), bedrooms (int|null), bathrooms (int|null), land_acres (int|null), area_sqft (numeric|null), status, created_at

Issues:
- No `updated_at` column — no audit trail
- No `description` field returned by API (RN detail screen expects it)
- No `broker_id` returned by API (RN inserts it)
- Schema mismatch: `/api/add-property` tried to insert `views` column that doesn't exist
- No database migration files
- No PostGIS / geographic indexing

### 4.2 Firebase Schema (Kotlin — Different Database)

Collections: `properties`, `brokers`, `jobs`, `users`

Kotlin Property model: `price: String` (incompatible with Supabase's numeric). Has `imageUrl`, `galleryImages`, `amenities`, `yearBuilt`, `parking` — none exist in Supabase schema.

The `jobs` collection exists in Kotlin but has no equivalent in Supabase.

---

## 5. API AUDIT

### 5.1 Web API Routes (Vercel Serverless)

| Endpoint | Method | Status |
|----------|--------|--------|
| /api/get-properties | GET | WORKING — search, price filter, pagination |
| /api/contact | POST | WORKING — no rate limiting |
| /api/register-broker | POST | PARTIALLY — fails on `brokers_plan_check` constraint |
| /api/pesapal/initiate | POST | BROKEN — token parse error |
| /api/add-property | POST | BROKEN — schema mismatch (`views` column) |
| /api/upload-image | POST | PARTIALLY — accepts base64 + fileName |
| /api/upload-photo | POST | PARTIALLY — similar to upload-image |

### 5.2 RN App Direct Supabase Calls

The RN app bypasses the Vercel API entirely, connecting to Supabase via client SDK. Two different access patterns (API routes vs direct SDK) make a single security policy impossible to enforce.

### 5.3 No API versioning, no documentation, no OpenAPI spec.

---

## 6. FRONTEND AUDIT

### 6.1 Web App (Next.js)

- Multiple pages are pure static with hardcoded content (careers, FAQ, plans, brokers)
- `pageProps: {}` on every page — zero server-side data fetching
- The brokers page doesn't fetch data (unlike RN)
- The book page has no fetch calls in JS
- Android coming-soon page has a notify form that does nothing (`TODO: wire to Supabase`)
- `/broker-success` returns 404 (referenced in RN app)
- Login page has `signIn` and `Google` references (Supabase auth?)

### 6.2 React Native App (Expo)

17 screens. Well-structured with AuthContext, Supabase client, theme system.

Strengths: Clean architecture, proper navigation, functional auth, direct Supabase integration, image gallery, CRUD for properties.

Weaknesses:
- No error boundaries, offline support, caching, pull-to-refresh, pagination
- No image upload from camera/gallery (URL paste only)
- No date picker for bookings (text input)
- No password reset, no Google sign-in
- WebView for PesaPal (not native SDK)
- Hardcoded stats on home ("500+ Properties" — actually 7)
- No form validation beyond required fields

Screen status summary:
- IMPLEMENTED: Properties, Property Detail, Brokers, Broker Detail, Green Projects, My Bookings, My Properties, Login, Sign Up, Account
- PARTIALLY_IMPLEMENTED: Broker Register, Book Viewing, Upload Property
- HARDCODED: Home (stats), About, Contact, FAQ, Careers, Plans

### 6.3 Kotlin App (Jetpack Compose)

Uses Firebase (different from web/RN Supabase). 5 tabs: Home, Properties, Brokers, Jobs, Account.

Issues:
- Different backend = data isolation
- Falls back to mock data silently (users see fake data)
- Property model incompatible with Supabase
- `Jobs` tab doesn't exist in other platforms
- No PesaPal, no booking, no broker registration, no image upload
- `google-services.json` is a template placeholder

---

## 7. AUTHENTICATION

Three separate auth systems: Supabase Auth (web + RN), Firebase Auth (Kotlin). Users cannot share sessions across platforms.

RN auth issues: No email verification enforcement, no password reset, no Google OAuth, no biometric auth, no RBAC enforcement (role field exists but unused).

---

## 8. FEATURE INVENTORY (45-POINT FRAMEWORK)

### Real Estate Core
1. Property Listings — IMPLEMENTED (7 live)
2. Property Search/Filter — PARTIALLY_IMPLEMENTED
3. Property Detail View — IMPLEMENTED
4. Property Creation — PARTIALLY_IMPLEMENTED (RN only, no image upload)
5. Property Editing — MISSING
6. Property Deletion — IMPLEMENTED (no auth check)
7. Image Upload — PARTIALLY_IMPLEMENTED
8. Featured Listings — IMPLEMENTED
9. Categories — IMPLEMENTED (4 categories)
10. Price Negotiation — PARTIALLY_IMPLEMENTED (field only, no flow)

### Broker Management
11. Broker Listings — IMPLEMENTED (RN only, web is static)
12. Broker Detail — IMPLEMENTED (RN only)
13. Broker Registration — PARTIALLY_IMPLEMENTED (payment broken)
14. Broker Dashboard — MISSING
15. Broker Verification — MISSING

### Booking & Scheduling
16. Viewing Booking — PARTIALLY_IMPLEMENTED (payment broken)
17. Booking Management — PARTIALLY_IMPLEMENTED (read-only)
18. Calendar Integration — MISSING
19. Notifications — MISSING

### Payments & Finance
20. PesaPal Integration — BROKEN
21. Payment Verification — MISSING
22. Double-Entry Ledger — MISSING
23. Escrow System — MISSING
24. Refund Processing — MISSING
25. Transaction History — MISSING

### Auth & User Management
26. Email/Password Auth — IMPLEMENTED
27. Google OAuth — PARTIALLY_IMPLEMENTED (web only)
28. User Profiles — IMPLEMENTED
29. Password Reset — MISSING
30. Role-Based Access — MISSING (field exists, no enforcement)
31. Session Management — IMPLEMENTED

### Geographic & Mapping
32. GIS/PostGIS — MISSING
33. Map Integration — MISSING
34. Location Search — PARTIALLY_IMPLEMENTED (text only)

### Content & Marketing
35. Green Projects — IMPLEMENTED
36. FAQ — HARDCODED
37. Careers — HARDCODED
38. About Page — HARDCODED
39. Contact Form — IMPLEMENTED
40. Plans/Pricing — HARDCODED

### Technical & Infrastructure
41. API Versioning — MISSING
42. Rate Limiting — MISSING
43. Audit Logging — MISSING
44. Database Migrations — MISSING
45. CI/CD Pipeline — PARTIALLY_IMPLEMENTED (Kotlin only)

---

## 9. ARCHITECTURAL RECOMMENDATIONS

### Immediate (Week 1)
1. Fix PesaPal — verify credentials, update API URL, test end-to-end
2. Enable Supabase RLS — without it, all data is exposed
3. Add payment verification — PesaPal IPN webhook handler
4. Remove fake stats — "500+ Properties" is misleading

### Short-term (Weeks 2-4)
5. Unify on Supabase — migrate Kotlin app from Firebase
6. Commit web app source to GitHub
7. Add server-side authorization middleware
8. Add image upload from device (expo-image-picker)
9. Add date picker for bookings
10. Require email verification

### Medium-term (Months 2-3)
11. Implement double-entry ledger (transactions + ledger_entries tables)
12. Add PostGIS for geographic search
13. Add map integration
14. Implement notifications (email + push)
15. Build broker dashboard
16. Implement property editing
17. Add OpenAPI documentation
18. Add rate limiting

### Long-term (Months 3-6)
19. Escrow system for property transactions
20. Native mobile money integration (MTN/Airtel APIs)
21. Analytics dashboard
22. Multi-language support (Luganda, Swahili, Runyankole)
23. Admin panel for content management
24. Automated testing

---

## 10. SCORING SUMMARY

| Domain | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Security | 15 | 20% | 3.0 |
| Payment/Financial | 10 | 15% | 1.5 |
| Data Architecture | 35 | 10% | 3.5 |
| API Design | 30 | 10% | 3.0 |
| Web Frontend | 55 | 10% | 5.5 |
| Mobile (RN) | 60 | 10% | 6.0 |
| Mobile (Kotlin) | 45 | 5% | 2.25 |
| Authentication | 40 | 5% | 2.0 |
| Scalability | 20 | 5% | 1.0 |
| Code Quality | 50 | 5% | 2.5 |
| DevOps/CI-CD | 45 | 3% | 1.35 |
| Documentation | 30 | 2% | 0.6 |
| **TOTAL** | | **100%** | **32.2/100** |

**Final Score: 32/100 — CRITICAL**

Not production-ready. Should not process real payments in its current state.

---

*Generated by Derick AI — August 11, 2026*

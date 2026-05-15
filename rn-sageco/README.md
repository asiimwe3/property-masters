# SAGECO EVERGREEN — Android App (React Native / Expo)

> Native Android app for Uganda's premier real estate platform.

## Tech Stack
- **Framework:** React Native + Expo (SDK 51)
- **Navigation:** Expo Router (file-based)
- **Database:** Supabase (PostgreSQL)
- **Payments:** PesaPal v3 (via WebView)
- **Build:** EAS Build → APK

## Screens
| Screen | Route |
|--------|-------|
| Home | `/tabs/home` |
| Properties | `/tabs/properties` |
| Brokers | `/tabs/brokers` |
| Green Projects | `/tabs/projects` |
| Account | `/tabs/account` |
| Property Detail | `/property/[id]` |
| Broker Profile | `/broker/[id]` |
| Book Viewing | `/book` |
| Login | `/auth/login` |
| Sign Up | `/auth/signup` |

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in your Supabase URL, anon key, and PesaPal credentials
```

### 3. Run on Android
```bash
npm run android
# Or scan QR with Expo Go app
npm start
```

## Build APK (Production)

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Build APK (preview/internal testing)
```bash
npm run build:apk
```

### Build AAB (for Play Store)
```bash
npm run build:android
```

The EAS build runs in the cloud — no Android Studio needed!
Download the APK from your [EAS dashboard](https://expo.dev) when done.

## Project Structure
```
app/
  _layout.js          # Root layout + AuthProvider
  index.js            # Redirects to /tabs/home
  tabs/
    _layout.js        # Bottom tab navigator
    home.js           # Home screen
    properties.js     # Property listings
    brokers.js        # Broker directory
    projects.js       # Green projects
    account.js        # User account
  auth/
    login.js          # Sign in
    signup.js         # Create account
  property/[id].js    # Property detail
  broker/[id].js      # Broker profile
  book.js             # Book viewing + PesaPal
components/
context/
  AuthContext.js      # Supabase auth state
lib/
  supabase.js         # Supabase client
  theme.js            # Colors, spacing, typography
```

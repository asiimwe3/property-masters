# Property Masters - Firebase Setup Guide

## Firebase Configuration (Optional but Recommended)

The app works out of the box with built-in mock data. To connect a real Firebase backend:

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project (e.g., "property-masters")

### 2. Add Android App
1. Click "Add app" → Android
2. Package name: `com.propertymasters.app`
3. Download `google-services.json`
4. Place it at `app/google-services.json` (replacing the template)

### 3. Enable Services

**Authentication:**
- Go to Authentication → Sign-in method
- Enable Email/Password

**Firestore Database:**
- Go to Firestore Database → Create database
- Start in test mode
- Collections will be auto-seeded on first app launch:
  - `properties` — property listings
  - `brokers` — broker profiles
  - `jobs` — job listings
  - `users` — user accounts

**Storage:**
- Go to Storage → Get started
- Used for property images uploaded via the Add Property screen

### 4. Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /brokers/{document} {
      allow read: if true;
      allow write: if false;
    }
    match /jobs/{document} {
      allow read: if true;
      allow write: if false;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Build & Run
The app automatically:
- Seeds Firestore with sample data on first launch
- Falls back to mock data if Firebase is not configured
- Uses Firebase Auth when available, local login as fallback

## Release APK Signing

To build a signed release APK:

### Option A: Local Build
```bash
# Generate a keystore
keytool -genkey -v -keystore property-masters.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias property-masters

# Set environment variables
export KEYSTORE_FILE=/path/to/property-masters.jks
export KEYSTORE_PASSWORD=your_password
export KEY_ALIAS=property-masters
export KEY_PASSWORD=your_password

# Build
./gradlew assembleRelease
```

### Option B: GitHub Actions (CI/CD)
The workflow in `.github/workflows/build.yml` automatically builds on every push.
For signed releases, add these repository secrets:
- `KEYSTORE_BASE64` — base64-encoded keystore file
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

The APK artifact will be available in the Actions tab.

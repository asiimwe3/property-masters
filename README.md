# Property Masters 🏠

A fully native Android application for buyers, sellers, brokers, and real estate service providers — built with **Kotlin + Jetpack Compose**, no WebView, no Expo.

## Tech Stack

- 100% Kotlin, Jetpack Compose (Material 3)
- Navigation Compose (bottom navigation, 5 tabs)
- Coil for async image loading
- MVVM-friendly architecture (mock data layer ready to swap for a real repository/API)
- Clean rounded-card, teal/green UI matching the product design reference

## App Structure

- **Home** — search bar, category explorer, featured properties carousel
- **Properties** — filter bar + 2-column property grid with View buttons
- **Brokers** — searchable list of broker profiles with ratings
- **Jobs** — tabbed job board (All / Agents / Project Managers) with Apply Now
- **Account** — profile card, verified badge, settings menu, logout

All screens use realistic mock data — nothing is empty out of the box.

## Build Locally

Requirements: JDK 17, Android SDK (or Android Studio Hedgehog+).

```bash
git clone https://github.com/asiimwe3/property-masters.git
cd property-masters
./gradlew assembleDebug
```

The debug APK will be generated at:
```
app/build/outputs/apk/debug/app-debug.apk
```

Install directly on a connected device/emulator:
```bash
./gradlew installDebug
```

## Automatic APK Builds (CI/CD)

Every push to `main` triggers a GitHub Actions workflow (`.github/workflows/android-build.yml`) that:

1. Builds a debug APK using the Android Gradle Plugin on Ubuntu runners
2. Uploads it as a workflow artifact
3. Publishes it as a GitHub Release (tagged `build-<run_number>`) with the APK attached

No local Android Studio setup needed to get an installable APK — just check the **Actions** tab or **Releases** page of this repo after each push.

## Roadmap

- Wire up real backend (Supabase/Firebase) for listings, brokers, jobs
- Property detail screens with photo galleries and maps
- In-app messaging between buyers/brokers
- Push notifications for new listings and job posts
- Play Store release build (signed AAB)

## License

Proprietary — Property Masters © 2026

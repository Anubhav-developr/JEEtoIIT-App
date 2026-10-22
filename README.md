# JEEtoIIT — Saumya JEE 2027 Study Portal (Android)

A React Native + Expo Android companion for the JEE 2027 student portal. The app is designed around secure access-code login, an individual student profile, study-session tracking, syllabus progress, test records, and progress reports.

> **Status:** Development and closed-testing review. Google Play review is not an approval or public-release guarantee. Verify all release-critical features on a real Android device and with a signed release build.

## Features

- Five-character access-code login using the existing Firebase callable `loginWithAccessCode`.
- Firebase Authentication and App Check (Debug provider for local development; Play Integrity for production).
- Home, Study, Syllabus, Tests, Reports, and Profile areas, with bottom navigation and a navigation drawer.
- Active and passive study tracking, including problem solving, previous-year questions (PYQs), mock tests, video lectures, notes, and formula revision.
- Study-session records scoped to the signed-in user's Firestore path.
- Student profile photo upload, change, and removal through Firebase Storage, with a fallback initials avatar.
- Dashboard synchronization from user-scoped Firestore collections.

Some behavior may still be under development. Review the source and validate all flows in the release build before relying on them.

## Technology

- React Native and Expo
- React Native Firebase: App, Authentication, App Check, Firestore, Functions, and Storage
- Expo Image Picker and Sharing
- Android native project generated with Expo prebuild

## Repository layout

- `App.js` — app entry point, access-code login, authentication state, and Firestore subscriptions.
- `components/` — dashboard, navigation, profile, study, syllabus, tests, and reports UI.
- `app.json` — Expo app identity, Android package, and native plugins.
- `android/` — generated native Android project; review native edits after `expo prebuild`.
- `storage.rules` — UID-scoped profile-image rules to review and publish in Firebase Console.
- `README_HINGLISH.md` — Hinglish setup and development notes.

## Prerequisites

- Node.js version compatible with the project's installed Expo SDK
- Android Studio, Android SDK, and a JDK supported by the installed Gradle/Android Gradle Plugin configuration
- Android emulator or physical Android device
- Authorized access to the Firebase project used by this app

## Local setup (Windows PowerShell)

1. Clone this repository and open the project root.
2. Install dependencies:

   ```powershell
   npm ci
   npx expo install --check
   ```

3. In Firebase Console, register the Android app with package ID `com.saumyajee.portal`. Place the required `google-services.json` at the path expected by the Expo Android configuration. Follow the repository's secret-handling policy before committing configuration files; never put server secrets in the client app.
4. Configure the Firebase App Check Debug provider for local development and register the local debug token in Firebase Console. Never ship a debug token in a production build.
5. Run the app:

   ```powershell
   npx expo run:android
   ```

Native dependency or app-configuration changes require a native rebuild. Review generated native changes before committing them.

## Firebase and security notes

- Keep using the existing `loginWithAccessCode` callable; do not bypass server-side validation or App Check.
- Firestore reads and writes must remain scoped to the signed-in user's `users/{uid}/...` path and protected by deployed security rules.
- Profile image paths use `users/{uid}/profile/avatar`; review `storage.rules` and publish UID-restricted rules in Firebase Console.
- Configure production App Check with Play Integrity and the appropriate release-signing certificate.
- Never commit `.env` files containing secrets, Gemini/API keys, Resend credentials, production keystores, or App Check debug tokens.
- Firebase client configuration is not a place for server-side secrets. Treat profile-photo download URLs as bearer-style links.

## Study timer and background behavior

The current timer UI uses an in-memory interval, which is not enough to guarantee reliable timing or notifications while Android suspends the JavaScript runtime. Do not describe the timer as reliably always-on in the background unless session timing is persisted and the native background/foreground-service behavior, notification permissions, and pause/resume/stop actions have been implemented and tested on supported Android versions. Review the applicable Google Play foreground-service policy before release.

## Build and release

- Local development: `npx expo run:android`.
- For Google Play distribution, build a signed Android App Bundle (`.aab`) and configure Play App Signing in Play Console.
- Verify the effective target SDK in the generated release artifact against the current Google Play target API requirements before each submission.
- Keep the package ID `com.saumyajee.portal` stable after publishing.
- Test a release artifact, not only a development-client APK. Check startup, login and App Check, profile-photo upload/removal, navigation, study timer, Firestore synchronization, and session saving.
- Use the AAB/Play Console download-size estimate; a debug build or universal APK is not a reliable estimate of the Play Store download size.

## Google Play listing checklist

- App icon and adaptive launcher icon variants
- Feature graphic (1024 × 500) and current phone screenshots
- Accurate short and full store descriptions
- Public privacy policy and support contact
- Accurate Data safety declaration, content rating, target audience, and app-access instructions
- Release signing setup and a securely retained upload-key backup
- Closed-testing feedback and completion of any testing requirements shown in Play Console before applying for production access

## Current limitations

The application must be device-tested for all release-critical flows. Do not describe notification-based background timing as implemented until the required native service, persistence, foreground-service declaration, notification permission behavior, and pause/resume/stop actions are validated. Google Play testing and review status can change independently of the code in this repository.

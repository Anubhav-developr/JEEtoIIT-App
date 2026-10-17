# Saumya's JEE 2027 Portal — Android (React Native)

Yeh `android-app/` starter web portal se alag rakha gaya hai. Existing Vite website ya `functions/index.js` ko modify nahi karta.

## Stack
- React Native + Expo development build
- React Native Firebase native SDK
- Firebase Auth, Cloud Functions, Firestore, App Check
- Android Studio emulator

## Important: existing backend security preserve
- Student login ke liye existing callable `loginWithAccessCode` hi call hota hai.
- App Check disabled nahi kiya gaya.
- Admin bootstrap/panel is starter mein expose nahi kiya gaya.
- Existing web `VITE_RECAPTCHA_V3_SITE_KEY` Android app mein use NAHI hota. Android App Check uses Debug provider during local development and Play Integrity for production builds.

## Setup (Windows / PowerShell)

### 1. Android Studio
Android Studio install karein. SDK Manager se Android SDK, Platform Tools aur Emulator install karein. Device Manager se ek emulator create/start karein.

### 2. Firebase Android app register karein
Firebase Console → project `saumyajee-9c4dc` → Project settings → Your apps → Add app → Android.
- Package name: `com.saumyajee.portal`
- SHA fingerprints: development/debug SHA-1 and SHA-256 add karein (Android Studio/Gradle se milenge).
- Download `google-services.json`.
- File ko `android-app/google-services.json` mein rakhein (root mein nahi).

### 3. Dependencies install
Extract the ZIP. Terminal mein `android-app` folder ke andar:
```powershell
npm install
npx expo install --fix
npx expo prebuild --platform android
```

Agar `npx expo install --fix` kisi dependency ko change kare, uske baad:
```powershell
npx expo prebuild --platform android
```

### 4. App Check (emulator)
Firebase Console → App Check → Android app `com.saumyajee.portal` → Debug provider ko development/testing ke liye configure karein.

App ko pehli baar emulator par run karne par Metro/Logcat mein App Check debug token show ho sakta hai. Us token ko Firebase Console → App Check → Manage debug tokens mein register karein. Token ko public GitHub par commit NA karein.

### 5. Run
```powershell
npx expo run:android
```
Pehli build mein time lag sakta hai. Emulator start hona chahiye. App Metro bundler ke saath launch hogi.

## Production App Check
Release builds ke liye Firebase App Check Android app par Play Integrity configure/register karein aur SHA-256 signing certificate add karein. Debug token ko production mein use na karein.

## What works in this starter
- 5-character access-code input (A–Z, 0–9)
- Existing `loginWithAccessCode` callable call
- App Check token acquisition before login
- Custom-token sign-in
- Auth state persistence via native Firebase SDK
- Simple signed-in screen / sign-out

## Next migration stages
1. Login build + App Check emulator test
2. Read/write Firestore student data using same UID-isolated path
3. Migrate dashboard, syllabus, mock tests, study timer
4. AI analyzer (move API secret behind trusted backend; never ship Gemini secret in app)
5. Admin app only if explicitly needed; preserve server-side admin claim and allowlist.

## Do not copy web secrets
Do not copy `.env`, Gemini API key, Resend secrets, or web reCAPTCHA site key into the Android app. `google-services.json` is Firebase client configuration, not a place for server secrets; still review it before committing.

# Student profile + DP upload (next branch)

This patch is designed for a new branch named `feature/student-profile-dp`, based on `feature/study-analytics`.
It preserves the existing sign-in callable, App Check, user-scoped study-session paths, and analytics charts.

**GitHub status:** the analytics branch is currently 2 commits ahead of `master`. The connected GitHub integration refused branch/PR writes (403), so the PR/merge still needs to be created in GitHub manually: [compare `master` with `feature/study-analytics`](https://github.com/Anubhav-developr/JEEtoIIT-App/compare/master...feature/study-analytics?expand=1).

## Features

- Redesigned profile screen with photo hero card, account details, study summary, and security panel.
- Select and crop a square profile picture from the device gallery.
- Uploads to Firebase Storage at `users/{uid}/profile/avatar`.
- Saves the download URL to the existing Firebase Auth user's `photoURL`, so it persists across app restarts.
- Change/remove DP controls, upload progress indicator, error handling, and an initials fallback.
- Storage rules permit only that signed-in UID to read/write/delete that avatar; image uploads are capped below 5 MiB.

## Install dependencies

From the app repository root, run:

```bash
npx expo install expo-image-picker
npm install @react-native-firebase/storage
```

Then commit the resulting `package.json` and `package-lock.json` together (the install commands update the lockfile). If your team uses Yarn instead of npm, use `yarn expo install expo-image-picker` and `yarn add @react-native-firebase/storage`.

## Enable Storage and publish rules

1. Open the Firebase project used by the Android app in Firebase Console.
2. Open **Build → Storage** and create/enable the default Storage bucket if it is not enabled yet.
3. Copy `storage.rules` into **Storage → Rules** and click **Publish**.
4. Ensure the Firebase Android app configuration contains the default storage bucket; if you recently enabled Storage, download a fresh `google-services.json` from Project settings and replace the local file (do not commit a private/local secrets file if your repo policy ignores it).

The rules expect the path `users/{authenticated UID}/profile/avatar`. Do not replace them with public-write rules.

## Rebuild the native app

Because React Native Firebase Storage is a native module and ImagePicker has a config plugin, rebuild your development APK/dev client after install/config changes:

```bash
npx expo prebuild --platform android
npx expo run:android
```

For an existing native Android folder, review generated native changes before committing them. On Windows PowerShell these commands can be run directly from the project root.

## Apply in a fresh branch

```bash
git fetch origin
git switch feature/study-analytics
git pull origin feature/study-analytics
git switch -c feature/student-profile-dp
```

Copy the files from this bundle into the same paths in your repo, then run the install/rebuild steps above. Validate the profile photo upload and deletion with a test account before opening the PR.

## Data/security notes

No Cloud Function or access-code login code is changed. Photo metadata remains in Firebase Auth's `photoURL`, while the binary is stored in Firebase Storage. The Storage rules are UID-scoped. Firebase Storage download URLs are bearer-style URLs; avoid posting a user's profile URL publicly.

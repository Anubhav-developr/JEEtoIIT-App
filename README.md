# JEEtoIIT student avatar sync

This package updates three components on `feature/student-profile-dp`:

- `components/AppHeader.js`: the top-right square avatar shows the logged-in student's uploaded photo, or initials such as `AM` for `Anubhav Mishra` when no photo exists.
- `components/NavigationDrawer.js`: the student card in the hamburger drawer shows the same photo and full display name, or the same two-letter initials fallback.
- `components/StudentDashboard.js`: passes its live `profilePhotoURL` state and student's display name to the header, and the same photo state to the drawer. This makes a newly uploaded or removed photo update both places immediately.

## Apply

Copy these three files into the matching paths in the project on branch `feature/student-profile-dp`, replacing those files. No dependency or Firebase Rules changes are required.

Then run from the project root:

```cmd
npx expo run:android
```

## Validation performed

- TypeScript transpile parser accepted the JSX syntax in all three files.
- Initials logic returns `AM` for `Anubhav Mishra` and `Anubhav.Mishra@example.com`.
- The app was not launched on a physical device or emulator as part of this file preparation.

The GitHub integration refused direct writes with HTTP 403, so the remote branch is not automatically updated by this package. Apply these files and commit/push them from your local checkout.

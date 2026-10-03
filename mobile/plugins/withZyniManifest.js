/**
 * ZyniVerse config plugin — removes dangerous/unnecessary Android permissions.
 *
 * SYSTEM_ALERT_WINDOW (draw over other apps), READ_EXTERNAL_STORAGE and
 * WRITE_EXTERNAL_STORAGE are not used by the app. They are a red flag for app
 * store reviewers (commonly misused by adware) and were removed to meet
 * Uptodown's minimum quality standards.
 *
 * Runs on every `expo prebuild` / `eas build`, so the manifest stays clean
 * even though the android/ folder itself is gitignored.
 *
 * NOTE: `expo-notifications` is intentionally NOT a dependency. It links
 * Firebase Messaging + Play Services and registers a `FirebaseInitProvider`
 * that runs before `Application.onCreate()`. With no `google-services.json` and
 * no `com.google.gms.google-services` plugin, Firebase has no default options
 * and the app crashes on launch ("Default FirebaseApp is not initialized in
 * this process"). Push notifications need a real Firebase project first — see
 * README.md.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const PERMISSIONS_TO_REMOVE = [
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

/**
 * Safety net for the Firebase case above: if anything ever re-introduces a
 * library that links Play Services, drop its startup components and permissions
 * so the APK still launches instead of dying in a ContentProvider.
 */
const FIREBASE_MARKERS = [
  'com.google.firebase',
  'com.google.android.gms',
  'com.google.android.c2dm',
];

module.exports = function withZyniManifest(config) {
  return withAndroidManifest(config, (configProps) => {
    const manifest = configProps.modResults;
    const manifestRoot = manifest.manifest || {};

    if (Array.isArray(manifestRoot['uses-permission'])) {
      manifestRoot['uses-permission'] = manifestRoot['uses-permission'].filter(
        (perm) => {
          const name = perm && perm.$ ? perm.$['android:name'] : null;
          if (!name) return true;
          if (PERMISSIONS_TO_REMOVE.includes(name)) return false;
          return !FIREBASE_MARKERS.some((marker) => name.startsWith(marker));
        }
      );
    }

    // Strip Play Services / Firebase components that would run at startup.
    ['provider', 'service', 'receiver', 'activity'].forEach((tag) => {
      if (!Array.isArray(manifestRoot[tag])) return;
      manifestRoot[tag] = manifestRoot[tag].filter((node) => {
        const name = node && node.$ ? node.$['android:name'] : null;
        return !name || !FIREBASE_MARKERS.some((marker) => name.startsWith(marker));
      });
    });

    return configProps;
  });
};

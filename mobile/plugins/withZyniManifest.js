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
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const PERMISSIONS_TO_REMOVE = [
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

module.exports = function withZyniManifest(config) {
  return withAndroidManifest(config, (configProps) => {
    const manifest = configProps.modResults;
    const manifestRoot = manifest.manifest || {};

    if (Array.isArray(manifestRoot['uses-permission'])) {
      manifestRoot['uses-permission'] = manifestRoot['uses-permission'].filter(
        (perm) => {
          const name = perm && perm.$ ? perm.$['android:name'] : null;
          return name ? !PERMISSIONS_TO_REMOVE.includes(name) : true;
        }
      );
    }

    return configProps;
  });
};
/**
 * ZyniVerse config plugin — pins the Android Kotlin version.
 *
 * React Native 0.76's gradle-plugin resolves the Kotlin Gradle plugin to
 * 1.9.24, but Expo's prebuild defaults android.kotlinVersion to 1.9.25.
 * With 1.9.25, expo-modules-core selects Compose compiler 1.5.15, which is
 * incompatible with the 1.9.24 Kotlin compiler on the classpath — breaking
 * the release build. Pin consistently to 1.9.24 so expo-modules-core uses
 * Compose 1.5.14.
 */
const { withGradleProperties } = require('@expo/config-plugins');

const KOTLIN_VERSION_PROPERTY = 'android.kotlinVersion';
const KOTLIN_VERSION = '1.9.24';

module.exports = function withZyniKotlinVersion(config) {
  return withGradleProperties(config, (configProps) => {
    const existingIndex = configProps.modResults.findIndex(
      (p) => p.type === 'property' && p.key === KOTLIN_VERSION_PROPERTY
    );

    if (existingIndex >= 0) {
      configProps.modResults[existingIndex] = {
        type: 'property',
        key: KOTLIN_VERSION_PROPERTY,
        value: KOTLIN_VERSION,
      };
    } else {
      configProps.modResults.push({
        type: 'property',
        key: KOTLIN_VERSION_PROPERTY,
        value: KOTLIN_VERSION,
      });
    }

    return configProps;
  });
};
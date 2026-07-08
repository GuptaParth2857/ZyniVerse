import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface SettingRowProps {
  label: string;
  value?: string;
  type?: 'toggle' | 'navigate' | 'info';
  onPress?: () => void;
  enabled?: boolean;
  onToggle?: (val: boolean) => void;
}

function SettingRow({ label, value, type = 'navigate', onPress, enabled, onToggle }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={type === 'info'}>
      <Text style={styles.settingLabel}>{label}</Text>
      {type === 'toggle' ? (
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.surfaceLight, true: colors.primary + '66' }}
          thumbColor={enabled ? colors.primary : colors.textDim}
        />
      ) : type === 'info' ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <View style={styles.navigateRow}>
          <Text style={styles.settingValue}>{value}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState('dark');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Appearance</Text>
          <View style={styles.groupContent}>
            <SettingRow
              label="Theme"
              value={theme.charAt(0).toUpperCase() + theme.slice(1)}
              onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Notifications</Text>
          <View style={styles.groupContent}>
            <SettingRow
              label="Push Notifications"
              type="toggle"
              enabled={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
            <SettingRow
              label="Airing Reminders"
              type="toggle"
              enabled={true}
            />
            <SettingRow
              label="Forum Replies"
              type="toggle"
              enabled={false}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Account</Text>
          <View style={styles.groupContent}>
            <SettingRow label="Profile" value="Edit" />
            <SettingRow label="API Keys" value="Manage" />
          </View>
        </View>

        {/* Language */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Language</Text>
          <View style={styles.groupContent}>
            <SettingRow label="App Language" value="English" />
            <SettingRow label="Content Language" value="English (Sub)" />
          </View>
        </View>

        {/* About */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>About</Text>
          <View style={styles.groupContent}>
            <SettingRow label="Version" value="1.0.0" type="info" />
            <SettingRow label="Website" value="zyniverse.app" />
            <SettingRow label="Terms of Service" />
            <SettingRow label="Privacy Policy" />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  group: {
    marginBottom: spacing.md,
  },
  groupTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  groupContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  settingValue: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  navigateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chevron: {
    color: colors.textDim,
    fontSize: fontSize.lg,
  },
  signOutButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

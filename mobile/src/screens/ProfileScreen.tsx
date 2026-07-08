import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { getStatusColor } from '../utils/helpers';

type ProfileTab = 'lists' | 'stats' | 'achievements' | 'settings';
type StatusTab = 'watching' | 'completed' | 'planning' | 'dropped';

const MOCK_STATS = {
  animeCompleted: 142,
  episodesWatched: 8456,
  daysWatched: 352,
};

const MOCK_BADGES = [
  { id: '1', name: 'OG Fan', icon: '🔥' },
  { id: '2', name: 'Completionist', icon: '✅' },
  { id: '3', name: 'Marathoner', icon: '⚡' },
  { id: '4', name: 'Reviewer', icon: '✍' },
  { id: '5', name: 'Early Adopter', icon: '🌟' },
  { id: '6', name: 'Dub watcher', icon: '🎤' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('lists');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('watching');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const statusTabs: StatusTab[] = ['watching', 'completed', 'planning', 'dropped'];

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginIcon}>👤</Text>
          <Text style={styles.loginTitle}>Sign in to ZyniVerse</Text>
          <Text style={styles.loginSubtitle}>
            Track your anime, get personalized recommendations, and more
          </Text>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>U</Text>
            </View>
          </View>
          <Text style={styles.username}>User</Text>
          <Text style={styles.bio}>Anime enthusiast</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_STATS.animeCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_STATS.episodesWatched}</Text>
              <Text style={styles.statLabel}>Episodes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_STATS.daysWatched}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {(['lists', 'stats', 'achievements', 'settings'] as ProfileTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'lists' && (
          <View style={styles.tabContent}>
            <View style={styles.statusRow}>
              {statusTabs.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusTab, activeStatus === s && { borderBottomColor: getStatusColor(s), borderBottomWidth: 2 }]}
                  onPress={() => setActiveStatus(s)}
                >
                  <Text style={styles.statusTabText}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No anime in this list yet</Text>
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>Genre Distribution</Text>
              <Text style={styles.statCardValue}>Action: 45%</Text>
              <Text style={styles.statCardValue}>Adventure: 25%</Text>
              <Text style={styles.statCardValue}>Drama: 15%</Text>
              <Text style={styles.statCardValue}>Comedy: 10%</Text>
              <Text style={styles.statCardValue}>Other: 5%</Text>
            </View>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={styles.badgesGrid}>
              {MOCK_BADGES.map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingValue}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>API Keys</Text>
              <Text style={styles.settingValue}>Manage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.settingLabel}>All Settings</Text>
              <Text style={styles.settingValue}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, styles.signOutButton]}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

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
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loginIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  loginTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loginSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  signupButton: {
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    alignItems: 'center',
  },
  signupButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  userHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  username: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  bio: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusTab: {
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  statusTabText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  emptyList: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyListText: {
    color: colors.textDim,
    fontSize: fontSize.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statCardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statCardValue: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeItem: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  badgeName: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
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
  signOutButton: {
    justifyContent: 'center',
    marginTop: spacing.lg,
    borderBottomWidth: 0,
  },
  signOutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
});

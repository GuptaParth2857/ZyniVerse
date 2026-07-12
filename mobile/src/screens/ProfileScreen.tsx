import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { getStatusColor } from '../utils/helpers';

const API_BASE = 'https://zyverse.in';

type ProfileTab = 'lists' | 'stats' | 'achievements' | 'settings';
type StatusTab = 'watching' | 'completed' | 'planning' | 'dropped';

interface UserProfile {
  id: string;
  username: string;
  avatar?: string | null;
  bio?: string | null;
  stats: { completed: number; episodesWatched: number; daysWatched: number };
  achievements: { id: string; name: string; icon: string; description: string }[];
  lists: { status: string; mediaId: number; title: string }[];
  genreDistribution: { genre: string; count: number; percentage: number }[];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('lists');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('watching');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const statusTabs: StatusTab[] = ['watching', 'completed', 'planning', 'dropped'];

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  const onRefresh = () => { setRefreshing(true); fetchProfile(); };

  if (!profile && !loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loginPrompt}>
          <View style={styles.loginIconContainer}>
            <Text style={styles.loginIcon}>👤</Text>
          </View>
          <Text style={styles.loginTitle}>Sign in to ZyniVerse</Text>
          <Text style={styles.loginSubtitle}>
            Track your anime, earn achievements, and get personalized recommendations
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Login', { mode: 'signup' })}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const initial = profile?.username?.[0]?.toUpperCase() || 'U';
  const filteredLists = profile?.lists?.filter((l) => l.status === activeStatus) || [];
  const topGenres = profile?.genreDistribution?.slice(0, 5) || [];
  const totalAchievements = profile?.achievements?.length || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* User Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{profile?.username || 'User'}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.completed || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.episodesWatched || 0}</Text>
              <Text style={styles.statLabel}>Episodes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.daysWatched || 0}</Text>
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

        {/* Lists Tab */}
        {activeTab === 'lists' && (
          <View style={styles.tabContent}>
            <View style={styles.statusRow}>
              {statusTabs.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusTab, activeStatus === s && { borderBottomColor: getStatusColor(s), borderBottomWidth: 2 }]}
                  onPress={() => setActiveStatus(s)}
                >
                  <Text style={[styles.statusTabText, activeStatus === s && { color: getStatusColor(s) }]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {loading ? (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>Loading...</Text>
              </View>
            ) : filteredLists.length > 0 ? (
              filteredLists.map((item, i) => (
                <TouchableOpacity
                  key={`${item.mediaId}-${i}`}
                  style={styles.listItem}
                  onPress={() => navigation.navigate('AnimeDetail', { id: item.mediaId, title: item.title })}
                >
                  <Text style={styles.listItemTitle} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No anime in this list yet</Text>
              </View>
            )}
          </View>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>Genre Distribution</Text>
              {loading ? (
                <Text style={styles.emptyTabText}>Loading...</Text>
              ) : topGenres.length > 0 ? (
                topGenres.map((g) => (
                  <View key={g.genre} style={styles.genreBar}>
                    <View style={styles.genreBarHeader}>
                      <Text style={styles.genreBarLabel}>{g.genre}</Text>
                      <Text style={styles.genreBarValue}>{g.percentage}%</Text>
                    </View>
                    <View style={styles.genreBarTrack}>
                      <View style={[styles.genreBarFill, { width: `${g.percentage}%` }]} />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyTabText}>Start watching anime to see stats</Text>
              )}
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>Achievements Earned</Text>
              <Text style={styles.statCardValue}>{totalAchievements} / 26</Text>
            </View>
          </View>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            {loading ? (
              <Text style={styles.emptyTabText}>Loading...</Text>
            ) : totalAchievements > 0 ? (
              <View style={styles.badgesGrid}>
                {profile?.achievements?.map((badge) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDescription} numberOfLines={2}>{badge.description}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No achievements yet. Keep exploring!</Text>
              </View>
            )}
          </View>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.settingLabel}>All Settings</Text>
              <Text style={styles.settingValue}>›</Text>
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
  loginIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginIcon: {
    fontSize: 40,
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
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
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
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  listItemTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  emptyTabText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    paddingVertical: spacing.md,
  },
  genreBar: {
    marginBottom: spacing.sm,
  },
  genreBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  genreBarLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  genreBarValue: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  genreBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  genreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
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
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDescription: {
    color: colors.textDim,
    fontSize: 9,
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
});

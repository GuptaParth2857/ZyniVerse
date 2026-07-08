import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { api } from '../services/api';
import { Anime } from '../types';
import AnimeRow from '../components/AnimeRow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import AdPlaceholder from '../components/AdPlaceholder';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [trending, setTrending] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await api.trending.get();
      setTrending(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  if (error && trending.length === 0) {
    return <ErrorView message={error} onRetry={fetchData} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome to</Text>
          <Text style={styles.appName}>ZyniVerse</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Trending Now */}
        <AnimeRow
          title="Trending Now"
          anime={trending.slice(0, 10)}
          onSeeAll={() => {}}
        />

        <AdPlaceholder height={100} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('FillerGuide', { id: 0, title: 'Filler Guide' })}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>Filler Guide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.actionIcon}>🎤</Text>
              <Text style={styles.actionLabel}>Dub Check</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Recommendations')}
            >
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={styles.actionLabel}>Recommend</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filler Guides Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Filler Guides</Text>
          {trending.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.fillerItem}
              onPress={() => navigation.navigate('FillerGuide', { id: item.id, title: item.title.english || item.title.romaji || 'Anime' })}
            >
              <Text style={styles.fillerItemTitle}>
                {item.title.english || item.title.romaji || 'Unknown'}
              </Text>
              <Text style={styles.fillerItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <AdPlaceholder height={100} />

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  appName: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  fillerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  fillerItemTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    flex: 1,
  },
  fillerItemArrow: {
    color: colors.textDim,
    fontSize: fontSize.xl,
    marginLeft: spacing.sm,
  },
});

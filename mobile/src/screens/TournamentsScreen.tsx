import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { api } from '../services/api';
import { CharacterTournament } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

const STATUS_META: Record<string, { label: string; color: string }> = {
  qualifying: { label: 'QUALIFYING', color: '#00ffe0' },
  active: { label: 'LIVE', color: '#ff00e6' },
  upcoming: { label: 'UPCOMING', color: '#f59e0b' },
  completed: { label: 'COMPLETED', color: '#22c55e' },
  cancelled: { label: 'CANCELLED', color: '#ef4444' },
};

function countdownLabel(endsAt?: string | null): string | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Closes today';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m left`;
}

export default function TournamentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [tournaments, setTournaments] = useState<CharacterTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    try {
      setError(null);
      const data = await api.tournaments.list();
      setTournaments(data);
    } catch {
      setError('Could not load tournaments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error && tournaments.length === 0) return <ErrorView message={error} onRetry={fetchTournaments} />;

  const live = tournaments.filter((t) => t.status === 'qualifying' || t.status === 'active' || t.status === 'upcoming');
  const history = tournaments.filter((t) => t.status === 'completed' || t.status === 'cancelled');

  const renderTournament = ({ item }: { item: CharacterTournament }) => {
    const meta = STATUS_META[item.status] || { label: item.status.toUpperCase(), color: colors.textDim };
    const countdown = countdownLabel(item.mode === 'qualifying' ? item.qualifyingEndsAt : item.roundEndsAt);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TournamentDetail', { id: item.id, title: item.title })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.statusChip, { borderColor: meta.color }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>🎯 {item.size} candidates</Text>
          <Text style={styles.metaText}>👥 {item._count?.participants ?? 0} entered</Text>
          {countdown ? <Text style={styles.metaText}>⏳ {countdown}</Text> : null}
        </View>
        {item.creator ? (
          <Text style={styles.creatorText}>by {item.creator.username}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const section = (title: string, data: CharacterTournament[]) =>
    data.length > 0 ? (
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((t) => renderTournament({ item: t }))}
      </View>
    ) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Tournaments</Text>
      <FlatList
        data={[{ key: 'body' }]}
        renderItem={() => (
          <View style={styles.listBody}>
            {live.length === 0 && history.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No tournaments yet</Text>
                <Text style={styles.emptySubtitle}>Tournaments will appear right here</Text>
              </View>
            ) : (
              <>
                {section('🎮 Live & Upcoming', live)}
                {section('🏆 History', history)}
              </>
            )}
          </View>
        )}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listBody: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  creatorText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: colors.textDim,
    fontSize: fontSize.sm,
  },
});
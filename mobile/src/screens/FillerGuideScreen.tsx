import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { getEpisodeTypeColor } from '../utils/helpers';
import FillerProgress from '../components/FillerProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

const API_BASE = 'https://zyverse.in';

interface FillerEpisode {
  episode: number;
  type: 'canon' | 'filler' | 'mixed';
  title?: string;
  score?: number;
}

interface FillerData {
  totalEpisodes: number;
  totalFillers: number;
  fillerPercentage: number;
  episodes: FillerEpisode[];
}

export default function FillerGuideScreen() {
  const route = useRoute<any>();
  const { id, title: animeTitle } = route.params;

  const [data, setData] = useState<FillerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/filler/${id}`);
      if (!res.ok) throw new Error('Failed to load');
      const result = await res.json();
      if (result.episodes && Array.isArray(result.episodes)) {
        const episodes = result.episodes.map((e: any, i: number) => ({
          episode: e.episode || i + 1,
          type: e.type || 'canon',
          title: e.title || `Episode ${e.episode || i + 1}`,
          score: e.score,
        }));
        const fillers = episodes.filter((e: FillerEpisode) => e.type === 'filler').length;
        const mixed = episodes.filter((e: FillerEpisode) => e.type === 'mixed').length;
        const total = episodes.length;
        setData({
          totalEpisodes: total,
          totalFillers: fillers,
          fillerPercentage: total > 0 ? Math.round((fillers / total) * 100) : 0,
          episodes,
        });
      } else {
        setData(null);
      }
    } catch {
      setError('Could not load filler data');
    }
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const canonCount = data?.episodes?.filter((e) => e.type === 'canon').length || 0;
  const mixedCount = data?.episodes?.filter((e) => e.type === 'mixed').length || 0;
  const fillerCount = data?.episodes?.filter((e) => e.type === 'filler').length || 0;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>{animeTitle}</Text>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchData} />
      ) : data ? (
        <>
          <FillerProgress
            totalEpisodes={data.totalEpisodes}
            totalFillers={data.totalFillers}
            fillerPercentage={data.fillerPercentage}
          />

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, { borderColor: colors.success }]}>
              <Text style={[styles.summaryCount, { color: colors.success }]}>{canonCount}</Text>
              <Text style={styles.summaryLabel}>Canon</Text>
            </View>
            <View style={[styles.summaryBox, { borderColor: colors.warning }]}>
              <Text style={[styles.summaryCount, { color: colors.warning }]}>{mixedCount}</Text>
              <Text style={styles.summaryLabel}>Mixed</Text>
            </View>
            <View style={[styles.summaryBox, { borderColor: colors.error }]}>
              <Text style={[styles.summaryCount, { color: colors.error }]}>{fillerCount}</Text>
              <Text style={styles.summaryLabel}>Filler</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Canon</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Mixed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Filler</Text>
            </View>
          </View>

          {/* Episode List */}
          <View style={styles.episodeList}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            {data.episodes.map((ep) => (
              <View
                key={ep.episode}
                style={[
                  styles.episodeItem,
                  { borderLeftColor: getEpisodeTypeColor(ep.type) },
                ]}
              >
                <View style={styles.episodeInfo}>
                  <Text style={styles.episodeNumber}>Ep. {ep.episode}</Text>
                  {ep.title ? <Text style={styles.episodeTitle}>{ep.title}</Text> : null}
                </View>
                <View style={[styles.episodeTypeBadge, { backgroundColor: getEpisodeTypeColor(ep.type) + '33' }]}>
                  <Text style={[styles.episodeTypeText, { color: getEpisodeTypeColor(ep.type) }]}>
                    {ep.type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No filler data available for this anime</Text>
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  episodeList: {
    marginBottom: spacing.lg,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeNumber: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  episodeTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  episodeTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.sm,
  },
  episodeTypeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textDim,
    fontSize: fontSize.md,
  },
});

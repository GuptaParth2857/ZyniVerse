import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import AnimeCard from '../components/AnimeCard';
import { Anime } from '../types';
import { api } from '../services/api';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
];

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [trending, setTrending] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await api.trending.get();
      setTrending(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const genreFiltered = selectedGenres.length > 0
    ? trending.filter((a) =>
        a.genres?.some((g: any) => selectedGenres.includes(g.name || g))
      )
    : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Genre Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick Your Genres</Text>
          <View style={styles.genresRow}>
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.genreChip, selectedGenres.includes(genre) && styles.genreChipActive]}
                onPress={() => toggleGenre(genre)}
              >
                <Text style={[styles.genreText, selectedGenres.includes(genre) && styles.genreTextActive]}>
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Genre-filtered results */}
        {selectedGenres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Picks</Text>
            {loading ? (
              <Text style={styles.emptyText}>Loading...</Text>
            ) : genreFiltered.length > 0 ? (
              genreFiltered.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recommendationCard}
                  onPress={() => navigation.navigate('AnimeDetail', { id: item.id, title: item.title.english || item.title.romaji })}
                >
                  <View style={styles.recommendationInfo}>
                    <Text style={styles.recommendationTitle} numberOfLines={1}>
                      {item.title.english || item.title.romaji}
                    </Text>
                    <View style={styles.recommendationMeta}>
                      <Text style={styles.recommendationScore}>
                        {item.averageScore ? `Score: ${(item.averageScore / 10).toFixed(1)}` : 'No score'}
                      </Text>
                      {item.episodes ? (
                        <Text style={styles.recommendationEps}>{item.episodes} eps</Text>
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.recommendationArrow}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No matches found for selected genres</Text>
            )}
          </View>
        )}

        {/* Trending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          {loading ? (
            <View style={styles.trendingRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={[styles.trendingSkeleton, { opacity: 0.5 }]} />
              ))}
            </View>
          ) : trending.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trending.map((item) => (
                <AnimeCard key={item.id} anime={item} compact />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No trending anime available</Text>
          )}
        </View>

        {/* Top Rated */}
        {trending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Rated</Text>
            {[...trending]
              .filter((a) => a.averageScore)
              .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
              .slice(0, 5)
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recommendationCard}
                  onPress={() => navigation.navigate('AnimeDetail', { id: item.id, title: item.title.english || item.title.romaji })}
                >
                  <View style={styles.recommendationInfo}>
                    <Text style={styles.recommendationTitle} numberOfLines={1}>
                      {item.title.english || item.title.romaji}
                    </Text>
                    <View style={styles.recommendationMeta}>
                      <Text style={styles.recommendationScore}>
                        Score: {item.averageScore ? (item.averageScore / 10).toFixed(1) : '--'}
                      </Text>
                      {item.episodes ? (
                        <Text style={styles.recommendationEps}>{item.episodes} eps</Text>
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.recommendationArrow}>›</Text>
                </TouchableOpacity>
              ))}
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
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreChipActive: {
    backgroundColor: colors.primary + '33',
    borderColor: colors.primary,
  },
  genreText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  genreTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  recommendationScore: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  recommendationEps: {
    color: colors.textDim,
    fontSize: fontSize.xs,
  },
  recommendationArrow: {
    color: colors.textDim,
    fontSize: fontSize.xl,
    marginLeft: spacing.sm,
  },
  trendingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trendingSkeleton: {
    width: 120,
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    paddingVertical: spacing.md,
  },
});

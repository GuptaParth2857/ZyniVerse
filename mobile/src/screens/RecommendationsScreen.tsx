import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import AnimeCard from '../components/AnimeCard';
import { Anime } from '../types';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mecha', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
];

const MOCK_RECOMMENDATIONS: (Anime & { reason?: string })[] = [
  {
    id: 1,
    title: { english: 'Attack on Titan' },
    coverImage: { medium: '' },
    averageScore: 85,
    episodes: 89,
    reason: 'You liked dark fantasy themes',
  },
  {
    id: 2,
    title: { english: 'Fullmetal Alchemist: Brotherhood' },
    coverImage: { medium: '' },
    averageScore: 90,
    episodes: 64,
    reason: 'High rated adventure anime',
  },
  {
    id: 3,
    title: { english: 'Steins;Gate' },
    coverImage: { medium: '' },
    averageScore: 88,
    episodes: 24,
    reason: 'Sci-fi time travel masterpiece',
  },
];

const MOCK_TRENDING = [
  { id: 4, title: { english: 'One Piece' }, coverImage: { medium: '' }, averageScore: 82, episodes: 1098 },
  { id: 5, title: { english: 'Jujutsu Kaisen' }, coverImage: { medium: '' }, averageScore: 84, episodes: 47 },
  { id: 6, title: { english: 'Demon Slayer' }, coverImage: { medium: '' }, averageScore: 86, episodes: 55 },
];

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Recommended For You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          {MOCK_RECOMMENDATIONS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recommendationCard}>
              <View style={styles.recommendationInfo}>
                <Text style={styles.recommendationTitle}>
                  {item.title.english || item.title.romaji}
                </Text>
                <Text style={styles.recommendationReason}>{item.reason}</Text>
                <View style={styles.recommendationMeta}>
                  <Text style={styles.recommendationScore}>
                    Score: {item.averageScore ? (item.averageScore / 10).toFixed(1) : '--'}
                  </Text>
                  <Text style={styles.recommendationEps}>
                    {item.episodes} eps
                  </Text>
                </View>
              </View>
              <Text style={styles.recommendationArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOCK_TRENDING.map((item) => (
              <AnimeCard key={item.id} anime={item} compact />
            ))}
          </ScrollView>
        </View>

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
  recommendationReason: {
    color: colors.primary,
    fontSize: fontSize.xs,
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
});

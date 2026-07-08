import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import { Anime } from '../types';
import AnimeCard from './AnimeCard';

interface Props {
  title: string;
  anime: Anime[];
  onSeeAll?: () => void;
  compact?: boolean;
}

export default function AnimeRow({ title, anime, onSeeAll, compact = false }: Props) {
  if (!anime || anime.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {anime.map((item) => (
          <AnimeCard key={item.id} anime={item} compact={compact} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  seeAll: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
});

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { Anime } from '../types';
import { truncate, formatScore, getScoreColor } from '../utils/helpers';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.md * 3) / 2.5;

interface Props {
  anime: Anime;
  compact?: boolean;
  showScore?: boolean;
}

export default function AnimeCard({ anime, compact = false, showScore = true }: Props) {
  const navigation = useNavigation<any>();
  const width = compact ? CARD_WIDTH * 0.75 : CARD_WIDTH;
  const title = anime.title?.english || anime.title?.romaji || 'Unknown';
  const imageUrl = anime.coverImage?.medium || anime.coverImage?.large;
  const score = anime.averageScore;

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => navigation.navigate('AnimeDetail', { id: anime.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { width }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { width }]}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}
        {showScore && score && (
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(score) }]}>
            <Text style={styles.scoreText}>{formatScore(score)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
        {truncate(title, compact ? 20 : 30)}
      </Text>
      {anime.episodes && (
        <Text style={styles.episodes}>{anime.episodes} eps</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceLight,
  },
  image: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  placeholderText: {
    fontSize: 32,
    color: colors.textDim,
  },
  scoreBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  scoreText: {
    color: '#000',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  episodes: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});

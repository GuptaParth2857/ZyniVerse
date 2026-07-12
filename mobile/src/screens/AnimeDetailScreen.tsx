import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { useAnime } from '../hooks/useAnime';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import FillerProgress from '../components/FillerProgress';
import DubBadge from '../components/DubBadge';
import AdPlaceholder from '../components/AdPlaceholder';
import { formatScore, getScoreColor, getStatusColor } from '../utils/helpers';
import { api } from '../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

const statusOptions = ['Watching', 'Completed', 'Planning', 'Dropped', 'Paused'];

export default function AnimeDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const { data: anime, loading, error, refetch } = useAnime(id);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [dubStatus, setDubStatus] = useState<{ hindi?: boolean; tamil?: boolean; telugu?: boolean } | null>(null);
  const [fillerData, setFillerData] = useState<{ fillerPercentage: number; totalFillers: number } | null>(null);

  useEffect(() => {
    if (anime?.malId) {
      api.dubStatus.get(anime.malId).then((data) => {
        if (data) setDubStatus(data as any);
      }).catch(() => {});
      fetch(`https://zyverse.in/api/v1/filler/${anime.id || anime.malId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.fillerPercentage != null) {
            setFillerData({ fillerPercentage: data.fillerPercentage, totalFillers: data.totalFillers || 0 });
          }
        })
        .catch(() => {});
    }
  }, [anime?.id, anime?.malId]);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [userStatus, setUserStatus] = useState<string | null>(null);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;
  if (!anime) return <ErrorView message="Anime not found" />;

  const title = anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown';
  const score = anime.averageScore;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner & Cover */}
        <View style={styles.headerSection}>
          {anime.bannerImage ? (
            <Image
              source={{ uri: anime.bannerImage }}
              style={styles.banner}
              blurRadius={20}
            />
          ) : (
            <View style={styles.bannerPlaceholder} />
          )}
          <View style={styles.coverRow}>
            <View style={styles.coverContainer}>
              {anime.coverImage?.large ? (
                <Image
                  source={{ uri: anime.coverImage.large }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.coverImage, styles.coverPlaceholder]}>
                  <Text style={styles.coverPlaceholderText}>?</Text>
                </View>
              )}
            </View>
            <View style={styles.titleInfo}>
              <Text style={styles.title}>{title}</Text>
              {anime.episodes && (
                <Text style={styles.info}>{anime.episodes} episodes</Text>
              )}
              {anime.status && (
                <Text style={[styles.info, { color: getStatusColor(anime.status) }]}>
                  {anime.status}
                </Text>
              )}
              {anime.season && anime.seasonYear && (
                <Text style={styles.info}>{anime.season} {anime.seasonYear}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Score & Actions */}
        <View style={styles.statsRow}>
          {score && (
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(score) }]}>
              <Text style={styles.scoreText}>{formatScore(score)}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.statusButton, userStatus ? { borderColor: getStatusColor(userStatus) } : {}]}
            onPress={() => setShowStatusPicker(!showStatusPicker)}
          >
            <Text style={styles.statusButtonText}>
              {userStatus || 'Add to List'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Picker */}
        {showStatusPicker && (
          <View style={styles.statusPicker}>
            {statusOptions.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, userStatus === s && { backgroundColor: getStatusColor(s) + '33' }]}
                onPress={() => { setUserStatus(s); setShowStatusPicker(false); }}
              >
                <Text style={styles.statusOptionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <View style={styles.genresRow}>
            {anime.genres.slice(0, 5).map((g) => (
              <View key={g} style={styles.genreChip}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Filler Section */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => navigation.navigate('FillerGuide', { id: anime.id || anime.malId, title })}
          >
            <FillerProgress
              totalEpisodes={anime.episodes || 0}
              totalFillers={fillerData?.totalFillers || 0}
              fillerPercentage={fillerData?.fillerPercentage || 0}
            />
          </TouchableOpacity>
        </View>

        {/* Dub Status */}
        {(dubStatus?.hindi || dubStatus?.tamil || dubStatus?.telugu) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dub Availability</Text>
            <View style={styles.dubRow}>
              {dubStatus?.hindi && <DubBadge language="hindi" available />}
              {dubStatus?.tamil && <DubBadge language="tamil" available />}
              {dubStatus?.telugu && <DubBadge language="telugu" available />}
              {dubStatus?.hindi === false && <DubBadge language="hindi" available={false} />}
              {dubStatus?.tamil === false && <DubBadge language="tamil" available={false} />}
              {dubStatus?.telugu === false && <DubBadge language="telugu" available={false} />}
            </View>
          </View>
        ) : null}

        {/* Description */}
        {anime.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {anime.description.replace(/<[^>]*>/g, '')}
            </Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMore}>
                {showFullDescription ? 'Show Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Streaming Platforms */}
        {anime.streamingEpisodes && anime.streamingEpisodes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streaming</Text>
            {anime.streamingEpisodes.slice(0, 5).map((ep, i) => (
              <TouchableOpacity key={i} style={styles.streamingItem}>
                <Text style={styles.streamingText}>{ep.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Discussion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.discussionButton}>
            <Text style={styles.discussionText}>💬 View Discussion</Text>
          </TouchableOpacity>
        </View>

        <AdPlaceholder height={100} />
        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  banner: {
    width: SCREEN_WIDTH,
    height: 200,
    position: 'absolute',
    top: 0,
  },
  bannerPlaceholder: {
    width: SCREEN_WIDTH,
    height: 200,
    position: 'absolute',
    top: 0,
    backgroundColor: colors.surface,
  },
  coverRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: 120,
    alignItems: 'flex-end',
  },
  coverContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coverImage: {
    width: 110,
    height: 160,
    borderRadius: borderRadius.md,
  },
  coverPlaceholder: {
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 36,
    color: colors.textDim,
  },
  titleInfo: {
    flex: 1,
    marginLeft: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  info: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  scoreText: {
    color: '#000',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs + 4,
    alignItems: 'center',
  },
  statusButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statusPicker: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  statusOption: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  statusOptionText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  genreChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  genreText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  dubRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  readMore: {
    color: colors.primary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  streamingItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  streamingText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  discussionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  discussionText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

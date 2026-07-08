import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { getEpisodeTypeColor } from '../utils/helpers';
import FillerProgress from '../components/FillerProgress';

const MOCK_FILLER_DATA = {
  totalEpisodes: 150,
  totalFillers: 42,
  fillerPercentage: 28,
  episodes: [
    { episode: 1, type: 'canon', title: 'The Beginning' },
    { episode: 2, type: 'canon', title: 'New Friends' },
    { episode: 3, type: 'mixed', title: 'Training Arc' },
    { episode: 4, type: 'filler', title: 'Beach Episode' },
    { episode: 5, type: 'filler', title: 'Cooking Contest' },
    { episode: 6, type: 'canon', title: 'The Battle Begins' },
    { episode: 7, type: 'canon', title: 'Darkness Falls' },
    { episode: 8, type: 'mixed', title: 'Side Story' },
  ],
};

export default function FillerGuideScreen() {
  const route = useRoute<any>();
  const { id, title: animeTitle } = route.params;

  const data = MOCK_FILLER_DATA;

  const canonCount = data.episodes.filter((e) => e.type === 'canon').length;
  const mixedCount = data.episodes.filter((e) => e.type === 'mixed').length;
  const fillerCount = data.episodes.filter((e) => e.type === 'filler').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{animeTitle}</Text>

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
              {ep.title && <Text style={styles.episodeTitle}>{ep.title}</Text>}
            </View>
            <View style={[styles.episodeTypeBadge, { backgroundColor: getEpisodeTypeColor(ep.type) + '33' }]}>
              <Text style={[styles.episodeTypeText, { color: getEpisodeTypeColor(ep.type) }]}>
                {ep.type}
              </Text>
            </View>
            <View style={styles.voteRow}>
              <TouchableOpacity style={styles.voteButton}>
                <Text style={styles.voteIcon}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.voteButton}>
                <Text style={styles.voteIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Report */}
      <TouchableOpacity style={styles.reportButton}>
        <Text style={styles.reportText}>Report wrong data</Text>
      </TouchableOpacity>

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
  voteRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  voteButton: {
    padding: spacing.xs,
  },
  voteIcon: {
    color: colors.textDim,
    fontSize: fontSize.sm,
  },
  reportButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: spacing.lg,
  },
  reportText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

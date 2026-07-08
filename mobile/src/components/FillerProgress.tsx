import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { getFillerColor } from '../utils/helpers';

interface Props {
  totalEpisodes: number;
  totalFillers: number;
  fillerPercentage: number;
}

export default function FillerProgress({ totalEpisodes, totalFillers, fillerPercentage }: Props) {
  const barColor = getFillerColor(fillerPercentage);
  const canonCount = totalEpisodes - totalFillers;

  return (
    <View style={styles.container}>
      <View style={styles.percentageRow}>
        <Text style={[styles.percentage, { color: barColor }]}>
          {fillerPercentage.toFixed(1)}%
        </Text>
        <Text style={styles.label}>Filler</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(fillerPercentage, 100)}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>
      <View style={styles.counts}>
        <Text style={styles.countText}>
          <Text style={{ color: colors.success }}>{canonCount}</Text> Canon
        </Text>
        <Text style={styles.countText}>
          <Text style={{ color: colors.error }}>{totalFillers}</Text> Filler
        </Text>
        <Text style={styles.countText}>
          <Text style={{ color: colors.text }}>{totalEpisodes}</Text> Total
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  percentage: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  barContainer: {
    marginBottom: spacing.sm,
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  counts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});

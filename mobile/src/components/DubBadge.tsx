import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface Props {
  language: 'hindi' | 'tamil' | 'telugu';
  available?: boolean;
  platform?: string;
}

const languageColors: Record<string, string> = {
  hindi: '#f97316',
  tamil: '#dc2626',
  telugu: '#2563eb',
};

const languageLabels: Record<string, string> = {
  hindi: 'Hindi',
  tamil: 'Tamil',
  telugu: 'Telugu',
};

export default function DubBadge({ language, available, platform }: Props) {
  const color = languageColors[language] || colors.textMuted;

  return (
    <View style={[styles.badge, { borderColor: available ? color : colors.border }]}>
      <Text style={[styles.text, { color: available ? color : colors.textDim }]}>
        {languageLabels[language]} {available ? '✓' : '✗'}
      </Text>
      {platform && available && (
        <Text style={styles.platform}>{platform}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  platform: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: 4,
  },
});

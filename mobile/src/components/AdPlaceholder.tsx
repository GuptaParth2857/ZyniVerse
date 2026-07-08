import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface Props {
  width?: number | string;
  height?: number;
}

export default function AdPlaceholder({ width = '100%', height = 120 }: Props) {
  return (
    <View style={[styles.container, { width: width as any, height }]}>
      <Text style={styles.label}>Advertisement</Text>
      <View style={styles.placeholder}>
        <Text style={styles.adText}>Ad Space</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  label: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  adText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
  },
});

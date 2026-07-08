import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';

type ContentType = 'anime' | 'manga' | 'light_novel';

export default function MangaScreen() {
  const insets = useSafeAreaInsets();
  const [activeType, setActiveType] = useState<ContentType>('manga');
  const [query, setQuery] = useState('');

  const types: { key: ContentType; label: string }[] = [
    { key: 'anime', label: 'Anime' },
    { key: 'manga', label: 'Manga' },
    { key: 'light_novel', label: 'Light Novels' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Library</Text>

      {/* Type Selector */}
      <View style={styles.typeRow}>
        {types.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.typeChip, activeType === t.key && styles.typeChipActive]}
            onPress={() => setActiveType(t.key)}
          >
            <Text style={[styles.typeText, activeType === t.key && styles.typeTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeType === 'light_novel' ? 'light novels' : activeType}...`}
          placeholderTextColor={colors.textDim}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Sections */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Currently Reading */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeType === 'anime' ? 'Currently Watching' : 'Currently Reading'}
          </Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>
              {activeType === 'anime' ? 'No anime in your list' : 'No manga in your list'}
            </Text>
          </View>
        </View>

        {/* Reading List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeType === 'anime' ? 'Watch List' : 'Reading List'}
          </Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>
              Add items to your{' '}
              {activeType === 'anime' ? 'watch list' : 'reading list'}
            </Text>
          </View>
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
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
  },
  typeText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';

const CATEGORIES = [
  { name: 'General Discussion', icon: '💬', threads: 1243 },
  { name: 'Anime Discussion', icon: '🎬', threads: 2891 },
  { name: 'Manga Discussion', icon: '📖', threads: 1567 },
  { name: 'Recommendations', icon: '⭐', threads: 892 },
  { name: 'Filler Guide Help', icon: '📊', threads: 456 },
  { name: 'Dub Discussion', icon: '🎤', threads: 678 },
  { name: 'Site Feedback', icon: '🔧', threads: 234 },
  { name: 'Off-Topic', icon: '🎮', threads: 1023 },
];

const RECENT_THREADS = [
  { id: '1', title: 'Best anime of 2026 so far?', author: 'AnimeFan', replies: 45, category: 'Anime Discussion' },
  { id: '2', title: 'One Piece filler guide update', author: 'FillerKing', replies: 23, category: 'Filler Guide Help' },
  { id: '3', title: 'Looking for dark fantasy recommendations', author: 'DarkMode', replies: 18, category: 'Recommendations' },
  { id: '4', title: 'Hindi dub quality comparison', author: 'DubWatcher', replies: 31, category: 'Dub Discussion' },
];

export default function ForumScreen() {
  const insets = useSafeAreaInsets();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forum</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreate(!showCreate)}
        >
          <Text style={styles.createButtonText}>+ New Thread</Text>
        </TouchableOpacity>
      </View>

      {/* Create Thread */}
      {showCreate && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.createInput}
            placeholder="Thread title..."
            placeholderTextColor={colors.textDim}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <View style={styles.createActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreate(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.name} style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryThreads}>{cat.threads} threads</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Threads */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Threads</Text>
          {RECENT_THREADS.map((thread) => (
            <TouchableOpacity key={thread.id} style={styles.threadItem}>
              <View style={styles.threadInfo}>
                <Text style={styles.threadTitle}>{thread.title}</Text>
                <View style={styles.threadMeta}>
                  <Text style={styles.threadAuthor}>{thread.author}</Text>
                  <Text style={styles.threadDot}>·</Text>
                  <Text style={styles.threadCategory}>{thread.category}</Text>
                </View>
              </View>
              <View style={styles.replyBadge}>
                <Text style={styles.replyCount}>{thread.replies}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  createButtonText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  createForm: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  createInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  submitText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryThreads: {
    color: colors.textDim,
    fontSize: fontSize.xs,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  threadInfo: {
    flex: 1,
  },
  threadTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threadAuthor: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  threadDot: {
    color: colors.textDim,
    fontSize: fontSize.xs,
  },
  threadCategory: {
    color: colors.primary,
    fontSize: fontSize.xs,
  },
  replyBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 32,
    alignItems: 'center',
  },
  replyCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

const API_BASE = 'https://zyverse.in';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  _count: { threads: number };
}

interface ForumThread {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  _count: { posts: number };
  user: { id: string; username: string; avatar: string | null };
  lastPost?: { createdAt: string; user: { username: string } } | null;
}

export default function ForumScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [catRes, threadRes] = await Promise.all([
        fetch(`${API_BASE}/api/forum/categories`),
        fetch(`${API_BASE}/api/forum/threads?limit=10&sort=recent`),
      ]);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
      if (threadRes.ok) {
        const threadData = await threadRes.json();
        setThreads(threadData.threads || []);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forum</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreate(!showCreate)}>
          <Text style={styles.createButtonText}>+ New Thread</Text>
        </TouchableOpacity>
      </View>

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
            <TouchableOpacity
              style={[styles.submitButton, !newTitle.trim() && { opacity: 0.5 }]}
              disabled={!newTitle.trim()}
              onPress={() => {
                if (newTitle.trim()) {
                  navigation.navigate('ForumCreate', { title: newTitle.trim() });
                  setShowCreate(false);
                  setNewTitle('');
                }
              }}
            >
              <Text style={styles.submitText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {loading ? (
            <View style={styles.categoriesGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={[styles.categoryCard, { opacity: 0.5 }]}>
                  <View style={{ height: 24, width: 24, backgroundColor: colors.surfaceLight, borderRadius: 12, marginBottom: spacing.xs }} />
                  <View style={{ height: 12, width: '70%', backgroundColor: colors.surfaceLight, borderRadius: 4, marginBottom: 4 }} />
                  <View style={{ height: 10, width: '50%', backgroundColor: colors.surfaceLight, borderRadius: 4 }} />
                </View>
              ))}
            </View>
          ) : categories.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate('ForumCategory', { id: cat.id, name: cat.name })}
                >
                  <Text style={styles.categoryIcon}>{cat.icon || '💬'}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryThreads}>{cat._count.threads} threads</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No categories yet</Text>
          )}
        </View>

        {/* Recent Threads */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Threads</Text>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={[styles.threadItem, { opacity: 0.5 }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ height: 14, width: '80%', backgroundColor: colors.surfaceLight, borderRadius: 4, marginBottom: 6 }} />
                  <View style={{ height: 10, width: '50%', backgroundColor: colors.surfaceLight, borderRadius: 4 }} />
                </View>
              </View>
            ))
          ) : threads.length > 0 ? (
            threads.map((thread) => (
              <TouchableOpacity
                key={thread.id}
                style={styles.threadItem}
                onPress={() => navigation.navigate('ForumThread', { id: thread.id, title: thread.title })}
              >
                <View style={styles.threadInfo}>
                  <Text style={styles.threadTitle} numberOfLines={1}>{thread.title}</Text>
                  <View style={styles.threadMeta}>
                    <Text style={styles.threadAuthor}>{thread.user?.username || 'Anonymous'}</Text>
                    <Text style={styles.threadDot}>·</Text>
                    <Text style={styles.threadCategory}>{thread.category}</Text>
                    <Text style={styles.threadDot}>·</Text>
                    <Text style={styles.threadCategory}>{formatTime(thread.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.replyBadge}>
                  <Text style={styles.replyCount}>{thread._count?.posts || 0}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No threads yet</Text>
              <Text style={styles.emptyText}>Start a conversation!</Text>
            </View>
          )}
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
  },
});

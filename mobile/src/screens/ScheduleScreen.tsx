import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { formatTimeUntilAiring } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const API_BASE = 'https://zyverse.in';

interface ScheduleItem {
  mediaId: number;
  title: string;
  episode: number;
  airingAt: string;
  timeUntilAiring: number;
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/schedule`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setSchedule(Array.isArray(data) ? data : data.schedule || []);
    } catch {
      setError('Could not load schedule');
      setSchedule([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const onRefresh = () => { setRefreshing(true); fetchSchedule(); };

  const filteredSchedule = schedule.filter((item) => {
    if (!item.airingAt) return false;
    const airDate = new Date(item.airingAt);
    const dayIndex = (airDate.getDay() + 6) % 7;
    return dayIndex === selectedDay;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Schedule</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {DAYS.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayChip, selectedDay === index && styles.dayChipActive]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[styles.dayText, selectedDay === index && styles.dayTextActive]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.dayTitle}>{FULL_DAYS[selectedDay]}</Text>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchSchedule} />
      ) : filteredSchedule.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No episodes airing</Text>
          <Text style={styles.emptySubtitle}>Check other days or come back later</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {filteredSchedule.map((item) => (
            <View key={item.mediaId} style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.scheduleEpisode}>
                  Episode {item.episode}
                </Text>
                <Text style={styles.scheduleTime}>
                  {formatTimeUntilAiring(item.timeUntilAiring)}
                </Text>
              </View>
            </View>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
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
  daySelector: {
    marginBottom: spacing.md,
  },
  daySelectorContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#fff',
  },
  dayTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleEpisode: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  scheduleTime: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});

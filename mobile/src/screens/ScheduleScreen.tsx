import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { ScheduleItem } from '../types';
import { formatTimeUntilAiring } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    mediaId: 1,
    title: 'One Piece',
    episode: 1098,
    airingAt: new Date(Date.now() + 3600000).toISOString(),
    timeUntilAiring: 3600,
    media: {} as any,
  },
  {
    mediaId: 2,
    title: 'Jujutsu Kaisen',
    episode: 25,
    airingAt: new Date(Date.now() + 7200000).toISOString(),
    timeUntilAiring: 7200,
    media: {} as any,
  },
  {
    mediaId: 3,
    title: 'Attack on Titan',
    episode: 89,
    airingAt: new Date(Date.now() + 10800000).toISOString(),
    timeUntilAiring: 10800,
    media: {} as any,
  },
];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schedule = MOCK_SCHEDULE;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Schedule</Text>

      {/* Day Selector */}
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
        <ErrorView message={error} onRetry={() => {}} />
      ) : schedule.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No episodes airing on this day</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {schedule.map((item) => (
            <View key={item.mediaId} style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.scheduleEpisode}>
                  Episode {item.episode}
                </Text>
                <Text style={styles.scheduleTime}>
                  {formatTimeUntilAiring(item.timeUntilAiring)}
                </Text>
              </View>
              <TouchableOpacity style={styles.notifyButton}>
                <Text style={styles.notifyText}>Notify</Text>
              </TouchableOpacity>
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
  notifyButton: {
    backgroundColor: colors.primary + '33',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  notifyText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});

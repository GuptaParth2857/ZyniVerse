import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { api } from '../services/api';
import { CharacterTournamentDetail, TournamentParticipant, TournamentMatch } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function Countdown({ endsAt }: { endsAt?: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let text = '—';
  if (endsAt) {
    const diff = new Date(endsAt).getTime() - now;
    if (diff <= 0) {
      text = 'Qualifying has closed';
    } else {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      text = d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s` : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    }
  }
  return <Text style={styles.countdownValue}>⏳ {text}</Text>;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  qualifying: { label: 'QUALIFYING', color: '#00ffe0' },
  active: { label: 'LIVE', color: '#ff00e6' },
  upcoming: { label: 'UPCOMING', color: '#f59e0b' },
  completed: { label: 'COMPLETED', color: '#22c55e' },
  cancelled: { label: 'CANCELLED', color: '#ef4444' },
};

export default function TournamentDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const tournamentId: string = route.params?.id;

  const [detail, setDetail] = useState<CharacterTournamentDetail | null>(null);
  const [myPollVote, setMyPollVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [d, poll] = await Promise.all([
        api.tournaments.detail(tournamentId),
        api.tournaments.pollVoteGet(tournamentId).catch(() => ({ myPollVote: null as string | null })),
      ]);
      setDetail(d);
      setMyPollVote(poll.myPollVote ?? null);
    } catch {
      setError('Could not load tournament');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const castVote = async (participantId: string) => {
    if (votingFor) return;
    setVotingFor(participantId);
    try {
      await api.tournaments.pollVoteCast(tournamentId, participantId);
      setMyPollVote(participantId);
      await fetchData();
    } catch (e: any) {
      Alert.alert('Vote failed', e?.message || 'Could not cast your vote');
    } finally {
      setVotingFor(null);
    }
  };

  const tournament = detail?.tournament;
  const meta = tournament ? STATUS_META[tournament.status] || { label: tournament.status, color: colors.textDim } : null;

  const sortedParticipants = useMemo(() => {
    if (!detail) return [];
    const parts = [...detail.tournament.participants];
    parts.sort((a, b) => (b.pollVotes || 0) - (a.pollVotes || 0));
    return parts;
  }, [detail]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error && !detail) return <ErrorView message={error} onRetry={fetchData} />;
  if (!detail || !tournament) return <ErrorView message="Tournament not found" onRetry={fetchData} />;

  const isQualifying = tournament.mode === 'qualifying';

  const renderParticipant = ({ item, index }: { item: TournamentParticipant; index: number }) => {
    const rank = index + 1;
    const voted = myPollVote === item.id;
    const votes = item.pollVotes || 0;
    const imageUrl = item.charImage || item.franchiseCover;
    const accent = rank <= 3 ? '#34d399' : '#22d3ee';
    return (
      <View style={styles.participantRow}>
        <View style={styles.rankBox}>
          <Text style={[styles.rankText, { color: accent }]}>#{rank}</Text>
        </View>
        <View style={styles.participantImageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.participantImage} resizeMode="cover" />
          ) : (
            <View style={[styles.participantImage, styles.participantPlaceholder]}>
              <Text style={styles.participantPlaceholderText}>{item.charName[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.participantInfo}>
          <Text style={styles.participantName} numberOfLines={2}>{item.charName}</Text>
          <Text style={styles.participantVotes}>{votes} vote{votes === 1 ? '' : 's'}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.voteButton,
            voted && styles.voteButtonVoted,
            myPollVote && !voted && styles.voteButtonDisabled,
          ]}
          disabled={!!myPollVote || votingFor === item.id}
          activeOpacity={0.7}
          onPress={() => castVote(item.id)}
        >
          <Text style={[styles.voteButtonText, voted && styles.voteButtonTextVoted]}>
            {votingFor === item.id ? '…' : voted ? '✓ Voted' : 'Vote'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMatch = (m: TournamentMatch, roundLabel: string) => {
    const winnerA = m.winnerId === m.charA?.id;
    const winnerB = m.winnerId === m.charB?.id;
    const matchVotes = m.votesA + m.votesB;
    const totalPct = matchVotes > 0 ? (m.votesA / matchVotes) * 100 : 50;
    return (
      <View key={m.id} style={styles.matchCard}>
        <Text style={styles.roundLabel}>
          {roundLabel} · Match {m.position}
        </Text>
        <View style={styles.matchup}>
          <View style={styles.matchSide}>
            <Text style={[styles.matchName, winnerA && styles.matchWinner]} numberOfLines={2}>
              {winnerA ? '🏆 ' : ''}{m.charA?.charName || 'TBD'}
            </Text>
            <Text style={styles.matchVotes}>{m.votesA}</Text>
          </View>
          <Text style={styles.matchVs}>vs</Text>
          <View style={[styles.matchSide, styles.matchSideRight]}>
            <Text style={styles.matchVotes}>{m.votesB}</Text>
            <Text style={[styles.matchName, styles.matchNameRight, winnerB && styles.matchWinner]} numberOfLines={2}>
              {winnerB ? '🏆 ' : ''}{m.charB?.charName || 'TBD'}
            </Text>
          </View>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFillA, { width: `${totalPct}%` }]} />
        </View>
      </View>
    );
  };

  const rounds = detail.rounds || [];

  return (
    <FlatList
      data={isQualifying ? sortedParticipants : []}
      keyExtractor={(item) => item.id}
      renderItem={renderParticipant}
      showsVerticalScrollIndicator={false}
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: spacing.xxl, paddingHorizontal: spacing.md }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>{tournament.title}</Text>
          {meta ? (
            <View style={styles.chipRow}>
              <View style={[styles.chip, { borderColor: meta.color }]}>
                <Text style={[styles.chipText, { color: meta.color }]}>{meta.label}</Text>
              </View>
              {tournament.creator ? (
                <Text style={styles.creatorText}>by @{tournament.creator.username}</Text>
              ) : null}
            </View>
          ) : null}
          {tournament.description ? (
            <Text style={styles.description}>{tournament.description}</Text>
          ) : null}

          {isQualifying && tournament.status === 'qualifying' ? (
            <View style={styles.countdownCard}>
              <Countdown endsAt={tournament.qualifyingEndsAt} />
              <Text style={styles.countdownHint}>
                {detail.totalVotes} vote{detail.totalVotes === 1 ? '' : 's'} cast · one vote per app
              </Text>
            </View>
          ) : null}

          {isQualifying && tournament.status !== 'qualifying' ? (
            <View style={styles.countdownCard}>
              <Text style={styles.countdownValue}>⏳ Qualifying has closed</Text>
              <Text style={styles.countdownHint}>
                {detail.totalVotes} votes cast in the poll
              </Text>
            </View>
          ) : null}

          {isQualifying ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>
                🎯 Ranking — {sortedParticipants.length} candidates
              </Text>
              {myPollVote ? (
                <Text style={styles.votedHint}>You voted. Tap ✓ to change.</Text>
              ) : (
                <Text style={styles.votedHint}>Vote for your favorite!</Text>
              )}
            </View>
          ) : null}

          {!isQualifying ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>
                🔥 Bracket · Round {tournament.currentRound}/{tournament.totalRounds}
              </Text>
              <Text style={styles.countdownHint}>
                {detail.totalVotes} votes cast{meta?.label === 'LIVE' && tournament.roundEndsAt ? ` · next round in ${countdownLabel(tournament.roundEndsAt)}` : ''}
              </Text>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !isQualifying && rounds.length > 0 ? (
          <View style={styles.bracketWrap}>
            {rounds.map((round) => (
              <View key={round.label}>
                <Text style={styles.bracketRoundTitle}>{round.label}</Text>
                {round.matches.map((m) => renderMatch(m, round.label))}
              </View>
            ))}
          </View>
        ) : isQualifying ? null : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No matches yet</Text>
          </View>
        )
      }
    />
  );
}

function countdownLabel(endsAt?: string | null): string {
  if (!endsAt) return '';
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'closes today';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  creatorText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  countdownCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  countdownValue: {
    color: colors.secondary,
    fontSize: fontSize.lg,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  countdownHint: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  listHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  listHeaderTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  votedHint: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  rankBox: {
    width: 40,
  },
  rankText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  participantImageWrap: {
    marginRight: spacing.sm,
  },
  participantImage: {
    width: 46,
    height: 62,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  participantPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantPlaceholderText: {
    color: colors.textDim,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  participantInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  participantName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  participantVotes: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  voteButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 74,
    alignItems: 'center',
  },
  voteButtonVoted: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  voteButtonDisabled: {
    opacity: 0.35,
  },
  voteButtonText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  voteButtonTextVoted: {
    color: '#22c55e',
  },
  bracketWrap: {
    marginTop: spacing.xs,
  },
  bracketRoundTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  matchCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  roundLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  matchSideRight: {
    justifyContent: 'flex-end',
  },
  matchName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  matchNameRight: {
    textAlign: 'right',
  },
  matchWinner: {
    color: '#34d399',
  },
  matchVotes: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  matchVs: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginHorizontal: spacing.sm,
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  barFillA: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
  },
});
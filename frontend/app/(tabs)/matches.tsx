import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, LoadingScreen } from '../../src/components';
import { matchAPI, teamAPI } from '../../src/services/api';
import { Match, MatchStatus, Team } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { format } from 'date-fns';

export default function MatchesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const fetchData = async () => {
    try {
      const [matchRes, teamRes] = await Promise.all([
        matchAPI.getMyMatches(),
        teamAPI.getMyTeams(),
      ]);
      setMatches(matchRes.data);
      setTeams(teamRes.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.READY_TO_PLAY:
        return COLORS.success;
      case MatchStatus.PAYMENTS_PENDING:
        return COLORS.warning;
      case MatchStatus.COMPLETED:
        return COLORS.textMuted;
      case MatchStatus.CANCELLED:
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const filteredMatches = matches.filter((match) => {
    const matchDate = new Date(match.date);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return matchDate >= now && match.status !== MatchStatus.COMPLETED && match.status !== MatchStatus.CANCELLED;
    }
    if (filter === 'past') {
      return matchDate < now || match.status === MatchStatus.COMPLETED;
    }
    return true;
  });

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  const isCaptain = (match: Match) => match.captain_id === user?.id;
  const isInvited = (match: Match) => match.invited_player_ids?.includes(user?.id || '');
  const isConfirmed = (match: Match) => match.confirmed_player_ids?.includes(user?.id || '');

  if (loading) {
    return <LoadingScreen message="Loading matches..." />;
  }

  // Check if user has any teams to create matches
  const captainTeams = teams.filter(t => t.captain_id === user?.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        {captainTeams.length > 0 && (
          <TouchableOpacity style={styles.createButton} onPress={() => router.push('/match/create')}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'upcoming', 'past'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <Card
              key={match.id}
              style={styles.matchCard}
              onPress={() => router.push(`/match/${match.id}`)}
            >
              <View style={styles.matchHeader}>
                <View style={styles.matchTitleRow}>
                  <Text style={styles.matchTitle}>{match.title}</Text>
                  {isCaptain(match) && (
                    <View style={styles.captainBadge}>
                      <Ionicons name="star" size={12} color={COLORS.gold} />
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
                    {match.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              <Text style={styles.teamName}>{getTeamName(match.team_id)}</Text>

              <View style={styles.matchDetails}>
                <View style={styles.matchDetail}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.matchDetailText}>
                    {format(new Date(match.date), 'EEE, MMM d, yyyy')}
                  </Text>
                </View>
                <View style={styles.matchDetail}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.matchDetailText}>
                    {format(new Date(match.date), 'h:mm a')}
                  </Text>
                </View>
                <View style={styles.matchDetail}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.matchDetailText}>{match.location}</Text>
                </View>
              </View>

              <View style={styles.matchFooter}>
                <View style={styles.matchMeta}>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatText}>{match.format}</Text>
                  </View>
                  <Text style={styles.playerCount}>
                    {match.confirmed_player_ids?.length || 0}/{match.player_limit} players
                  </Text>
                </View>
                <Text style={styles.matchCost}>AED {match.per_player_cost?.toFixed(2) || '0.00'}</Text>
              </View>

              {/* Invitation/Confirmation Status */}
              {isInvited(match) && !isConfirmed(match) && (
                <View style={styles.inviteBanner}>
                  <Ionicons name="mail" size={16} color={COLORS.secondary} />
                  <Text style={styles.inviteText}>You have been invited</Text>
                </View>
              )}
              {isConfirmed(match) && (
                <View style={styles.confirmedBanner}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.confirmedText}>You're playing</Text>
                </View>
              )}
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Matches Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? "You haven't joined any matches yet"
                : filter === 'upcoming'
                ? 'No upcoming matches'
                : 'No past matches'}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.card,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  matchCard: {
    marginBottom: SPACING.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  matchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  matchTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  captainBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  matchDetails: {
    gap: SPACING.xs,
  },
  matchDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  matchDetailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  matchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  formatBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  formatText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  playerCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  matchCost: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  inviteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.secondary + '15',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  inviteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  confirmedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success + '15',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  confirmedText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

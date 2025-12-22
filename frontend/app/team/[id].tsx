import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { teamAPI, matchAPI } from '../../src/services/api';
import { Team, User, Match } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { format } from 'date-fns';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'players' | 'matches'>('players');

  const fetchTeamData = async () => {
    try {
      const [teamRes, playersRes, matchesRes] = await Promise.all([
        teamAPI.getTeam(id),
        teamAPI.getPlayers(id),
        matchAPI.getTeamMatches(id),
      ]);
      setTeam(teamRes.data);
      setPlayers(playersRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [id]);

  const isCaptain = team?.captain_id === user?.id;

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join my team "${team?.name}" on Batlabz! Use invite code: ${team?.invite_code}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${playerName} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamAPI.removePlayer(id, playerId);
              fetchTeamData();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove player');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading team..." />;
  }

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Team not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{team.name}</Text>
        {isCaptain && (
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Team Info Card */}
        <Card style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <View style={styles.teamAvatar}>
              <Ionicons name="people" size={48} color={COLORS.primary} />
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{team.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={COLORS.textMuted} />
                <Text style={styles.teamLocation}>{team.home_location}</Text>
              </View>
            </View>
          </View>

          {/* Invite Code */}
          <TouchableOpacity style={styles.inviteCodeBox} onPress={handleShareInvite}>
            <View>
              <Text style={styles.inviteLabel}>Invite Code</Text>
              <Text style={styles.inviteCode}>{team.invite_code}</Text>
            </View>
            <Ionicons name="share-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{players.length}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{matches.length}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons for Captain */}
        {isCaptain && (
          <View style={styles.actionButtons}>
            <Button
              title="Create Match"
              onPress={() => router.push({ pathname: '/match/create', params: { teamId: id } })}
              icon={<Ionicons name="add-circle" size={20} color={COLORS.text} />}
              style={styles.actionButton}
            />
            <Button
              title="Share Invite"
              onPress={handleShareInvite}
              variant="outline"
              icon={<Ionicons name="share" size={20} color={COLORS.primary} />}
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'players' && styles.activeTab]}
            onPress={() => setActiveTab('players')}
          >
            <Text style={[styles.tabText, activeTab === 'players' && styles.activeTabText]}>
              Players ({players.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
            onPress={() => setActiveTab('matches')}
          >
            <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
              Matches ({matches.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'players' ? (
          <View style={styles.tabContent}>
            {players.map((player) => (
              <Card key={player.id} style={styles.playerCard}>
                <View style={styles.playerRow}>
                  <View style={styles.playerAvatar}>
                    <Ionicons name="person" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.playerInfo}>
                    <View style={styles.playerNameRow}>
                      <Text style={styles.playerName}>{player.name || 'Player'}</Text>
                      {player.id === team.captain_id && (
                        <View style={styles.captainBadge}>
                          <Ionicons name="star" size={12} color={COLORS.gold} />
                          <Text style={styles.captainText}>Captain</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.playerRole}>
                      {player.playing_role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </View>
                  {isCaptain && player.id !== team.captain_id && (
                    <TouchableOpacity
                      onPress={() => handleRemovePlayer(player.id, player.name)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.tabContent}>
            {matches.length > 0 ? (
              matches.map((match) => (
                <Card
                  key={match.id}
                  style={styles.matchCard}
                  onPress={() => router.push(`/match/${match.id}`)}
                >
                  <Text style={styles.matchTitle}>{match.title}</Text>
                  <View style={styles.matchDetails}>
                    <View style={styles.matchDetail}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.matchDetailText}>
                        {format(new Date(match.date), 'MMM d, h:mm a')}
                      </Text>
                    </View>
                    <View style={styles.matchDetail}>
                      <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.matchDetailText}>{match.location}</Text>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No matches yet</Text>
                {isCaptain && (
                  <Button
                    title="Create Match"
                    onPress={() => router.push({ pathname: '/match/create', params: { teamId: id } })}
                    size="sm"
                    style={{ marginTop: SPACING.md }}
                  />
                )}
              </Card>
            )}
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  teamCard: {
    marginBottom: SPACING.md,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  teamLocation: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  inviteCodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  inviteLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  inviteCode: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text,
  },
  tabContent: {},
  playerCard: {
    marginBottom: SPACING.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  playerRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  captainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  captainText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  removeButton: {
    padding: SPACING.sm,
  },
  matchCard: {
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  matchDetails: {
    gap: SPACING.xs,
  },
  matchDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchDetailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

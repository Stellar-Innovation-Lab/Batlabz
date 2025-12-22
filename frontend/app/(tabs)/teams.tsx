import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { teamAPI } from '../../src/services/api';
import { Team } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';

export default function TeamsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getMyTeams();
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeams();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading teams..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Teams</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/team/join')}>
            <Ionicons name="enter-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/team/create')}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {teams.length > 0 ? (
          teams.map((team) => (
            <Card
              key={team.id}
              style={styles.teamCard}
              onPress={() => router.push(`/team/${team.id}`)}
              variant={team.captain_id === user?.id ? 'highlight' : 'default'}
            >
              <View style={styles.teamHeader}>
                <View style={styles.teamAvatar}>
                  {team.logo ? (
                    <Text style={styles.teamLogo}>{team.logo}</Text>
                  ) : (
                    <Ionicons name="people" size={32} color={COLORS.primary} />
                  )}
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <View style={styles.teamMeta}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.teamLocation}>{team.home_location}</Text>
                  </View>
                </View>
                {team.captain_id === user?.id && (
                  <View style={styles.captainBadge}>
                    <Ionicons name="star" size={14} color={COLORS.gold} />
                    <Text style={styles.captainText}>Captain</Text>
                  </View>
                )}
              </View>

              <View style={styles.teamStats}>
                <View style={styles.teamStat}>
                  <Text style={styles.teamStatValue}>{team.player_ids?.length || 0}</Text>
                  <Text style={styles.teamStatLabel}>Players</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.teamStat}>
                  <Text style={styles.inviteCode}>{team.invite_code}</Text>
                  <Text style={styles.teamStatLabel}>Invite Code</Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Teams Yet</Text>
            <Text style={styles.emptyText}>Create a team or join one using an invite code</Text>
            <View style={styles.emptyActions}>
              <Button
                title="Create Team"
                onPress={() => router.push('/team/create')}
                size="md"
                style={{ marginRight: SPACING.sm }}
              />
              <Button
                title="Join Team"
                onPress={() => router.push('/team/join')}
                variant="outline"
                size="md"
              />
            </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  teamCard: {
    marginBottom: SPACING.md,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  teamLogo: {
    fontSize: 28,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  captainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  captainText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  teamStats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  teamStat: {
    flex: 1,
    alignItems: 'center',
  },
  teamStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  teamStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  inviteCode: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
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
    marginBottom: SPACING.lg,
  },
  emptyActions: {
    flexDirection: 'row',
  },
});

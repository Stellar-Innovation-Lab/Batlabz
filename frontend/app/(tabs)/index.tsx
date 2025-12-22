import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { dashboardAPI, notificationAPI } from '../../src/services/api';
import { PlayerDashboard, Match, MatchStatus } from '../../src/types';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<PlayerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchDashboard = async () => {
    try {
      const [dashRes, notifRes] = await Promise.all([
        dashboardAPI.getPlayerDashboard(),
        notificationAPI.getUnreadCount(),
      ]);
      setDashboard(dashRes.data);
      setUnreadCount(notifRes.data.count);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.READY_TO_PLAY:
        return COLORS.success;
      case MatchStatus.PAYMENTS_PENDING:
        return COLORS.warning;
      case MatchStatus.CANCELLED:
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Player'}</Text>
          <Text style={styles.subGreeting}>Ready to play?</Text>
        </View>
        <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Card */}
        <Card style={styles.walletCard} onPress={() => router.push('/(tabs)/wallet')}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>AED {(dashboard?.wallet_balance || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={32} color={COLORS.primary} />
            </View>
          </View>
          {dashboard?.pending_payment_amount && dashboard.pending_payment_amount > 0 && (
            <View style={styles.pendingBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.warning} />
              <Text style={styles.pendingText}>
                AED {dashboard.pending_payment_amount.toFixed(2)} pending payments
              </Text>
            </View>
          )}
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{dashboard?.teams_count || 0}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{dashboard?.upcoming_matches?.length || 0}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={COLORS.gold} />
            <Text style={styles.statValue}>{dashboard?.past_matches?.length || 0}</Text>
            <Text style={styles.statLabel}>Played</Text>
          </Card>
        </View>

        {/* Upcoming Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
            dashboard.upcoming_matches.slice(0, 3).map((match: Match) => (
              <Card
                key={match.id}
                style={styles.matchCard}
                onPress={() => router.push(`/match/${match.id}`)}
              >
                <View style={styles.matchHeader}>
                  <Text style={styles.matchTitle}>{match.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
                      {match.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetail}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.matchDetailText}>
                      {format(new Date(match.date), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                  <View style={styles.matchDetail}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.matchDetailText}>{match.location}</Text>
                  </View>
                </View>
                <View style={styles.matchFooter}>
                  <Text style={styles.matchFormat}>{match.format}</Text>
                  <Text style={styles.matchCost}>AED {match.per_player_cost?.toFixed(2) || '0.00'}/player</Text>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No upcoming matches</Text>
              <Button
                title="Browse Teams"
                onPress={() => router.push('/(tabs)/teams')}
                variant="outline"
                size="sm"
                style={{ marginTop: SPACING.md }}
              />
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/team/create')}>
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Create Team</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/team/join')}>
              <View style={styles.actionIcon}>
                <Ionicons name="enter" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionText}>Join Team</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/wallet/topup')}>
              <View style={styles.actionIcon}>
                <Ionicons name="card" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Top Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subGreeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notifButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  walletCard: {
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  walletAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  walletIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  pendingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  matchCard: {
    marginBottom: SPACING.sm,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
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
  matchFormat: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  matchCost: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

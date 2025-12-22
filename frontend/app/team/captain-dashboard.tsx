import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { dashboardAPI, matchAPI } from '../../src/services/api';
import { CaptainDashboard, Match, MatchStatus, PaymentStatus } from '../../src/types';
import { format } from 'date-fns';

export default function CaptainDashboardScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();

  const [dashboard, setDashboard] = useState<CaptainDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getCaptainDashboard(teamId);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching captain dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [teamId]);

  const handleAddExpense = async () => {
    if (!selectedMatchId || !expenseDesc.trim() || !expenseAmount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setActionLoading(true);
    try {
      await matchAPI.addExpense(selectedMatchId, expenseDesc.trim(), parseFloat(expenseAmount));
      setExpenseModalVisible(false);
      setExpenseDesc('');
      setExpenseAmount('');
      fetchDashboard();
      Alert.alert('Success', 'Expense added and player dues updated');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to add expense');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMatch = async (matchId: string) => {
    Alert.alert(
      'Complete Match',
      'Mark this match as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await matchAPI.complete(matchId);
              fetchDashboard();
              Alert.alert('Success', 'Match marked as completed');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Failed to complete match');
            }
          },
        },
      ]
    );
  };

  const handleCancelMatch = async (matchId: string) => {
    Alert.alert(
      'Cancel Match',
      'This will cancel the match and refund all payments. Continue?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await matchAPI.cancel(matchId);
              fetchDashboard();
              Alert.alert('Success', 'Match cancelled and refunds processed');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Failed to cancel match');
            }
          },
        },
      ]
    );
  };

  const getPaymentProgress = (match: Match) => {
    const total = match.player_payments?.length || 0;
    const paid = match.player_payments?.filter(p => p.status === PaymentStatus.PAID).length || 0;
    return { paid, total, percentage: total > 0 ? (paid / total) * 100 : 0 };
  };

  if (loading) {
    return <LoadingScreen message="Loading captain dashboard..." />;
  }

  if (!dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Captain Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(); }} tintColor={COLORS.primary} />
        }
      >
        {/* Team Info */}
        <Card style={styles.teamCard}>
          <Text style={styles.teamName}>{dashboard.team.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{dashboard.player_count}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{dashboard.total_matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>AED {dashboard.total_collected.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Collected</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>AED {dashboard.total_outstanding.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Outstanding</Text>
            </View>
          </View>
        </Card>

        {/* Pool Balance */}
        <Card style={styles.poolCard}>
          <View style={styles.poolRow}>
            <View>
              <Text style={styles.poolLabel}>Team Pool Balance</Text>
              <Text style={styles.poolAmount}>AED {(dashboard.team.pool_balance || 0).toFixed(2)}</Text>
            </View>
            <Ionicons name="cash" size={32} color={COLORS.primary} />
          </View>
        </Card>

        {/* Upcoming Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/match/create', params: { teamId } })}>
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {dashboard.upcoming_matches.length > 0 ? (
            dashboard.upcoming_matches.map((match) => {
              const progress = getPaymentProgress(match);
              return (
                <Card key={match.id} style={styles.matchCard}>
                  <TouchableOpacity onPress={() => router.push(`/match/${match.id}`)}>
                    <View style={styles.matchHeader}>
                      <Text style={styles.matchTitle}>{match.title}</Text>
                      <Text style={styles.matchDate}>
                        {format(new Date(match.date), 'MMM d, h:mm a')}
                      </Text>
                    </View>

                    {/* Payment Progress */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Payments</Text>
                        <Text style={styles.progressText}>{progress.paid}/{progress.total} paid</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
                      </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.matchStats}>
                      <View style={styles.matchStat}>
                        <Ionicons name="people" size={16} color={COLORS.textMuted} />
                        <Text style={styles.matchStatText}>{match.confirmed_player_ids?.length || 0} confirmed</Text>
                      </View>
                      <View style={styles.matchStat}>
                        <Ionicons name="cash" size={16} color={COLORS.textMuted} />
                        <Text style={styles.matchStatText}>AED {match.total_cost} total</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Action Buttons */}
                  <View style={styles.matchActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => { setSelectedMatchId(match.id); setExpenseModalVisible(true); }}
                    >
                      <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.actionBtnText}>Add Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => router.push({ pathname: '/match/rides', params: { matchId: match.id } })}
                    >
                      <Ionicons name="car-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.actionBtnText}>Rides</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleCompleteMatch(match.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
                      <Text style={[styles.actionBtnText, { color: COLORS.success }]}>Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleCancelMatch(match.id)}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
                      <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No upcoming matches</Text>
              <Button
                title="Create Match"
                onPress={() => router.push({ pathname: '/match/create', params: { teamId } })}
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
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push({ pathname: '/team/announcements', params: { teamId } })}>
              <Ionicons name="megaphone" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Announcements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push({ pathname: '/team/chat', params: { teamId } })}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.secondary} />
              <Text style={styles.quickActionText}>Team Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push(`/team/${teamId}`)}>
              <Ionicons name="people" size={24} color={COLORS.info} />
              <Text style={styles.quickActionText}>Manage Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={expenseModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Extra Expense</Text>
              <TouchableOpacity onPress={() => setExpenseModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              value={expenseDesc}
              onChangeText={setExpenseDesc}
              placeholder="Description (e.g., Water bottles)"
              placeholderTextColor={COLORS.textMuted}
            />
            <TextInput
              style={styles.modalInput}
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              placeholder="Amount (AED)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.modalNote}>
              This amount will be added to the match total and recalculated per player.
            </Text>
            <Button
              title="Add Expense"
              onPress={handleAddExpense}
              loading={actionLoading}
              fullWidth
            />
          </View>
        </View>
      </Modal>
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
  placeholder: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  teamCard: {
    marginBottom: SPACING.md,
  },
  teamName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  poolCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary + '15',
  },
  poolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poolLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  poolAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
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
  matchDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  matchStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  matchStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchStatText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  matchActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
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
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalInput: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
  },
  modalNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

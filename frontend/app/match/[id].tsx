import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { matchAPI, teamAPI, walletAPI } from '../../src/services/api';
import { Match, Team, User, MatchStatus, PaymentStatus } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { format } from 'date-fns';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMatchData = async () => {
    try {
      const matchRes = await matchAPI.getMatch(id);
      setMatch(matchRes.data);
      
      const teamRes = await teamAPI.getTeam(matchRes.data.team_id);
      setTeam(teamRes.data);
      
      const playersRes = await teamAPI.getPlayers(matchRes.data.team_id);
      setPlayers(playersRes.data);
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatchData();
  }, [id]);

  const isCaptain = match?.captain_id === user?.id;
  const isInvited = match?.invited_player_ids?.includes(user?.id || '');
  const isConfirmed = match?.confirmed_player_ids?.includes(user?.id || '');
  
  const myPayment = match?.player_payments?.find(p => p.user_id === user?.id);

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

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return COLORS.success;
      case PaymentStatus.PENDING:
        return COLORS.warning;
      case PaymentStatus.OVERDUE:
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  const handleAcceptInvite = async () => {
    setActionLoading(true);
    try {
      await matchAPI.respond(id, 'accept');
      fetchMatchData();
      Alert.alert('Success', 'You have joined the match!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to accept invite');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineInvite = async () => {
    setActionLoading(true);
    try {
      await matchAPI.respond(id, 'decline');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to decline');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvitePlayers = async () => {
    // Get players who are not yet invited
    const uninvitedPlayers = players.filter(
      p => !match?.invited_player_ids?.includes(p.id) && 
           !match?.confirmed_player_ids?.includes(p.id) &&
           p.id !== user?.id
    );
    
    if (uninvitedPlayers.length === 0) {
      Alert.alert('Info', 'All team members have been invited');
      return;
    }

    const playerIds = uninvitedPlayers.map(p => p.id);
    setActionLoading(true);
    try {
      await matchAPI.invitePlayers(id, playerIds);
      fetchMatchData();
      Alert.alert('Success', `Invited ${playerIds.length} players`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to invite players');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCalculateFees = async () => {
    setActionLoading(true);
    try {
      const response = await matchAPI.calculateFees(id);
      fetchMatchData();
      Alert.alert(
        'Fees Calculated',
        `Per player: AED ${response.data.per_player_cost.toFixed(2)}\nTotal players: ${response.data.total_players}`
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to calculate fees');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!myPayment) return;
    
    const amountDue = myPayment.amount_due - myPayment.amount_paid;
    if (amountDue <= 0) {
      Alert.alert('Info', 'Payment already complete');
      return;
    }

    if ((user?.wallet_balance || 0) < amountDue) {
      Alert.alert(
        'Insufficient Balance',
        `You need AED ${amountDue.toFixed(2)} but only have AED ${(user?.wallet_balance || 0).toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Top Up', onPress: () => router.push('/wallet/topup') },
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay AED ${amountDue.toFixed(2)} from your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay',
          onPress: async () => {
            setActionLoading(true);
            try {
              await walletAPI.payMatch(id, true);
              fetchMatchData();
              Alert.alert('Success', 'Payment successful!');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Payment failed');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading match..." />;
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Match not found</Text>
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
        <Text style={styles.headerTitle}>Match Details</Text>
        {isCaptain && (
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMatchData(); }} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Match Info Card */}
        <Card style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchTitle}>{match.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
                {match.status.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.teamRow}>
            <Ionicons name="people" size={16} color={COLORS.primary} />
            <Text style={styles.teamName}>{team?.name}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color={COLORS.textMuted} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{format(new Date(match.date), 'EEE, MMM d')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={20} color={COLORS.textMuted} />
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{format(new Date(match.date), 'h:mm a')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={20} color={COLORS.textMuted} />
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{match.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="baseball" size={20} color={COLORS.textMuted} />
              <Text style={styles.detailLabel}>Format</Text>
              <Text style={styles.detailValue}>{match.format}</Text>
            </View>
          </View>
        </Card>

        {/* Invitation Actions */}
        {isInvited && !isConfirmed && (
          <Card style={styles.inviteCard}>
            <Text style={styles.inviteTitle}>You've been invited!</Text>
            <Text style={styles.inviteText}>
              Join this match and pay AED {match.per_player_cost?.toFixed(2) || '0.00'}
            </Text>
            <View style={styles.inviteActions}>
              <Button
                title="Decline"
                onPress={handleDeclineInvite}
                variant="outline"
                loading={actionLoading}
                style={styles.inviteButton}
              />
              <Button
                title="Accept"
                onPress={handleAcceptInvite}
                loading={actionLoading}
                style={styles.inviteButton}
              />
            </View>
          </Card>
        )}

        {/* My Payment Status */}
        {isConfirmed && myPayment && (
          <Card 
            style={styles.paymentCard}
            variant={myPayment.status === PaymentStatus.PAID ? 'success' : 'warning'}
          >
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Your Payment</Text>
              <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(myPayment.status) + '20' }]}>
                <Text style={[styles.paymentBadgeText, { color: getPaymentStatusColor(myPayment.status) }]}>
                  {myPayment.status}
                </Text>
              </View>
            </View>
            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Amount Due</Text>
                <Text style={styles.paymentValue}>AED {myPayment.amount_due.toFixed(2)}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Paid</Text>
                <Text style={[styles.paymentValue, { color: COLORS.success }]}>AED {myPayment.amount_paid.toFixed(2)}</Text>
              </View>
              {myPayment.amount_due - myPayment.amount_paid > 0 && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Remaining</Text>
                  <Text style={[styles.paymentValue, { color: COLORS.error }]}>
                    AED {(myPayment.amount_due - myPayment.amount_paid).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
            {myPayment.status !== PaymentStatus.PAID && (
              <Button
                title="Pay Now"
                onPress={handlePayNow}
                loading={actionLoading}
                fullWidth
                style={{ marginTop: SPACING.md }}
              />
            )}
          </Card>
        )}

        {/* Cost Breakdown */}
        <Card style={styles.costCard}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Ground Fee</Text>
            <Text style={styles.costValue}>AED {match.cost_breakdown?.ground_fee?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Umpire Fee</Text>
            <Text style={styles.costValue}>AED {match.cost_breakdown?.umpire_fee?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Equipment/Balls</Text>
            <Text style={styles.costValue}>AED {match.cost_breakdown?.balls_equipment?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Miscellaneous</Text>
            <Text style={styles.costValue}>AED {match.cost_breakdown?.miscellaneous?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>AED {match.total_cost?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.perPlayerLabel}>Per Player ({match.confirmed_player_ids?.length || 0} confirmed)</Text>
            <Text style={styles.perPlayerValue}>AED {match.per_player_cost?.toFixed(2) || '0.00'}</Text>
          </View>
        </Card>

        {/* Captain Actions */}
        {isCaptain && (
          <Card style={styles.captainActionsCard}>
            <Text style={styles.sectionTitle}>Captain Actions</Text>
            
            {/* View Participants */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/match/participants?id=${match.id}`)}
            >
              <Ionicons name="people" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>View All Participants & Payments</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Book Ground */}
            {!match.ground_id && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/ground/book-for-match?matchId=${match.id}&date=${match.date}`)}
              >
                <Ionicons name="location" size={20} color={COLORS.gold} />
                <Text style={styles.actionButtonText}>Book Ground for This Match</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}

            {/* View Ground */}
            {match.ground_id && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSuccess]}
                onPress={() => router.push(`/ground/${match.ground_id}`)}
              >
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={[styles.actionButtonText, { color: COLORS.success }]}>Ground Booked</Text>
                <Ionicons name="eye" size={20} color={COLORS.success} />
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Players Section */}
        <View style={styles.playersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Players ({match.confirmed_player_ids?.length || 0}/{match.player_limit})
            </Text>
            {isCaptain && (
              <Button
                title="Invite All"
                onPress={handleInvitePlayers}
                variant="ghost"
                size="sm"
                loading={actionLoading}
              />
            )}
          </View>

          {/* Confirmed Players */}
          {match.confirmed_player_ids && match.confirmed_player_ids.length > 0 && (
            <View style={styles.playerGroup}>
              <Text style={styles.playerGroupTitle}>Confirmed</Text>
              {match.player_payments?.map((payment) => (
                <Card key={payment.user_id} style={styles.playerCard}>
                  <View style={styles.playerRow}>
                    <View style={styles.playerAvatar}>
                      <Ionicons name="person" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{payment.user_name}</Text>
                      <Text style={[
                        styles.playerPaymentStatus,
                        { color: getPaymentStatusColor(payment.status) }
                      ]}>
                        {payment.status} - AED {payment.amount_paid.toFixed(2)}/{payment.amount_due.toFixed(2)}
                      </Text>
                    </View>
                    {payment.status === PaymentStatus.PAID && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    )}
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Invited Players */}
          {match.invited_player_ids && match.invited_player_ids.length > 0 && (
            <View style={styles.playerGroup}>
              <Text style={styles.playerGroupTitle}>Invited (Pending Response)</Text>
              {match.invited_player_ids
                .filter(pid => !match.confirmed_player_ids?.includes(pid))
                .map((playerId) => {
                  const player = players.find(p => p.id === playerId);
                  return (
                    <Card key={playerId} style={styles.playerCard}>
                      <View style={styles.playerRow}>
                        <View style={styles.playerAvatar}>
                          <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                        </View>
                        <View style={styles.playerInfo}>
                          <Text style={styles.playerName}>{player?.name || 'Player'}</Text>
                          <Text style={styles.playerWaiting}>Waiting for response</Text>
                        </View>
                        <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                      </View>
                    </Card>
                  );
                })}
            </View>
          )}
        </View>

        {/* Captain Actions */}
        {isCaptain && (
          <View style={styles.captainActions}>
            <Button
              title="Ride Coordination"
              onPress={() => router.push({ pathname: '/match/rides', params: { matchId: id } })}
              fullWidth
              variant="outline"
              icon={<Ionicons name="car" size={20} color={COLORS.primary} />}
              style={{ marginBottom: SPACING.sm }}
            />
            <Button
              title="Calculate & Notify Fees"
              onPress={handleCalculateFees}
              loading={actionLoading}
              fullWidth
              variant="outline"
              icon={<Ionicons name="calculator" size={20} color={COLORS.primary} />}
            />
          </View>
        )}

        {/* Player Ride Action */}
        {isConfirmed && !isCaptain && (
          <View style={styles.captainActions}>
            <Button
              title="Ride Coordination"
              onPress={() => router.push({ pathname: '/match/rides', params: { matchId: id } })}
              fullWidth
              variant="outline"
              icon={<Ionicons name="car" size={20} color={COLORS.primary} />}
            />
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
    paddingBottom: SPACING.xxl * 2,
  },
  matchCard: {
    marginBottom: SPACING.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
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
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  inviteCard: {
    backgroundColor: COLORS.secondary + '15',
    borderColor: COLORS.secondary + '30',
    marginBottom: SPACING.md,
  },
  inviteTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inviteText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  inviteButton: {
    flex: 1,
  },
  paymentCard: {
    marginBottom: SPACING.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  paymentTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  paymentBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentDetails: {},
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  paymentLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  paymentValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  costCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  costLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  costValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  perPlayerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  perPlayerValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  playersSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerGroup: {
    marginBottom: SPACING.md,
  },
  playerGroupTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playerCard: {
  captainActionsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: SPACING.sm,
  },
  actionButtonSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: COLORS.success,
  },
  actionButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },

    marginBottom: SPACING.xs,
    padding: SPACING.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  playerPaymentStatus: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  playerWaiting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginTop: 2,
  },
  captainActions: {
    marginTop: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

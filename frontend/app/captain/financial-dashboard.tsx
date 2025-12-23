import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumCard, PremiumButton, StatCard } from '../../src/components/PremiumUI';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';
import { captainAPI, teamAPI, matchAPI, auditAPI } from '../../src/services/api';
import { format } from 'date-fns';

export default function CaptainFinancialDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const teamId = params.team_id as string;
  
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchData = async (tId?: string) => {
    try {
      const teamsRes = await teamAPI.getMyTeams();
      // Filter teams where user is captain
      const captainTeams = teamsRes.data.filter((t: any) => t.captain_id);
      setTeams(captainTeams);
      
      const targetTeamId = tId || teamId || captainTeams[0]?.id;
      if (targetTeamId) {
        const team = captainTeams.find((t: any) => t.id === targetTeamId) || captainTeams[0];
        setSelectedTeam(team);
        
        const [finRes, matchesRes, ledgerRes] = await Promise.all([
          captainAPI.getFinancialSummary(team.id).catch(() => ({ data: null })),
          matchAPI.getTeamMatches(team.id),
          auditAPI.getWalletLedger(),
        ]);
        
        setFinancials(finRes.data);
        setMatches(matchesRes.data.slice(0, 5));
        setLedger(ledgerRes.data.ledger?.slice(0, 10) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
    fetchData(selectedTeam?.id);
  }, [selectedTeam]);

  const handleWithdraw = async () => {
    if (!selectedTeam) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (amount > (selectedTeam.pool_balance || 0)) {
      Alert.alert('Insufficient Balance', 'Amount exceeds team wallet balance');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw AED ${amount} from team wallet to your personal wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: async () => {
            try {
              await captainAPI.withdrawFromTeamWallet(selectedTeam.id, amount);
              Alert.alert('Success', `AED ${amount} withdrawn to your wallet`);
              fetchData(selectedTeam.id);
              setWithdrawAmount('');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to withdraw');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const collectionRate = financials?.collection_rate || 0;

  return (
    <View style={styles.container}>
      <PremiumBackground variant="wallet" />
      <StadiumLights intensity={0.1} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Financial Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {/* Team Selection */}
          {teams.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamSelector}>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => {
                    setSelectedTeam(team);
                    fetchData(team.id);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={selectedTeam?.id === team.id 
                      ? [COLORS.gold + '40', COLORS.gold + '20']
                      : ['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)']}
                    style={[
                      styles.teamChip,
                      selectedTeam?.id === team.id && styles.teamChipSelected
                    ]}
                  >
                    <Ionicons name="shield" size={16} color={selectedTeam?.id === team.id ? COLORS.gold : COLORS.textMuted} />
                    <Text style={[
                      styles.teamChipText,
                      selectedTeam?.id === team.id && { color: COLORS.gold }
                    ]}>{team.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Hero - Collection Summary */}
          <LinearGradient
            colors={[COLORS.gold + '30', COLORS.gold + '05']}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroIconBg}>
                <Ionicons name="cash" size={28} color={COLORS.gold} />
              </View>
              <View style={styles.collectionBadge}>
                <Text style={styles.collectionRate}>{collectionRate.toFixed(0)}%</Text>
                <Text style={styles.collectionLabel}>Collected</Text>
              </View>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Total Collected</Text>
                <Text style={[styles.heroStatValue, { color: COLORS.success }]}>
                  AED {(financials?.total_collected || 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Outstanding</Text>
                <Text style={[styles.heroStatValue, { color: COLORS.warning }]}>
                  AED {(financials?.total_pending || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${collectionRate}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>
                  {financials?.players_paid || 0} paid
                </Text>
                <Text style={styles.progressText}>
                  {financials?.players_pending || 0} pending
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <StatCard
              icon="wallet"
              iconColor={COLORS.primary}
              label="Team Pool"
              value={`${(selectedTeam?.pool_balance || 0).toFixed(0)}`}
              subtitle="AED"
            />
            <StatCard
              icon="receipt"
              iconColor={COLORS.secondary}
              label="Total Due"
              value={`${((financials?.total_due || 0) / 1000).toFixed(1)}K`}
              subtitle="AED"
            />
            <StatCard
              icon="return-down-back"
              iconColor={COLORS.error}
              label="Refunded"
              value={`${(financials?.total_refunded || 0).toFixed(0)}`}
              subtitle="AED"
            />
          </View>

          {/* Team Wallet Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Wallet</Text>
            <PremiumCard variant="glass" style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View>
                  <Text style={styles.walletLabel}>Available Balance</Text>
                  <Text style={styles.walletBalance}>AED {(selectedTeam?.pool_balance || 0).toFixed(2)}</Text>
                </View>
                <View style={[styles.walletIcon, { backgroundColor: COLORS.gold + '20' }]}>
                  <Ionicons name="wallet" size={32} color={COLORS.gold} />
                </View>
              </View>
              
              {selectedTeam?.pool_balance > 0 && (
                <View style={styles.withdrawSection}>
                  <PremiumButton
                    title="Withdraw to Personal Wallet"
                    onPress={handleWithdraw}
                    variant="gold"
                    icon={<Ionicons name="arrow-down-circle" size={18} color="#000" />}
                    fullWidth
                  />
                </View>
              )}
            </PremiumCard>
          </View>

          {/* Recent Matches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Match Financials</Text>
              <TouchableOpacity onPress={() => router.push(`/(tabs)/matches`)}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {matches.length > 0 ? (
              matches.map((match) => {
                const collected = match.player_payments?.reduce((acc: number, p: any) => acc + (p.amount_paid || 0), 0) || 0;
                const due = match.player_payments?.reduce((acc: number, p: any) => acc + (p.amount_due || 0), 0) || 0;
                const rate = due > 0 ? (collected / due) * 100 : 0;
                
                return (
                  <TouchableOpacity 
                    key={match.id} 
                    activeOpacity={0.9}
                    onPress={() => router.push(`/match/${match.id}`)}
                  >
                    <PremiumCard variant="glass" style={styles.matchCard}>
                      <View style={styles.matchHeader}>
                        <View>
                          <Text style={styles.matchTitle}>{match.title}</Text>
                          <Text style={styles.matchDate}>
                            {format(new Date(match.date), 'MMM d, yyyy')}
                          </Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: match.status === 'completed' ? COLORS.success + '20' : COLORS.warning + '20' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: match.status === 'completed' ? COLORS.success : COLORS.warning }
                          ]}>{match.status?.toUpperCase()}</Text>
                        </View>
                      </View>

                      <View style={styles.matchFinancials}>
                        <View style={styles.matchFinItem}>
                          <Text style={styles.matchFinValue}>AED {collected.toFixed(0)}</Text>
                          <Text style={styles.matchFinLabel}>Collected</Text>
                        </View>
                        <View style={styles.matchFinDivider} />
                        <View style={styles.matchFinItem}>
                          <Text style={styles.matchFinValue}>AED {(due - collected).toFixed(0)}</Text>
                          <Text style={styles.matchFinLabel}>Pending</Text>
                        </View>
                        <View style={styles.matchFinDivider} />
                        <View style={styles.matchFinItem}>
                          <Text style={[styles.matchFinValue, { color: COLORS.primary }]}>{rate.toFixed(0)}%</Text>
                          <Text style={styles.matchFinLabel}>Rate</Text>
                        </View>
                      </View>

                      {match.player_payments?.length > 0 && (
                        <View style={styles.playersRow}>
                          <View style={styles.playersDot}>
                            <Text style={styles.playersCount}>
                              {match.player_payments.filter((p: any) => p.status === 'paid').length}/{match.player_payments.length}
                            </Text>
                          </View>
                          <Text style={styles.playersText}>players paid</Text>
                        </View>
                      )}
                    </PremiumCard>
                  </TouchableOpacity>
                );
              })
            ) : (
              <PremiumCard variant="glass" style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No matches yet</Text>
              </PremiumCard>
            )}
          </View>

          {/* Recent Transactions */}
          {ledger.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => router.push('/wallet/transactions')}>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>

              <PremiumCard variant="glass" style={styles.ledgerCard}>
                {ledger.map((entry, index) => (
                  <View key={index} style={[
                    styles.ledgerRow,
                    index < ledger.length - 1 && styles.ledgerRowBorder
                  ]}>
                    <View style={[
                      styles.ledgerIcon,
                      { backgroundColor: entry.credit > 0 ? COLORS.success + '20' : COLORS.error + '20' }
                    ]}>
                      <Ionicons 
                        name={entry.credit > 0 ? 'arrow-down' : 'arrow-up'} 
                        size={16} 
                        color={entry.credit > 0 ? COLORS.success : COLORS.error} 
                      />
                    </View>
                    <View style={styles.ledgerInfo}>
                      <Text style={styles.ledgerDesc} numberOfLines={1}>{entry.description}</Text>
                      <Text style={styles.ledgerDate}>
                        {entry.created_at ? format(new Date(entry.created_at), 'MMM d, h:mm a') : ''}
                      </Text>
                    </View>
                    <View style={styles.ledgerAmount}>
                      <Text style={[
                        styles.ledgerAmountText,
                        { color: entry.credit > 0 ? COLORS.success : COLORS.error }
                      ]}>
                        {entry.credit > 0 ? '+' : '-'}AED {Math.abs(entry.credit || entry.debit || 0).toFixed(0)}
                      </Text>
                      <Text style={styles.ledgerBalance}>Bal: {entry.balance?.toFixed(0)}</Text>
                    </View>
                  </View>
                ))}
              </PremiumCard>
            </View>
          )}

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  teamSelector: {
    marginBottom: SPACING.md,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  teamChipSelected: {
    borderColor: COLORS.gold,
  },
  teamChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  heroIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.cardSolid,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  collectionRate: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  collectionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.glass,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
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
    marginBottom: SPACING.md,
  },
  sectionLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  walletCard: {
    padding: SPACING.md,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  walletBalance: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  walletIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  matchCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  matchTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  matchFinancials: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  matchFinItem: {
    alignItems: 'center',
  },
  matchFinValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  matchFinLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  matchFinDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  playersDot: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  playersCount: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playersText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  ledgerCard: {
    padding: SPACING.md,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  ledgerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ledgerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  ledgerInfo: {
    flex: 1,
  },
  ledgerDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  ledgerDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  ledgerAmount: {
    alignItems: 'flex-end',
  },
  ledgerAmountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  ledgerBalance: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});

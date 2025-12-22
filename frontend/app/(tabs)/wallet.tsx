import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { walletAPI } from '../../src/services/api';
import { WalletTransaction, TransactionType } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { format } from 'date-fns';

export default function WalletScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(transRes.data);
      
      // Update user balance in store
      if (user) {
        setUser({ ...user, wallet_balance: balanceRes.data.balance });
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletData();
  }, []);

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.TOPUP:
        return { name: 'arrow-down-circle', color: COLORS.success };
      case TransactionType.MATCH_PAYMENT:
        return { name: 'baseball-outline', color: COLORS.error };
      case TransactionType.REFUND:
        return { name: 'arrow-undo-circle', color: COLORS.success };
      case TransactionType.GROUND_BOOKING:
        return { name: 'location', color: COLORS.error };
      case TransactionType.WITHDRAWAL:
        return { name: 'arrow-up-circle', color: COLORS.error };
      default:
        return { name: 'swap-horizontal', color: COLORS.textMuted };
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading wallet..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>AED {balance.toFixed(2)}</Text>
          <View style={styles.balanceActions}>
            <Button
              title="Top Up"
              onPress={() => router.push('/wallet/topup')}
              size="md"
              icon={<Ionicons name="add-circle" size={20} color={COLORS.text} />}
              style={styles.topupButton}
            />
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="card" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.quickActionText}>Add Card</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info + '20' }]}>
              <Ionicons name="send" size={24} color={COLORS.info} />
            </View>
            <Text style={styles.quickActionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Ionicons name="receipt" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const iconConfig = getTransactionIcon(transaction.type);
              const isCredit = transaction.amount > 0;
              
              return (
                <Card key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionRow}>
                    <View style={[styles.transactionIcon, { backgroundColor: iconConfig.color + '20' }]}>
                      <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDesc}>{transaction.description}</Text>
                      <Text style={styles.transactionDate}>
                        {format(new Date(transaction.created_at), 'MMM d, h:mm a')}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text style={[styles.amount, { color: isCredit ? COLORS.success : COLORS.error }]}>
                        {isCredit ? '+' : ''}{transaction.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.balanceAfter}>Bal: {transaction.balance_after.toFixed(2)}</Text>
                    </View>
                  </View>
                </Card>
              );
            })
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Top up your wallet to get started</Text>
            </Card>
          )}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderColor: COLORS.primaryDark,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.sm,
  },
  balanceActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  topupButton: {
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.xl,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.lg,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  transactionCard: {
    marginBottom: SPACING.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  balanceAfter: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
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
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});

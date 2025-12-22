import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, LoadingScreen } from '../../src/components';
import { walletAPI, walletExtendedAPI } from '../../src/services/api';
import { WalletTransaction, TransactionType } from '../../src/types';
import { format } from 'date-fns';

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [summary, setSummary] = useState<{ total_credit: number; total_debit: number; net: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await walletExtendedAPI.exportTransactions();
      setTransactions(response.data.transactions);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to simple transactions
      try {
        const fallback = await walletAPI.getTransactions();
        setTransactions(fallback.data);
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.TOPUP:
        return { name: 'add-circle', color: COLORS.success };
      case TransactionType.MATCH_PAYMENT:
        return { name: 'calendar', color: COLORS.primary };
      case TransactionType.REFUND:
        return { name: 'return-down-back', color: COLORS.success };
      case TransactionType.GROUND_BOOKING:
        return { name: 'location', color: COLORS.info };
      case TransactionType.WITHDRAWAL:
        return { name: 'arrow-down-circle', color: COLORS.warning };
      default:
        return { name: 'wallet', color: COLORS.textMuted };
    }
  };

  const renderTransaction = ({ item }: { item: WalletTransaction }) => {
    const icon = getTransactionIcon(item.type);
    const isCredit = item.amount > 0;

    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionRow}>
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name as any} size={20} color={icon.color} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDesc}>{item.description}</Text>
            <Text style={styles.transactionDate}>
              {format(new Date(item.created_at), 'MMM d, yyyy \u2022 h:mm a')}
            </Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amountText,
              { color: isCredit ? COLORS.success : COLORS.error }
            ]}>
              {isCredit ? '+' : ''}AED {Math.abs(item.amount).toFixed(2)}
            </Text>
            <Text style={styles.balanceText}>Bal: {item.balance_after.toFixed(2)}</Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading transactions..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Card */}
      {summary && (
        <View style={styles.summaryContainer}>
          <Card style={[styles.summaryCard, { backgroundColor: COLORS.success + '15' }]}>
            <Ionicons name="arrow-up-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryLabel}>Total Credit</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>
              AED {summary.total_credit.toFixed(0)}
            </Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: COLORS.error + '15' }]}>
            <Ionicons name="arrow-down-circle" size={20} color={COLORS.error} />
            <Text style={styles.summaryLabel}>Total Debit</Text>
            <Text style={[styles.summaryValue, { color: COLORS.error }]}>
              AED {summary.total_debit.toFixed(0)}
            </Text>
          </Card>
        </View>
      )}

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchTransactions(); }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
          </View>
        }
      />
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  summaryValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.md,
  },
  transactionCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
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
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  balanceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

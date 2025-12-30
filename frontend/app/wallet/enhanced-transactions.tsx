import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  fee_breakdown?: {
    platform_fee: number;
    payout_fee: number;
    gateway_fee: number;
    total_fees: number;
    net_amount: number;
  };
}

export default function EnhancedTransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTransactions(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getTransactionIcon = (type: string) => {
    const icons: any = {
      topup: 'arrow-down-circle',
      match_payment: 'football',
      withdrawal: 'arrow-up-circle',
      ground_booking: 'location',
      team_pool: 'people',
      refund: 'refresh-circle',
    };
    return icons[type] || 'cash';
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? '#4ade80' : '#ef4444';
  };

  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.type === filterType);

  const renderTransaction = (txn: Transaction) => {
    const isExpanded = expandedId === txn.id;
    const hasFees = txn.fee_breakdown && txn.fee_breakdown.total_fees > 0;

    return (
      <TouchableOpacity
        key={txn.id}
        style={styles.transactionCard}
        onPress={() => setExpandedId(isExpanded ? null : txn.id)}
        activeOpacity={hasFees ? 0.7 : 1}
      >
        <View style={styles.transactionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: getTransactionColor(txn.amount) + '20' }]}>
            <Ionicons
              name={getTransactionIcon(txn.type) as any}
              size={24}
              color={getTransactionColor(txn.amount)}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>{txn.description}</Text>
            <Text style={styles.transactionDate}>
              {new Date(txn.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            {hasFees && (
              <Text style={styles.feeIndicator}>
                <Ionicons name="information-circle" size={12} /> Tap for fee details
              </Text>
            )}
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: getTransactionColor(txn.amount) }]}>
              {txn.amount > 0 ? '+' : ''}AED {Math.abs(txn.amount).toFixed(2)}
            </Text>
            <Text style={styles.balanceAfter}>Bal: AED {txn.balance_after.toFixed(2)}</Text>
          </View>
        </View>

        {/* Expanded Fee Breakdown */}
        {isExpanded && hasFees && txn.fee_breakdown && (
          <View style={styles.feeBreakdown}>
            <View style={styles.divider} />
            <Text style={styles.feeTitle}>Fee Breakdown</Text>
            
            {txn.fee_breakdown.platform_fee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Platform Fee</Text>
                <Text style={styles.feeValue}>AED {txn.fee_breakdown.platform_fee.toFixed(2)}</Text>
              </View>
            )}
            
            {txn.fee_breakdown.gateway_fee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Gateway Fee</Text>
                <Text style={styles.feeValue}>AED {txn.fee_breakdown.gateway_fee.toFixed(2)}</Text>
              </View>
            )}
            
            {txn.fee_breakdown.payout_fee > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Payout Fee</Text>
                <Text style={styles.feeValue}>AED {txn.fee_breakdown.payout_fee.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={[styles.feeRow, styles.totalFeeRow]}>
              <Text style={styles.totalFeeLabel}>Total Fees</Text>
              <Text style={styles.totalFeeValue}>AED {txn.fee_breakdown.total_fees.toFixed(2)}</Text>
            </View>
            
            <View style={styles.feeRow}>
              <Text style={styles.netAmountLabel}>Net Amount</Text>
              <Text style={styles.netAmountValue}>AED {txn.fee_breakdown.net_amount.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'topup', label: 'Top-ups' },
          { key: 'match_payment', label: 'Match Payments' },
          { key: 'withdrawal', label: 'Withdrawals' },
          { key: 'ground_booking', label: 'Bookings' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, filterType === filter.key && styles.filterChipActive]}
            onPress={() => setFilterType(filter.key)}
          >
            <Text style={[styles.filterText, filterType === filter.key && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#64748b" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
          </View>
        ) : (
          filteredTransactions.map(renderTransaction)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterButton: {
    padding: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: 60,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  feeIndicator: {
    fontSize: 11,
    color: '#4ade80',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceAfter: {
    fontSize: 12,
    color: '#64748b',
  },
  feeBreakdown: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
  feeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  feeLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  feeValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  totalFeeRow: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 8,
    paddingTop: 12,
  },
  totalFeeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  totalFeeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  netAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
  },
  netAmountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
});
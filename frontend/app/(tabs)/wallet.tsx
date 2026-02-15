import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { walletAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { StatusBar } from 'expo-status-bar';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const txnRes = await walletAPI.getTransactions();
      setTransactions(txnRes.data || []);
    } catch (error) { console.error(error); } finally { setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <LinearGradient colors={['#10B981', '#16A34A']} style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#10B981" />}>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/wallet/emoney-topup')}>
            <LinearGradient colors={['#10B981', '#16A34A']} style={styles.actionBtnGradient}>
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>Top Up</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/wallet/payout')}>
            <View style={styles.actionBtnOutline}>
              <Ionicons name="arrow-up" size={24} color="#10B981" />
              <Text style={styles.actionBtnTextOutline}>Withdraw</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/wallet/enhanced-transactions')}>
              <Text style={styles.link}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? transactions.slice(0, 5).map((txn) => (
            <TouchableOpacity key={txn.id} style={styles.txnCard}>
              <View style={[styles.txnIcon, { backgroundColor: txn.amount > 0 ? '#ECFDF5' : '#FEF2F2' }]}>
                <Ionicons name={txn.amount > 0 ? 'arrow-down' : 'arrow-up'} size={20} color={txn.amount > 0 ? '#10B981' : '#EF4444'} />
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnDesc}>{txn.description}</Text>
                <Text style={styles.txnDate}>{new Date(txn.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txnAmount, { color: txn.amount > 0 ? '#10B981' : '#EF4444' }]}>
                {txn.amount > 0 ? '+' : ''}AED {Math.abs(txn.amount).toFixed(2)}
              </Text>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptyText}>Your transaction history will appear here</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  
  balanceCard: { backgroundColor: '#fff', marginHorizontal: 24, marginTop: -20, borderRadius: 20, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginBottom: 8 },
  balanceAmount: { fontSize: 48, fontWeight: '900', color: '#111827', letterSpacing: -2 },

  actionsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginTop: 24, marginBottom: 32 },
  actionBtn: { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  actionBtnGradient: { paddingVertical: 18, alignItems: 'center', gap: 8 },
  actionBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  actionBtnOutline: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#10B981', paddingVertical: 18, alignItems: 'center', gap: 8, borderRadius: 16 },
  actionBtnTextOutline: { fontSize: 15, fontWeight: '800', color: '#10B981' },

  section: { paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  link: { fontSize: 14, color: '#10B981', fontWeight: '700' },

  txnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6', gap: 12 },
  txnIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  txnDate: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  txnAmount: { fontSize: 16, fontWeight: '800' },

  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
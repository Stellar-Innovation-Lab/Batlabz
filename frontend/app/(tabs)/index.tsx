import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI, notificationAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const dashRes = await dashboardAPI.getPlayerDashboard();
      setDashboard(dashRes.data);
      try {
        const notifRes = await notificationAPI.getAll();
        const unread = notifRes.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (e) { setUnreadCount(0); }
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchDashboard(); }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Player'} 🏏</Text>
          </View>
          <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications" size={24} color="#fff" />
            {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />}>
        
        <TouchableOpacity activeOpacity={0.95} onPress={() => router.push('/(tabs)/wallet')} style={styles.walletCardWrapper}>
          <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.walletCard}>
            <View style={styles.walletContent}>
              <View>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
                <View style={styles.walletActions}>
                  <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/wallet/emoney-topup')}>
                    <Ionicons name="add-circle" size={16} color="#fff" />
                    <Text style={styles.walletBtnText}>Top Up</Text>
                  </TouchableOpacity>
                  <View style={styles.walletDivider} />
                  <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/wallet/enhanced-transactions')}>
                    <Ionicons name="receipt" size={16} color="#fff" />
                    <Text style={styles.walletBtnText}>History</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Ionicons name="wallet" size={56} color="rgba(255,255,255,0.2)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, {backgroundColor: '#DBEAFE'}]}>
              <Ionicons name="calendar" size={24} color="#1E3A8A" />
            </View>
            <Text style={styles.statValue}>{dashboard?.total_matches || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, {backgroundColor: '#FEF3C7'}]}>
              <Ionicons name="people" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{dashboard?.total_teams || 0}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, {backgroundColor: '#FEF2F2'}]}>
              <Ionicons name="trophy" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{dashboard?.wins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/match/create')}>
              <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.actionGradient}>
                <Ionicons name="add-circle" size={32} color="#fff" />
                <Text style={styles.actionText}>Create Match</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/players')}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionGradient}>
                <Ionicons name="people" size={32} color="#fff" />
                <Text style={styles.actionText}>Players</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/grounds')}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                <Ionicons name="location" size={32} color="#fff" />
                <Text style={styles.actionText}>Book Ground</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/ai')}>
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                <Ionicons name="sparkles" size={32} color="#fff" />
                <Text style={styles.actionText}>AI Hub</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.link}>View All</Text>
            </TouchableOpacity>
          </View>
          {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
            dashboard.upcoming_matches.slice(0, 3).map((match: any) => (
              <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}`)}>
                <View style={styles.matchHeader}>
                  <View>
                    <Text style={styles.matchTitle}>{match.title}</Text>
                    <Text style={styles.matchDate}>{new Date(match.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <View style={styles.badgeDot} />
                    <Text style={styles.matchStatus}>Upcoming</Text>
                  </View>
                </View>
                <View style={styles.matchInfo}>
                  <Ionicons name="location" size={14} color="#6B7280" />
                  <Text style={styles.matchLocation}>{match.location}</Text>
                  <Text style={styles.matchSeparator}>•</Text>
                  <Ionicons name="people" size={14} color="#6B7280" />
                  <Text style={styles.matchPlayers}>{match.confirmed_player_ids?.length || 0} players</Text>
                </View>
                <View style={styles.matchFooter}>
                  <Text style={styles.matchCost}>AED {match.per_player_cost?.toFixed(2) || '0.00'}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#1E3A8A" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
              <Text style={styles.emptyText}>Create a match to get started</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '600' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: '900', color: '#fff' },
  notifButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E3A8A' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  
  walletCardWrapper: { marginTop: -40, marginHorizontal: 24, marginBottom: 24 },
  walletCard: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 },
  walletContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 8 },
  walletAmount: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 16, letterSpacing: -1 },
  walletActions: { flexDirection: 'row', gap: 12 },
  walletBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, gap: 6 },
  walletBtnText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  walletDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  statIconBg: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },

  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  link: { fontSize: 14, color: '#1E3A8A', fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  actionCard: { width: '48%', aspectRatio: 1.2, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 15, fontWeight: '800', color: '#fff', marginTop: 12 },

  matchCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  matchTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  matchDate: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  matchBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1E3A8A' },
  matchStatus: { fontSize: 12, color: '#1E3A8A', fontWeight: '700' },
  matchInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  matchLocation: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  matchSeparator: { fontSize: 13, color: '#D1D5DB', marginHorizontal: 4 },
  matchPlayers: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  matchCost: { fontSize: 20, fontWeight: '900', color: '#1E3A8A' },

  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
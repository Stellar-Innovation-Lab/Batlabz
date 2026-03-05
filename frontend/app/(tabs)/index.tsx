import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
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

  const formatMatchDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-AE', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Player'} 🏏</Text>
          </View>
          <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications" size={24} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Wallet summary strip inside header */}
        <TouchableOpacity style={styles.walletStrip} onPress={() => router.push('/(tabs)/wallet')} activeOpacity={0.85}>
          <View style={styles.walletStripLeft}>
            <Ionicons name="wallet-outline" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={styles.walletStripLabel}>Wallet</Text>
            <Text style={styles.walletStripAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.walletStripActions}>
            <TouchableOpacity style={styles.walletStripBtn} onPress={() => router.push('/wallet/emoney-topup')}>
              <Ionicons name="add" size={14} color="#1E3A8A" />
              <Text style={styles.walletStripBtnText}>Top Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.walletStripBtn} onPress={() => router.push('/wallet/enhanced-transactions')}>
              <Ionicons name="receipt-outline" size={14} color="#1E3A8A" />
              <Text style={styles.walletStripBtnText}>History</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />}
      >

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { icon: 'calendar', color: '#1E3A8A', bg: '#DBEAFE', value: dashboard?.total_matches || 0, label: 'Matches' },
            { icon: 'people', color: '#F59E0B', bg: '#FEF3C7', value: dashboard?.total_teams || 0, label: 'Teams' },
            { icon: 'trophy', color: '#10B981', bg: '#D1FAE5', value: dashboard?.wins || 0, label: 'Wins' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            {[
              { label: 'Create Match', icon: 'add-circle', colors: ['#1E3A8A', '#1E40AF'] as const, route: '/match/create' },
              { label: 'Join Team', icon: 'people-circle', colors: ['#0EA5E9', '#0284C7'] as const, route: '/team/join' },
              { label: 'Book Ground', icon: 'location', colors: ['#F59E0B', '#D97706'] as const, route: '/(tabs)/grounds' },
              { label: 'AI Hub', icon: 'sparkles', colors: ['#8B5CF6', '#7C3AED'] as const, route: '/ai' },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={styles.actionCard} onPress={() => router.push(action.route as any)} activeOpacity={0.88}>
                <LinearGradient colors={action.colors} style={styles.actionGradient}>
                  <Ionicons name={action.icon as any} size={30} color="#fff" />
                  <Text style={styles.actionText}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.link}>View All</Text>
            </TouchableOpacity>
          </View>

          {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
            dashboard.upcoming_matches.slice(0, 3).map((match: any) => (
              <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}` as any)} activeOpacity={0.92}>
                <View style={styles.matchRow}>
                  <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.matchIconBg}>
                    <Ionicons name="baseball" size={20} color="#fff" />
                  </LinearGradient>
                  <View style={styles.matchMid}>
                    <Text style={styles.matchTitle}>{match.title}</Text>
                    <Text style={styles.matchDate}>{formatMatchDate(match.date)}</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <View style={styles.badgeDot} />
                    <Text style={styles.matchStatus}>Live</Text>
                  </View>
                </View>
                <View style={styles.matchMeta}>
                  <View style={styles.metaChip}>
                    <Ionicons name="location-outline" size={13} color="#64748B" />
                    <Text style={styles.metaText}>{match.location || 'TBD'}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="people-outline" size={13} color="#64748B" />
                    <Text style={styles.metaText}>{match.confirmed_player_ids?.length || 0} players</Text>
                  </View>
                </View>
                <View style={styles.matchFooter}>
                  <Text style={styles.matchCost}>AED {match.per_player_cost?.toFixed(2) || '0.00'} <Text style={styles.matchCostSub}>/ player</Text></Text>
                  <Ionicons name="chevron-forward" size={20} color="#1E3A8A" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
              <Text style={styles.emptyText}>Create a match to get started</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/match/create' as any)}>
                <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.emptyBtnGrad}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.emptyBtnText}>Create Match</Text>
                </LinearGradient>
              </TouchableOpacity>
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

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  notifButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444', borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1E3A8A' },
  badgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },

  walletStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  walletStripLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletStripLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  walletStripAmount: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  walletStripActions: { flexDirection: 'row', gap: 8 },
  walletStripBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  walletStripBtnText: { fontSize: 12, fontWeight: '800', color: '#1E3A8A' },

  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingBottom: 40 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  statIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3, marginBottom: 14 },
  link: { fontSize: 14, color: '#1E3A8A', fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '47.5%', aspectRatio: 1.15, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  actionText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  matchCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  matchIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  matchMid: { flex: 1 },
  matchTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 3 },
  matchDate: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  matchBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  matchStatus: { fontSize: 11, color: '#16A34A', fontWeight: '800' },
  matchMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  matchCost: { fontSize: 18, fontWeight: '900', color: '#1E3A8A' },
  matchCostSub: { fontSize: 12, fontWeight: '500', color: '#94A3B8' },

  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 36, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 14, marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  emptyBtn: { borderRadius: 14, overflow: 'hidden' },
  emptyBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, gap: 6 },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

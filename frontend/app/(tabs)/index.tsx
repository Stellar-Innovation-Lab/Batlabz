import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI, notificationAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerY = useRef(new Animated.Value(-20)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(30)).current;

  const fetchDashboard = async () => {
    try {
      const dashRes = await dashboardAPI.getPlayerDashboard();
      setDashboard(dashRes.data);
      try {
        const notifRes = await notificationAPI.getAll();
        const unread = notifRes.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (e) { setUnreadCount(0); }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    Animated.parallel([
      Animated.spring(headerY, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
      Animated.timing(cardsOpacity, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.spring(statsY, { toValue: 0, tension: 50, friction: 10, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0033A0', '#001F5C']} style={styles.loadingGradient}>
          <View style={styles.loadingBall} />
          <Text style={styles.loadingText}>Loading...</Text>
        </LinearGradient>
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
      <StatusBar style=\"dark\" />
      
      {/* Gradient Header */}
      <Animated.View style={{ transform: [{ translateY: headerY }] }}>
        <LinearGradient colors={['#0033A0', '#001F5C']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Player'} \ud83c\udfcf</Text>
            </View>
            <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/notifications')}>
              <Ionicons name=\"notifications\" size={24} color=\"#fff\" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor=\"#0033A0\" />}>
        
        {/* Wallet Card - Glassmorphism */}
        <Animated.View style={{ opacity: cardsOpacity }}>
          <TouchableOpacity activeOpacity={0.95} onPress={() => router.push('/(tabs)/wallet')}>
            <LinearGradient colors={['#0033A0', '#001F5C']} style={styles.walletCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.walletPattern} />
              <View style={styles.walletContent}>
                <View>
                  <Text style={styles.walletLabel}>Wallet Balance</Text>
                  <Text style={styles.walletAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
                  <View style={styles.walletActions}>
                    <TouchableOpacity style={styles.walletActionBtn} onPress={() => router.push('/wallet/emoney-topup')}>
                      <Ionicons name=\"add-circle\" size={16} color=\"#fff\" />
                      <Text style={styles.walletActionText}>Top Up</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity style={styles.walletActionBtn} onPress={() => router.push('/wallet/enhanced-transactions')}>
                      <Ionicons name=\"receipt\" size={16} color=\"#fff\" />
                      <Text style={styles.walletActionText}>History</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.walletIconBg}>
                  <Ionicons name=\"wallet\" size={48} color=\"rgba(255,255,255,0.15)\" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, { transform: [{ translateY: statsY }] }]}>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <Ionicons name=\"calendar\" size={24} color=\"#0033A0\" />
            </View>
            <Text style={styles.statValue}>{dashboard?.total_matches || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <Ionicons name=\"people\" size={24} color=\"#FF9933\" />
            </View>
            <Text style={styles.statValue}>{dashboard?.total_teams || 0}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <Ionicons name=\"trophy\" size={24} color=\"#FFD700\" />
            </View>
            <Text style={styles.statValue}>{dashboard?.wins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/match/create')}>
              <LinearGradient colors={['#0033A0', '#001F5C']} style={styles.actionGradient}>
                <Ionicons name=\"add-circle\" size={32} color=\"#fff\" />
                <Text style={styles.actionText}>Create Match</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/players')}>
              <LinearGradient colors={['#FF9933', '#FFB366']} style={styles.actionGradient}>
                <Ionicons name=\"people\" size={32} color=\"#fff\" />
                <Text style={styles.actionText}>Players</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/grounds')}>
              <LinearGradient colors={['#4D7FDB', '#6B93E8']} style={styles.actionGradient}>
                <Ionicons name=\"location\" size={32} color=\"#fff\" />
                <Text style={styles.actionText}>Book Ground</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/ai')}>
              <LinearGradient colors={['#10b981', '#34d399']} style={styles.actionGradient}>
                <Ionicons name=\"sparkles\" size={32} color=\"#fff\" />
                <Text style={styles.actionText}>AI Hub</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.sectionLink}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
            dashboard.upcoming_matches.slice(0, 3).map((match: any, index: number) => (
              <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}`)} activeOpacity={0.95}>
                <View style={styles.matchHeader}>
                  <View>
                    <Text style={styles.matchTitle}>{match.title}</Text>
                    <Text style={styles.matchDate}>{new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                  </View>
                  <View style={styles.matchStatusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.matchStatus}>Upcoming</Text>
                  </View>
                </View>
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetail}>
                    <Ionicons name=\"location-outline\" size={16} color=\"#64748B\" />
                    <Text style={styles.matchDetailText}>{match.location}</Text>
                  </View>
                  <View style={styles.matchDetail}>
                    <Ionicons name=\"people-outline\" size={16} color=\"#64748B\" />
                    <Text style={styles.matchDetailText}>{match.confirmed_player_ids?.length || 0} Players</Text>
                  </View>
                </View>
                <View style={styles.matchFooter}>
                  <Text style={styles.matchCost}>AED {match.per_player_cost?.toFixed(2) || '0.00'}</Text>
                  <View style={styles.matchArrow}>
                    <Ionicons name=\"chevron-forward\" size={20} color=\"#0033A0\" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name=\"calendar-outline\" size={48} color=\"#94A3B8\" />
              </View>
              <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
              <Text style={styles.emptyText}>Create a match to get started</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/match/create')}>
                <LinearGradient colors={['#0033A0', '#001F5C']} style={styles.emptyButtonGradient}>
                  <Ionicons name=\"add\" size={20} color=\"#fff\" />
                  <Text style={styles.emptyButtonText}>Create Match</Text>
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
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingBall: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#DC2626', marginBottom: 20 },
  loadingText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  header: { paddingHorizontal: 24, paddingVertical: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#0033A0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: '800', color: '#fff' },
  notifButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FF9933', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0033A0' },
  notifBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  
  walletCard: { marginHorizontal: 24, marginTop: -40, borderRadius: 24, padding: 24, shadowColor: '#0033A0', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12, overflow: 'hidden', position: 'relative', minHeight: 160 },
  walletPattern: { position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' },
  walletContent: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 },
  walletLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 8 },
  walletAmount: { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 16, letterSpacing: -1 },
  walletActions: { flexDirection: 'row', gap: 12 },
  walletActionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  walletActionText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  actionDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
  walletIconBg: { justifyContent: 'center', alignItems: 'center', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 24, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#0033A0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  statIconBg: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(0, 51, 160, 0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textAlign: 'center' },

  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  sectionLink: { fontSize: 14, color: '#0033A0', fontWeight: '700' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  actionCard: { width: (width - 60) / 2, aspectRatio: 1.2, borderRadius: 20, overflow: 'hidden', shadowColor: '#0033A0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 },
  actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  actionText: { fontSize: 15, fontWeight: '800', color: '#fff', marginTop: 12, letterSpacing: 0.3 },

  matchCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 12, shadowColor: '#0033A0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  matchTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  matchDate: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  matchStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 51, 160, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0033A0', marginRight: 6 },
  matchStatus: { fontSize: 12, color: '#0033A0', fontWeight: '700' },
  matchDetails: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  matchDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  matchDetailText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  matchCost: { fontSize: 20, fontWeight: '900', color: '#0033A0' },
  matchArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0, 51, 160, 0.08)', justifyContent: 'center', alignItems: 'center' },

  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748B', marginBottom: 24, textAlign: 'center' },
  emptyButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#0033A0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 8 },
  emptyButtonText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

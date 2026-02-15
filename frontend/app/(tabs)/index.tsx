import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Animated, Easing, Dimensions } from 'react-native';
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

  const headerScale = useRef(new Animated.Value(0.95)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(30)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.6)).current;

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

  useEffect(() => {
    fetchDashboard();
    
    Animated.spring(headerScale, { toValue: 1, tension: 40, friction: 10, delay: 100, useNativeDriver: true }).start();
    Animated.parallel([
      Animated.timing(statsOpacity, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }),
      Animated.spring(statsY, { toValue: 0, tension: 50, friction: 10, delay: 300, useNativeDriver: true }),
      Animated.timing(cardsOpacity, { toValue: 1, duration: 800, delay: 500, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.6, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchDashboard(); }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
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
      <StatusBar style="light" />
      
      <Animated.View style={{ transform: [{ scale: headerScale }] }}>
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.heroSection} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Animated.View style={[styles.heroGlow, { opacity: glowPulse }]} />
          <View style={styles.heroPattern} />
          
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Player'} \ud83c\udfcf</Text>
            </View>
            <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.heroWallet}>
            <View style={styles.walletIconCircle}>
              <Ionicons name="wallet" size={28} color="#fff" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Total Balance</Text>
              <Text style={styles.walletAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.walletAction} onPress={() => router.push('/wallet/emoney-topup')}>
              <Ionicons name="add-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}>
        
        <Animated.View style={[styles.statsGrid, { opacity: statsOpacity, transform: [{ translateY: statsY }] }]}>
          {[
            { icon: 'trophy', label: 'Matches', value: dashboard?.total_matches || 0, color: '#10B981', bg: '#ECFDF5' },
            { icon: 'people', label: 'Teams', value: dashboard?.total_teams || 0, color: '#F59E0B', bg: '#FEF3C7' },
            { icon: 'flame', label: 'Win Rate', value: '75%', color: '#EF4444', bg: '#FEE2E2' },
            { icon: 'star', label: 'Rating', value: '4.8', color: '#8B5CF6', bg: '#F3E8FF' },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={{ opacity: cardsOpacity }}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <Text style={styles.sectionSubtitle}>Get started quickly</Text>
              </View>
            </View>
            
            <View style={styles.actionsGrid}>
              {[
                { icon: 'add-circle', title: 'Create Match', subtitle: 'Organize game', gradient: ['#10B981', '#059669'], route: '/match/create' },
                { icon: 'people', title: 'Players', subtitle: 'Browse & invite', gradient: ['#3B82F6', '#2563EB'], route: '/players' },
                { icon: 'location', title: 'Grounds', subtitle: 'Book venue', gradient: ['#F59E0B', '#D97706'], route: '/(tabs)/grounds' },
                { icon: 'sparkles', title: 'AI Hub', subtitle: 'Smart features', gradient: ['#8B5CF6', '#7C3AED'], route: '/ai' },
              ].map((action, i) => (
                <TouchableOpacity key={i} style={styles.actionCard} onPress={() => router.push(action.route as any)} activeOpacity={0.9}>
                  <LinearGradient colors={action.gradient} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.actionIconCircle}>
                      <Ionicons name={action.icon as any} size={28} color="#fff" />
                    </View>
                    <View style={styles.actionInfo}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Upcoming Matches</Text>
                <Text style={styles.sectionSubtitle}>{dashboard?.upcoming_matches?.length || 0} matches scheduled</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
                <Text style={styles.link}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
              dashboard.upcoming_matches.slice(0, 3).map((match: any, idx: number) => (
                <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}`)} activeOpacity={0.95}>
                  <View style={styles.matchLeft}>
                    <View style={styles.matchIconBg}>
                      <Ionicons name="baseball" size={20} color="#10B981" />
                    </View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchTitle}>{match.title}</Text>
                      <View style={styles.matchMeta}>
                        <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.matchDate}>{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        <Text style={styles.matchSeparator}>•</Text>
                        <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.matchTime}>{new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                      <View style={styles.matchDetails}>
                        <View style={styles.matchDetailItem}>
                          <Ionicons name="location" size={12} color="#6B7280" />
                          <Text style={styles.matchDetailText}>{match.location}</Text>
                        </View>
                        <View style={styles.matchDetailItem}>
                          <Ionicons name="people" size={12} color="#6B7280" />
                          <Text style={styles.matchDetailText}>{match.confirmed_player_ids?.length || 0}/{match.player_limit || 22}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.matchRight}>
                    <View style={styles.matchPriceBox}>
                      <Text style={styles.matchPrice}>AED {match.per_player_cost?.toFixed(0) || '0'}</Text>
                      <Text style={styles.matchPriceLabel}>per player</Text>
                    </View>
                    <View style={styles.matchStatus}>
                      <View style={styles.statusDot} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Ionicons name="calendar-outline" size={48} color="#10B981" />
                </View>
                <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
                <Text style={styles.emptyText}>Create your first match and start playing!</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/match/create')}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.emptyButtonGradient}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.emptyButtonText}>Create Match</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '600' },
  
  heroSection: { paddingTop: 20, paddingBottom: 120, position: 'relative', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroPattern: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.05)' },
  
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, marginBottom: 32 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  userName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  notifButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  notifBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#10B981' },
  notifBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  
  heroWallet: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 24, borderRadius: 20, paddingVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  walletIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  walletInfo: { flex: 1 },
  walletLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: 4 },
  walletAmount: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  walletAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  scrollView: { flex: 1, marginTop: -80 },
  scrollContent: { paddingBottom: 32 },
  
  statsGrid: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 32, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  statIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  link: { fontSize: 14, color: '#10B981', fontWeight: '700', marginTop: 4 },
  
  actionsGrid: { gap: 12 },
  actionCard: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, marginBottom: 12 },
  actionGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  actionIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 3 },
  actionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  
  matchCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  matchLeft: { flex: 1, flexDirection: 'row' },
  matchIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  matchInfo: { flex: 1 },
  matchTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  matchMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  matchDate: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  matchSeparator: { fontSize: 12, color: '#D1D5DB' },
  matchTime: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  matchDetails: { flexDirection: 'row', gap: 16 },
  matchDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matchDetailText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  matchRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  matchPriceBox: { alignItems: 'flex-end' },
  matchPrice: { fontSize: 20, fontWeight: '900', color: '#10B981', letterSpacing: -0.5 },
  matchPriceLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  matchStatus: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  
  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 48, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  emptyButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12 },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 28, gap: 8 },
  emptyButtonText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

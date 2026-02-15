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

  // Multiple animation refs for complex choreography
  const heroScale = useRef(new Animated.Value(0.92)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const walletY = useRef(new Animated.Value(50)).current;
  const statsY = useRef(new Animated.Value(40)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(30)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  const glowScale = useRef(new Animated.Value(0.9)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  const fetchDashboard = async () => {
    try {
      const dashRes = await dashboardAPI.getPlayerDashboard();
      setDashboard(dashRes.data);
      try {
        const notifRes = await notificationAPI.getAll();
        setUnreadCount(notifRes.data.filter((n: any) => !n.is_read).length);
      } catch (e) { setUnreadCount(0); }
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchDashboard();
    
    // Choreographed entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(heroScale, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(walletY, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
        Animated.spring(statsY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
        Animated.timing(statsOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),\n      Animated.parallel([
        Animated.spring(cardsY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
        Animated.timing(cardsOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous animations
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(glowPulse, { toValue: 0.8, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1.1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(glowPulse, { toValue: 0.4, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 0.9, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ])).start();

    // Shimmer effect
    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchDashboard(); }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBall} />
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

  const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style=\"light\" />
      
      {/* Epic Hero Section */}
      <Animated.View style={{ opacity: heroOpacity, transform: [{ scale: heroScale }] }}>
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.heroSection} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {/* Multiple animated glows */}
          <Animated.View style={[styles.glow1, { opacity: glowPulse, transform: [{ scale: glowScale }] }]} />
          <Animated.View style={[styles.glow2, { opacity: glowPulse.interpolate({ inputRange: [0.4, 0.8], outputRange: [0.2, 0.5] }) }]} />
          
          {/* Shimmer effect */}
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
          
          {/* Stadium lights pattern */}
          <View style={styles.lightsPattern}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.light, { left: `${i * 25}%` }]} />
            ))}
          </View>

          {/* Header */}
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greeting}>{greeting()} \ud83d\udc4b</Text>
              <Text style={styles.userName}>{user?.name || 'Player'}</Text>
              <View style={styles.streakBadge}>
                <Ionicons name=\"flame\" size={14} color=\"#FF6B00\" />
                <Text style={styles.streakText}>5 day streak</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/wallet/enhanced-transactions')}>
                <Ionicons name=\"receipt-outline\" size={22} color=\"#fff\" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
                <Ionicons name=\"notifications-outline\" size={22} color=\"#fff\" />
                {unreadCount > 0 && <View style={styles.redDot}><Text style={styles.redDotText}>{unreadCount}</Text></View>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Mega Wallet Card */}
          <Animated.View style={[styles.megaWallet, { transform: [{ translateY: walletY }] }]}>
            <View style={styles.walletTop}>
              <View style={styles.walletIcon}>
                <Ionicons name=\"wallet\" size={32} color=\"#fff\" />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Available Balance</Text>
                <Text style={styles.walletAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.walletActions}>
              <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/wallet/emoney-topup')}>
                <Ionicons name=\"add-circle\" size={18} color=\"#fff\" />
                <Text style={styles.walletBtnText}>Top Up</Text>
              </TouchableOpacity>
              <View style={styles.walletDivider} />
              <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/(tabs)/wallet')}>
                <Ionicons name=\"stats-chart\" size={18} color=\"#fff\" />
                <Text style={styles.walletBtnText}>Details</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor=\"#10B981\" />}>
        
        {/* Performance Stats */}
        <Animated.View style={[styles.statsSection, { opacity: statsOpacity, transform: [{ translateY: statsY }] }]}>
          <View style={styles.statsGrid}>
            {[
              { icon: 'trophy', label: 'Matches', value: dashboard?.total_matches || 0, color: '#10B981', bg: '#ECFDF5' },
              { icon: 'people', label: 'Teams', value: dashboard?.total_teams || 0, color: '#F59E0B', bg: '#FEF3C7' },
              { icon: 'flame', label: 'Win Rate', value: '75%', color: '#EF4444', bg: '#FEE2E2' },
              { icon: 'star', label: 'Rating', value: '4.8', color: '#8B5CF6', bg: '#F3E8FF' },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                  <Ionicons name={stat.icon as any} size={26} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {i === 2 && <View style={styles.trendBadge}><Ionicons name=\"trending-up\" size={10} color=\"#10B981\" /><Text style={styles.trendText}>+12%</Text></View>}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.section, { opacity: cardsOpacity, transform: [{ translateY: cardsY }] }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionSubtitle}>Get started in seconds</Text>
            </View>
          </View>
          
          <View style={styles.actionsWrap}>
            {[
              { icon: 'add-circle-outline', title: 'Create Match', subtitle: 'Organize a game', gradient: ['#10B981', '#059669'], route: '/match/create' },
              { icon: 'people-outline', title: 'Find Players', subtitle: 'Browse & invite', gradient: ['#3B82F6', '#2563EB'], route: '/players' },
              { icon: 'location-outline', title: 'Book Ground', subtitle: 'Reserve venue', gradient: ['#F59E0B', '#D97706'], route: '/(tabs)/grounds' },
              { icon: 'sparkles-outline', title: 'AI Features', subtitle: 'Smart tools', gradient: ['#8B5CF6', '#7C3AED'], route: '/ai' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionCard} onPress={() => router.push(action.route as any)} activeOpacity={0.92}>
                <LinearGradient colors={action.gradient} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.actionPattern} />
                  <View style={styles.actionContent}>
                    <View style={styles.actionIconCircle}>
                      <Ionicons name={action.icon as any} size={28} color=\"#fff\" />
                    </View>
                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    </View>
                    <View style={styles.actionArrow}>
                      <Ionicons name=\"arrow-forward\" size={20} color=\"#fff\" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Upcoming Matches - Premium Cards */}
        <Animated.View style={[styles.section, { opacity: cardsOpacity }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Upcoming Matches</Text>
              <Text style={styles.sectionSubtitle}>{dashboard?.upcoming_matches?.length || 0} games scheduled</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
              <View style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name=\"chevron-forward\" size={16} color=\"#10B981\" />
              </View>
            </TouchableOpacity>
          </View>
          
          {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
            dashboard.upcoming_matches.slice(0, 3).map((match: any, idx: number) => (
              <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}`)} activeOpacity={0.96}>
                <View style={styles.matchCardInner}>
                  <View style={styles.matchLeft}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.matchIconBg}>
                      <Ionicons name=\"baseball\" size={22} color=\"#fff\" />
                    </LinearGradient>
                    <View style={styles.matchMainInfo}>
                      <View style={styles.matchTitleRow}>
                        <Text style={styles.matchTitle}>{match.title}</Text>
                        <View style={styles.liveIndicator}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>Upcoming</Text>
                        </View>
                      </View>
                      <View style={styles.matchMetaRow}>
                        <View style={styles.metaItem}>
                          <Ionicons name=\"calendar\" size={13} color=\"#9CA3AF\" />
                          <Text style={styles.metaText}>{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </View>
                        <View style={styles.metaDot} />
                        <View style={styles.metaItem}>
                          <Ionicons name=\"time\" size={13} color=\"#9CA3AF\" />
                          <Text style={styles.metaText}>{new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                      </View>
                      <View style={styles.matchDetailsRow}>
                        <View style={styles.detailChip}>
                          <Ionicons name=\"location\" size={12} color=\"#6B7280\" />
                          <Text style={styles.chipText}>{match.location}</Text>
                        </View>
                        <View style={styles.detailChip}>
                          <Ionicons name=\"people\" size={12} color=\"#6B7280\" />
                          <Text style={styles.chipText}>{match.confirmed_player_ids?.length || 0} Players</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.matchRight}>
                    <View style={styles.priceTag}>
                      <Text style={styles.priceAmount}>{match.per_player_cost?.toFixed(0) || '0'}</Text>
                      <Text style={styles.priceCurrency}>AED</Text>
                    </View>
                    <View style={styles.playersProgress}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((match.confirmed_player_ids?.length || 0) / (match.player_limit || 22)) * 100}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{match.confirmed_player_ids?.length || 0}/{match.player_limit || 22}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.emptyIconBg}>
                <Ionicons name=\"calendar\" size={56} color=\"#10B981\" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
              <Text style={styles.emptyText}>Create your first match and gather your team!</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/match/create')}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.emptyButtonGradient}>
                  <Ionicons name=\"add\" size={22} color=\"#fff\" />
                  <Text style={styles.emptyButtonText}>Create Match Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  loadingBall: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#10B981', marginBottom: 20 },
  loadingText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  
  heroSection: { paddingTop: 24, paddingBottom: 140, position: 'relative', overflow: 'hidden' },
  glow1: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.15)' },
  glow2: { position: 'absolute', bottom: 20, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.1)' },
  shimmer: { position: 'absolute', top: 0, width: 100, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)', transform: [{ skewX: '-20deg' }] },
  lightsPattern: { position: 'absolute', top: 0, width: '100%', height: 8, flexDirection: 'row' },
  light: { position: 'absolute', width: 2, height: '100%', backgroundColor: 'rgba(255,255,255,0.2)' },
  
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 28 },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  userName: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, alignSelf: 'flex-start', gap: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  streakText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', position: 'relative' },
  redDot: { position: 'absolute', top: 6, right: 6, backgroundColor: '#EF4444', borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#10B981' },
  redDotText: { fontSize: 9, fontWeight: '900', color: '#fff' },
  
  megaWallet: { marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  walletTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  walletIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  walletInfo: { flex: 1 },
  walletLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  walletAmount: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  walletActions: { flexDirection: 'row', gap: 12 },
  walletBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 14, borderRadius: 16, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  walletBtnText: { fontSize: 14, color: '#fff', fontWeight: '800' },
  walletDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
  
  scrollView: { flex: 1, marginTop: -100 },
  scrollContent: { paddingTop: 20, paddingBottom: 32 },
  
  statsSection: { marginBottom: 28 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', position: 'relative' },
  statIconBg: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 26, fontWeight: '900', color: '#111827', marginBottom: 4, letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  trendBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, gap: 3 },
  trendText: { fontSize: 9, color: '#10B981', fontWeight: '800' },
  
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 4 },
  viewAllText: { fontSize: 13, color: '#10B981', fontWeight: '800' },
  
  actionsWrap: { gap: 12 },
  actionCard: { borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
  actionGradient: { padding: 20, position: 'relative', overflow: 'hidden' },
  actionPattern: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  actionContent: { flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  actionIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: -0.3 },
  actionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  actionArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  
  matchCard: { backgroundColor: '#fff', borderRadius: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  matchCardInner: { padding: 20 },
  matchLeft: { flexDirection: 'row', marginBottom: 16 },
  matchIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 14, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  matchMainInfo: { flex: 1 },
  matchTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  matchTitle: { fontSize: 17, fontWeight: '800', color: '#111827', flex: 1, marginRight: 12 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  liveText: { fontSize: 11, color: '#10B981', fontWeight: '800', letterSpacing: 0.3 },
  matchMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },
  matchDetailsRow: { flexDirection: 'row', gap: 10 },
  detailChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 5, borderWidth: 1, borderColor: '#F3F4F6' },
  chipText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  matchRight: { alignItems: 'flex-end' },
  priceTag: { backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D1FAE5' },
  priceAmount: { fontSize: 22, fontWeight: '900', color: '#10B981', letterSpacing: -0.5 },
  priceCurrency: { fontSize: 11, color: '#059669', fontWeight: '700', letterSpacing: 0.5 },
  playersProgress: { alignItems: 'flex-end' },
  progressBar: { width: 80, height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#9CA3AF', fontWeight: '700' },
  
  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 48, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyIconBg: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 28, lineHeight: 22, paddingHorizontal: 20 },
  emptyButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14 },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, gap: 10 },
  emptyButtonText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI, notificationAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Multiple sophisticated animations
  const heroScale = useRef(new Animated.Value(0.95)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const walletY = useRef(new Animated.Value(60)).current;
  const statsY = useRef(new Animated.Value(40)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const cardsStagger = [
    useRef(new Animated.Value(50)).current,
    useRef(new Animated.Value(50)).current,
    useRef(new Animated.Value(50)).current,
    useRef(new Animated.Value(50)).current,
  ];
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

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
    
    // Entrance choreography\n    Animated.sequence([
      Animated.parallel([
        Animated.spring(heroScale, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(walletY, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
        Animated.spring(statsY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
        Animated.timing(statsOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      ...cardsStagger.map((anim, i) => 
        Animated.spring(anim, { toValue: 0, tension: 50, friction: 12, delay: i * 100, useNativeDriver: true })
      ),
    ]).start();

    // Continuous animations
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 0.8, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.4, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })).start();

    Animated.loop(Animated.sequence([
      Animated.timing(float1, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(float1, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(float2, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(float2, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchDashboard(); }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.loadingGradient}>
          <View style={styles.loadingCircle} />
          <Text style={styles.loadingText}>Loading your cricket world...</Text>
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

  const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });
  const float1Y = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
  const float2Y = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style=\"light\" />
      
      {/* Ultra Premium Hero */}
      <Animated.View style={{ opacity: heroOpacity, transform: [{ scale: heroScale }] }}>
        <LinearGradient colors={['#1E3A8A', '#1E40AF', '#2563EB']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {/* Complex background layers */}
          <Animated.View style={[styles.bgShape1, { transform: [{ translateY: float1Y }] }]} />
          <Animated.View style={[styles.bgShape2, { transform: [{ translateY: float2Y }] }]} />
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />
          <Animated.View style={[styles.shimmerEffect, { transform: [{ translateX: shimmerTranslate }] }]} />
          <View style={styles.meshOverlay} />
          
          {/* Header */}
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greeting}>{greeting()} \ud83d\udc4b</Text>
              <Text style={styles.userName}>{user?.name || 'Player'}</Text>
              <View style={styles.streakBadge}>
                <Ionicons name=\"flame\" size={14} color=\"#F59E0B\" />
                <Text style={styles.streakText}>7 day streak</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/wallet/enhanced-transactions')}>
                <Ionicons name=\"receipt-outline\" size={22} color=\"#fff\" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
                <Ionicons name=\"notifications-outline\" size={22} color=\"#fff\" />
                {unreadCount > 0 && <View style={styles.notifDot}><Text style={styles.notifDotText}>{unreadCount}</Text></View>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Mega Wallet Card */}
          <Animated.View style={[styles.walletWrapper, { transform: [{ translateY: walletY }] }]}>
            <Animated.View style={[styles.walletGlow, { opacity: glowPulse }]} />
            <View style={styles.walletCard}>
              <View style={styles.walletPattern1} />
              <View style={styles.walletPattern2} />
              <View style={styles.walletTop}>
                <View style={styles.walletIconCircle}>
                  <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.walletIconBg}>
                    <Ionicons name=\"wallet\" size={32} color=\"#fff\" />
                  </LinearGradient>
                </View>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletLabel}>TOTAL BALANCE</Text>
                  <Text style={styles.walletAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.walletActions}>
                <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/wallet/emoney-topup')}>
                  <View style={styles.walletBtnIcon}>
                    <Ionicons name=\"add\" size={20} color=\"#1E3A8A\" />
                  </View>
                  <Text style={styles.walletBtnText}>Top Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/(tabs)/wallet')}>
                  <View style={styles.walletBtnIcon}>
                    <Ionicons name=\"stats-chart\" size={20} color=\"#1E3A8A\" />
                  </View>
                  <Text style={styles.walletBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor=\"#1E3A8A\" />}>
        
        {/* Premium Stats Grid */}
        <Animated.View style={[styles.statsSection, { opacity: statsOpacity, transform: [{ translateY: statsY }] }]}>
          <View style={styles.statsGrid}>
            {[
              { icon: 'trophy', label: 'Matches', value: dashboard?.total_matches || 0, color: '#1E3A8A', bg: '#DBEAFE', trend: '+12%', trendUp: true },
              { icon: 'people', label: 'Teams', value: dashboard?.total_teams || 0, color: '#F59E0B', bg: '#FEF3C7', trend: null, trendUp: null },
              { icon: 'flame', label: 'Win Rate', value: '75%', color: '#EF4444', bg: '#FEE2E2', trend: '+8%', trendUp: true },
              { icon: 'star', label: 'Rating', value: '4.9', color: '#8B5CF6', bg: '#F3E8FF', trend: null, trendUp: null },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                  <Ionicons name={stat.icon as any} size={28} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {stat.trend && (
                  <View style={styles.trendBadge}>
                    <Ionicons name=\"trending-up\" size={10} color=\"#059669\" />
                    <Text style={styles.trendText}>{stat.trend}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions - Premium Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionSubtitle}>Get started instantly</Text>
            </View>
          </View>
          
          {[
            { icon: 'add-circle-outline', title: 'Create Match', subtitle: 'Organize a game', gradient: ['#1E3A8A', '#1E40AF'], iconColor: '#fff', route: '/match/create' },
            { icon: 'people-outline', title: 'Find Players', subtitle: 'Browse & invite', gradient: ['#3B82F6', '#2563EB'], iconColor: '#fff', route: '/players' },
            { icon: 'location-outline', title: 'Book Ground', subtitle: 'Reserve venue', gradient: ['#F59E0B', '#D97706'], iconColor: '#fff', route: '/(tabs)/grounds' },
            { icon: 'sparkles-outline', title: 'AI Features', subtitle: 'Smart tools', gradient: ['#8B5CF6', '#7C3AED'], iconColor: '#fff', route: '/ai' },
          ].map((action, i) => (
            <Animated.View key={i} style={{ transform: [{ translateY: cardsStagger[i] }] }}>
              <TouchableOpacity style={styles.actionCard} onPress={() => router.push(action.route as any)} activeOpacity={0.92}>
                <LinearGradient colors={action.gradient} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.actionPattern} />
                  <View style={styles.actionShine} />
                  <View style={styles.actionContent}>
                    <View style={styles.actionIconCircle}>
                      <Ionicons name={action.icon as any} size={32} color={action.iconColor} />
                    </View>
                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    </View>
                    <View style={styles.actionArrow}>
                      <Ionicons name=\"arrow-forward\" size={22} color=\"rgba(255,255,255,0.9)\" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Upcoming Matches - Ultra Premium */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Upcoming Matches</Text>
              <Text style={styles.sectionSubtitle}>{dashboard?.upcoming_matches?.length || 0} games scheduled</Text>
            </View>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name=\"chevron-forward\" size={16} color=\"#1E3A8A\" />
            </TouchableOpacity>
          </View>
          
          {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
            dashboard.upcoming_matches.slice(0, 3).map((match: any, idx: number) => (
              <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}`)} activeOpacity={0.96}>
                <View style={styles.matchAccentBar} />
                <View style={styles.matchCardInner}>
                  <View style={styles.matchTop}>
                    <View style={styles.matchIconWrapper}>
                      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.matchIconBg}>
                        <Ionicons name=\"baseball\" size={24} color=\"#fff\" />
                      </LinearGradient>
                    </View>
                    <View style={styles.matchMainInfo}>
                      <View style={styles.matchTitleRow}>
                        <Text style={styles.matchTitle}>{match.title}</Text>
                        <View style={styles.liveIndicator}>
                          <View style={styles.livePulse} />
                          <Text style={styles.liveText}>Upcoming</Text>
                        </View>
                      </View>
                      <View style={styles.matchMetaRow}>
                        <View style={styles.metaItem}>
                          <Ionicons name=\"calendar\" size={14} color=\"#94A3B8\" />
                          <Text style={styles.metaText}>{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaItem}>
                          <Ionicons name=\"time\" size={14} color=\"#94A3B8\" />
                          <Text style={styles.metaText}>{new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                      </View>
                      <View style={styles.matchChips}>
                        <View style={styles.chip}>
                          <Ionicons name=\"location\" size={12} color=\"#64748B\" />
                          <Text style={styles.chipText}>{match.location}</Text>
                        </View>
                        <View style={styles.chip}>
                          <Ionicons name=\"people\" size={12} color=\"#64748B\" />
                          <Text style={styles.chipText}>{match.confirmed_player_ids?.length || 0} Players</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.matchBottom}>
                    <View style={styles.priceBox}>
                      <Text style={styles.priceLabel}>Per Player</Text>
                      <Text style={styles.priceAmount}>AED {match.per_player_cost?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((match.confirmed_player_ids?.length || 0) / (match.player_limit || 22)) * 100}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{match.confirmed_player_ids?.length || 0}/{match.player_limit || 22} confirmed</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#DBEAFE', '#BFDBFE']} style={styles.emptyIconBg}>
                <Ionicons name=\"calendar\" size={64} color=\"#1E3A8A\" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
              <Text style={styles.emptyText}>Create your first match and start the excitement!</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/match/create')}>
                <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.emptyButtonGradient}>
                  <Ionicons name=\"add\" size={24} color=\"#fff\" />
                  <Text style={styles.emptyButtonText}>Create Match Now</Text>
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
  loadingCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 24, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  loadingText: { fontSize: 17, color: '#fff', fontWeight: '600' },
  
  hero: { paddingTop: 24, paddingBottom: 140, position: 'relative', overflow: 'hidden' },
  bgShape1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(245, 158, 11, 0.12)', top: -60, right: -60 },
  bgShape2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(59, 130, 246, 0.1)', bottom: 40, left: -50 },
  bgCircle1: { position: 'absolute', width: 500, height: 500, borderRadius: 250, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', top: -250, right: -150 },
  bgCircle2: { position: 'absolute', width: 400, height: 400, borderRadius: 200, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', bottom: -150, left: -100 },
  shimmerEffect: { position: 'absolute', top: 0, width: 150, height: '100%', backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ skewX: '-20deg' }] },
  meshOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.02)' },
  
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 32, zIndex: 2 },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  userName: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1.5, marginBottom: 10 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, alignSelf: 'flex-start', gap: 6, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  streakText: { fontSize: 12, color: '#FCD34D', fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', position: 'relative' },
  notifDot: { position: 'absolute', top: 6, right: 6, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#1E3A8A' },
  notifDotText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  
  walletWrapper: { marginHorizontal: 24, position: 'relative', zIndex: 2 },
  walletGlow: { position: 'absolute', width: '105%', height: '105%', backgroundColor: '#F59E0B', opacity: 0.2, borderRadius: 28, left: '-2.5%', top: '-2.5%', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24 },
  walletCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.12, shadowRadius: 32, borderWidth: 1, borderColor: '#F3F4F6' },
  walletPattern1: { position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: '#DBEAFE', opacity: 0.3 },
  walletPattern2: { position: 'absolute', left: -30, bottom: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: '#FEF3C7', opacity: 0.25 },
  walletTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, zIndex: 1 },
  walletIconCircle: { marginRight: 16 },
  walletIconBg: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  walletInfo: { flex: 1 },
  walletLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 8, letterSpacing: 1.5 },
  walletAmount: { fontSize: 40, fontWeight: '900', color: '#0F172A', letterSpacing: -2 },
  walletActions: { flexDirection: 'row', gap: 12, zIndex: 1 },
  walletBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DBEAFE', paddingVertical: 14, borderRadius: 16, gap: 8, borderWidth: 1.5, borderColor: '#93C5FD' },
  walletBtnIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  walletBtnText: { fontSize: 15, color: '#1E3A8A', fontWeight: '800', letterSpacing: 0.3 },
  
  scrollView: { flex: 1, marginTop: -100 },
  scrollContent: { paddingTop: 20, paddingBottom: 32 },
  
  statsSection: { marginBottom: 32 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', position: 'relative' },
  statIconBg: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 4, letterSpacing: -1 },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  trendBadge: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, gap: 3 },
  trendText: { fontSize: 9, color: '#059669', fontWeight: '900' },
  
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sectionTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A', letterSpacing: -1, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, gap: 6, borderWidth: 1, borderColor: '#93C5FD' },
  viewAllText: { fontSize: 14, color: '#1E3A8A', fontWeight: '800' },
  
  actionCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  actionGradient: { padding: 24, position: 'relative', overflow: 'hidden' },
  actionPattern: { position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' },
  actionShine: { position: 'absolute', top: 0, left: -100, width: 100, height: '100%', backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ skewX: '-25deg' }] },
  actionContent: { flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  actionIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 19, fontWeight: '900', color: '#fff', marginBottom: 5, letterSpacing: -0.5 },
  actionSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  actionArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  
  matchCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  matchAccentBar: { height: 6, backgroundColor: '#1E3A8A' },
  matchCardInner: { padding: 24 },
  matchTop: { marginBottom: 20 },
  matchIconWrapper: { marginBottom: 16 },
  matchIconBg: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start', shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  matchMainInfo: {},
  matchTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  matchTitle: { fontSize: 19, fontWeight: '900', color: '#0F172A', flex: 1, marginRight: 12, letterSpacing: -0.5 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, gap: 6 },
  livePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#059669' },
  liveText: { fontSize: 12, color: '#059669', fontWeight: '800', letterSpacing: 0.5 },
  matchMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
  matchChips: { flexDirection: 'row', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  matchBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTopWidth: 1.5, borderTopColor: '#F1F5F9' },
  priceBox: {},
  priceLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  priceAmount: { fontSize: 24, fontWeight: '900', color: '#1E3A8A', letterSpacing: -1 },
  progressContainer: { alignItems: 'flex-end' },
  progressBar: { width: 100, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  progressFill: { height: '100%', backgroundColor: '#1E3A8A', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  
  emptyState: { backgroundColor: '#fff', borderRadius: 24, padding: 56, alignItems: 'center', borderWidth: 2.5, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyIconBg: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 28, shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 12, letterSpacing: -0.5 },
  emptyText: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 24, paddingHorizontal: 20, fontWeight: '500' },
  emptyButton: { borderRadius: 18, overflow: 'hidden', shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16 },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 36, gap: 12 },
  emptyButtonText: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
});

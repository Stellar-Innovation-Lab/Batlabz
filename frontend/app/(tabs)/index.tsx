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

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

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

  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Hero section with animated backgrounds */}
      <LinearGradient colors={['#1E3A8A', '#1E40AF', '#2563EB']} style={styles.heroSection}>
        {/* Animated background elements */}
        <Animated.View style={[styles.bgShape1, { transform: [{ translateY: floatY }] }]} />
        <Animated.View style={[styles.bgShape2, { transform: [{ translateY: floatY.interpolate({ inputRange: [-30, 0], outputRange: [0, -30] }) }] }]} />
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.meshPattern} />
        
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.greeting}>{greeting()} \ud83d\udc4b</Text>
            <Text style={styles.userName}>{user?.name || 'Player'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications" size={24} color="#fff" />
            {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
          </TouchableOpacity>
        </View>

        {/* Wallet card with glow */}
        <Animated.View style={[styles.walletCardWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.walletGlow} />
          <View style={styles.walletCard}>
            <View style={styles.walletPattern} />
            <View style={styles.walletContent}>
              <View style={styles.walletLeft}>
                <Text style={styles.walletLabel}>Total Balance</Text>
                <Text style={styles.walletAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
                <View style={styles.walletActions}>
                  <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/wallet/emoney-topup')}>
                    <Ionicons name="add-circle" size={18} color="#1E3A8A" />
                    <Text style={styles.walletBtnText}>Top Up</Text>
                  </TouchableOpacity>\n                  <TouchableOpacity style={styles.walletBtn} onPress={() => router.push('/(tabs)/wallet')}>
                    <Ionicons name="trending-up" size={18} color="#1E3A8A" />
                    <Text style={styles.walletBtnText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={56} color="#1E3A8A" opacity={0.1} />
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />}>
        
        {/* Stats with animated entrance */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          {[
            { icon: 'trophy', label: 'Matches', value: dashboard?.total_matches || 0, color: '#1E3A8A', bg: '#DBEAFE' },
            { icon: 'people', label: 'Teams', value: dashboard?.total_teams || 0, color: '#F59E0B', bg: '#FEF3C7' },
            { icon: 'star', label: 'Rating', value: '4.9', color: '#3B82F6', bg: '#DBEAFE' },
            { icon: 'flash', label: 'Streak', value: '7d', color: '#F59E0B', bg: '#FEF3C7' },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={26} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>\n            </View>
          ))}
        </Animated.View>

        {/* Quick Actions with gradients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'add-circle', title: 'Create Match', gradient: ['#1E3A8A', '#1E40AF'], route: '/match/create' },
              { icon: 'people', title: 'Find Players', gradient: ['#3B82F6', '#2563EB'], route: '/players' },
              { icon: 'location', title: 'Book Ground', gradient: ['#F59E0B', '#D97706'], route: '/(tabs)/grounds' },
              { icon: 'sparkles', title: 'AI Hub', gradient: ['#8B5CF6', '#7C3AED'], route: '/ai' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionCard} onPress={() => router.push(action.route as any)}>
                <LinearGradient colors={action.gradient} style={styles.actionGradient}>
                  <View style={styles.actionPattern} />
                  <Ionicons name={action.icon as any} size={32} color="#fff" />
                  <Text style={styles.actionText}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Matches with visual cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
              <Text style={styles.link}>View All</Text>
            </TouchableOpacity>
          </View>
          {dashboard?.upcoming_matches?.length > 0 ? dashboard.upcoming_matches.slice(0, 3).map((match: any) => (
            <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}`)}>
              <View style={styles.matchAccent} />
              <View style={styles.matchContent}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchIcon}>
                    <Ionicons name="baseball" size={22} color="#1E3A8A" />
                  </View>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchTitle}>{match.title}</Text>
                    <Text style={styles.matchDate}>{new Date(match.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <View style={styles.badgeDot} />
                    <Text style={styles.badgeText}>Live</Text>
                  </View>
                </View>
                <View style={styles.matchFooter}>
                  <View style={styles.matchDetail}>
                    <Ionicons name="location" size={14} color="#64748B" />
                    <Text style={styles.matchDetailText}>{match.location}</Text>
                  </View>
                  <Text style={styles.matchPrice}>AED {match.per_player_cost?.toFixed(0) || '0'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={56} color="#1E3A8A" />
              </View>
              <Text style={styles.emptyTitle}>No Matches</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/match/create')}>
                <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.emptyBtnGradient}>
                  <Text style={styles.emptyBtnText}>Create Match</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}\n        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748B', fontWeight: '600' },
  
  heroSection: { paddingTop: 20, paddingBottom: 100, position: 'relative', overflow: 'hidden' },
  bgShape1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(251, 191, 36, 0.15)', top: -50, right: -50 },
  bgShape2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(59, 130, 246, 0.12)', bottom: 20, left: -40 },
  bgCircle1: { position: 'absolute', width: 400, height: 400, borderRadius: 200, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', top: -200, left: -100 },
  bgCircle2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', bottom: -100, right: -80 },
  meshPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.02)' },
  
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 32, zIndex: 2 },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 8 },
  userName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  notifBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  notifBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#F59E0B', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E3A8A' },
  notifBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  
  walletCardWrapper: { marginHorizontal: 24, zIndex: 2 },
  walletGlow: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#F59E0B', opacity: 0.15, borderRadius: 24, transform: [{ scale: 1.05 }], shadowColor: '#F59E0B', shadowOpacity: 0.4, shadowRadius: 20 },
  walletCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24 },
  walletPattern: { position: 'absolute', right: -40, top: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: '#DBEAFE', opacity: 0.3 },
  walletContent: { flexDirection: 'row', padding: 24, zIndex: 1 },
  walletLeft: { flex: 1 },
  walletLabel: { fontSize: 14, color: '#64748B', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  walletAmount: { fontSize: 40, fontWeight: '900', color: '#0F172A', marginBottom: 20, letterSpacing: -2 },
  walletActions: { flexDirection: 'row', gap: 12 },
  walletBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DBEAFE', paddingVertical: 12, borderRadius: 16, gap: 6, borderWidth: 1, borderColor: '#93C5FD' },
  walletBtnText: { fontSize: 14, color: '#1E3A8A', fontWeight: '800' },
  walletIcon: { justifyContent: 'center', alignItems: 'center' },
  
  scrollView: { flex: 1, marginTop: -60 },
  scrollContent: { paddingTop: 20, paddingBottom: 32 },
  
  statsGrid: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 32, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  statIconBg: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  link: { fontSize: 14, color: '#1E3A8A', fontWeight: '800' },
  
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  actionCard: { width: (width - 60) / 2, aspectRatio: 1.1, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
  actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, position: 'relative' },
  actionPattern: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' },
  actionText: { fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 16, textAlign: 'center' },
  
  matchCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  matchAccent: { height: 6, backgroundColor: '#1E3A8A' },
  matchContent: { padding: 20 },
  matchHeader: { flexDirection: 'row', marginBottom: 12 },
  matchIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  matchInfo: { flex: 1 },
  matchTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  matchDate: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  matchBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 5 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' },
  badgeText: { fontSize: 11, color: '#059669', fontWeight: '800' },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  matchDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  matchDetailText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  matchPrice: { fontSize: 20, fontWeight: '900', color: '#1E3A8A' },
  
  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 48, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 24 },
  emptyBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12 },
  emptyBtnGradient: { paddingVertical: 16, paddingHorizontal: 32 },
  emptyBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

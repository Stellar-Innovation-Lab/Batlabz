import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumCard, PremiumButton, StatCard, FeatureCard, MatchCard } from '../../src/components/PremiumUI';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';
import { LoadingScreen } from '../../src/components';
import { dashboardAPI, notificationAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { PlayerDashboard } from '../../src/types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<PlayerDashboard | null>(null);
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
      } catch (e) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      {/* Premium Background */}
      <PremiumBackground variant="default" />
      <StadiumLights intensity={0.12} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Player'} 🏏</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.notifButton} 
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {/* Hero Card - Wallet Balance */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/wallet')}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroLabel}>Wallet Balance</Text>
                  <Text style={styles.heroAmount}>
                    AED {(user?.wallet_balance || 0).toFixed(2)}
                  </Text>
                  <View style={styles.heroActions}>
                    <TouchableOpacity 
                      style={styles.heroAction}
                      onPress={() => router.push('/wallet/topup')}
                    >
                      <Ionicons name="add-circle" size={18} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.heroActionText}>Top Up</Text>
                    </TouchableOpacity>
                    <View style={styles.heroDivider} />
                    <TouchableOpacity 
                      style={styles.heroAction}
                      onPress={() => router.push('/wallet/transactions')}
                    >
                      <Ionicons name="list" size={18} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.heroActionText}>History</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.heroRight}>
                  <View style={styles.heroIconBg}>
                    <Ionicons name="wallet" size={40} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
              </View>
              {/* Decorative elements */}
              <View style={styles.heroDecor1} />
              <View style={styles.heroDecor2} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar"
              iconColor={COLORS.primary}
              label="Matches"
              value={dashboard?.total_matches || 0}
            />
            <StatCard
              icon="people"
              iconColor={COLORS.secondary}
              label="Teams"
              value={dashboard?.total_teams || 0}
            />
            <StatCard
              icon="cash"
              iconColor={COLORS.gold}
              label="Spent"
              value={`${((user?.total_spent || 0) / 1000).toFixed(1)}K`}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.featuresRow}>
              <FeatureCard
                icon="add-circle"
                iconColor={COLORS.primary}
                title="Create Match"
                onPress={() => router.push('/match/create')}
              />
              <FeatureCard
                icon="people"
                iconColor={COLORS.secondary}
                title="My Teams"
                onPress={() => router.push('/(tabs)/teams')}
              />
              <FeatureCard
                icon="location"
                iconColor={COLORS.gold}
                title="Book Ground"
                onPress={() => router.push('/(tabs)/grounds')}
              />
            </View>
          </View>

          {/* Upcoming Matches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Matches</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {dashboard?.upcoming_matches && dashboard.upcoming_matches.length > 0 ? (
              dashboard.upcoming_matches.slice(0, 3).map((match) => (
                <MatchCard
                  key={match.id}
                  title={match.title}
                  date={format(new Date(match.date), 'MMM d, yyyy')}
                  time={format(new Date(match.date), 'h:mm a')}
                  location={match.location}
                  format={match.format}
                  players={match.confirmed_player_ids?.length || 0}
                  maxPlayers={match.player_limit || 22}
                  cost={match.total_cost ? Math.round(match.total_cost / (match.player_limit || 22)) : 0}
                  status="upcoming"
                  onPress={() => router.push(`/match/${match.id}`)}
                />
              ))
            ) : (
              <PremiumCard variant="glass" style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <View style={styles.emptyIconBg}>
                    <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
                  </View>
                  <Text style={styles.emptyTitle}>No Upcoming Matches</Text>
                  <Text style={styles.emptyText}>Create a match or join a team to get started</Text>
                  <PremiumButton
                    title="Create Match"
                    onPress={() => router.push('/match/create')}
                    variant="primary"
                    size="sm"
                    icon={<Ionicons name="add" size={18} color={COLORS.text} />}
                    style={{ marginTop: SPACING.md }}
                  />
                </View>
              </PremiumCard>
            )}
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {dashboard?.recent_matches && dashboard.recent_matches.length > 0 ? (
              dashboard.recent_matches.slice(0, 2).map((match) => (
                <TouchableOpacity
                  key={match.id}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/match/${match.id}`)}
                >
                  <PremiumCard variant="glass" style={styles.activityCard}>
                    <View style={styles.activityRow}>
                      <View style={[styles.activityIcon, { backgroundColor: COLORS.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>{match.title}</Text>
                        <Text style={styles.activityDate}>
                          {format(new Date(match.date), 'MMM d, yyyy')} • Completed
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </View>
                  </PremiumCard>
                </TouchableOpacity>
              ))
            ) : (
              <PremiumCard variant="glass" style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: COLORS.textMuted + '20' }]}>
                    <Ionicons name="time" size={20} color={COLORS.textMuted} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>No Recent Activity</Text>
                    <Text style={styles.activityDate}>Your match history will appear here</Text>
                  </View>
                </View>
              </PremiumCard>
            )}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  notifButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.cricketRed,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },

  // Hero Card
  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    minHeight: 160,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroActionText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  heroDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: SPACING.sm,
  },
  heroIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Features Row
  featuresRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  // Empty State
  emptyCard: {
    padding: SPACING.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Activity
  activityCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  activityDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

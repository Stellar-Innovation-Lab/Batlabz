import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, LoadingScreen } from '../../src/components';
import { dashboardAPI, adminAPI } from '../../src/services/api';
import { format } from 'date-fns';

interface AdminDashboard {
  total_users: number;
  total_teams: number;
  total_matches: number;
  completed_matches: number;
  total_grounds: number;
  total_transaction_volume: number;
  total_ground_earnings: number;
  recent_users: any[];
  recent_matches: any[];
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getAdminDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading admin dashboard..." />;
  }

  if (!dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Admin access required</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDashboard(); }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Revenue Card */}
        <Card style={styles.revenueCard}>
          <View style={styles.revenueRow}>
            <View>
              <Text style={styles.revenueLabel}>Total Transaction Volume</Text>
              <Text style={styles.revenueAmount}>AED {dashboard.total_transaction_volume.toFixed(0)}</Text>
            </View>
            <View style={styles.revenueIcon}>
              <Ionicons name="trending-up" size={32} color={COLORS.success} />
            </View>
          </View>
          <View style={styles.revenueSub}>
            <Text style={styles.revenueSubLabel}>Ground Earnings: </Text>
            <Text style={styles.revenueSubValue}>AED {dashboard.total_ground_earnings.toFixed(0)}</Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{dashboard.total_users}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="people-circle" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{dashboard.total_teams}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={COLORS.info} />
            <Text style={styles.statValue}>{dashboard.total_matches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{dashboard.completed_matches}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="location" size={24} color={COLORS.gold} />
            <Text style={styles.statValue}>{dashboard.total_grounds}</Text>
            <Text style={styles.statLabel}>Grounds</Text>
          </Card>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Users</Text>
          {dashboard.recent_users?.slice(0, 5).map((user) => (
            <Card key={user.id} style={styles.userCard}>
              <View style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name || 'New User'}</Text>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
                <View style={styles.userMeta}>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: user.role === 'admin' ? COLORS.error + '20' : COLORS.primary + '20' }
                  ]}>
                    <Text style={[
                      styles.roleText,
                      { color: user.role === 'admin' ? COLORS.error : COLORS.primary }
                    ]}>
                      {user.role}
                    </Text>
                  </View>
                  <Text style={styles.userDate}>
                    {format(new Date(user.created_at), 'MMM d')}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Recent Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {dashboard.recent_matches?.slice(0, 5).map((match) => (
            <Card key={match.id} style={styles.matchCard}>
              <View style={styles.matchRow}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchTitle}>{match.title}</Text>
                  <Text style={styles.matchDate}>
                    {format(new Date(match.date), 'MMM d, h:mm a')}
                  </Text>
                </View>
                <View style={styles.matchMeta}>
                  <Text style={styles.matchCost}>AED {match.total_cost}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: match.status === 'completed' ? COLORS.success + '20' : COLORS.primary + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: match.status === 'completed' ? COLORS.success : COLORS.primary }
                    ]}>
                      {match.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Platform Revenue Estimate */}
        <Card style={styles.platformCard}>
          <Text style={styles.platformTitle}>Platform Revenue (Estimated)</Text>
          <Text style={styles.platformNote}>Based on 0.5% transaction fee</Text>
          <Text style={styles.platformValue}>
            AED {(dashboard.total_transaction_volume * 0.005).toFixed(2)}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  revenueCard: {
    backgroundColor: COLORS.success + '15',
    marginBottom: SPACING.md,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  revenueAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  revenueIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueSub: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '30',
  },
  revenueSubLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  revenueSubValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  userCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  userPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  userMeta: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  roleText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  userDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  matchCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  matchCost: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  platformCard: {
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  platformTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  platformNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  platformValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
});

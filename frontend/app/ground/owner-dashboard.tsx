import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { dashboardAPI, groundAPI } from '../../src/services/api';
import { format } from 'date-fns';

interface GroundOwnerDashboard {
  grounds: any[];
  total_earnings: number;
  total_bookings: number;
  recent_bookings: any[];
}

export default function GroundOwnerDashboardScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<GroundOwnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getGroundOwnerDashboard();
      setDashboard(response.data);
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

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ground Owner Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/ground/create')} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
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
        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="cash" size={28} color={COLORS.success} />
            <Text style={styles.statValue}>AED {(dashboard?.total_earnings || 0).toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="calendar" size={28} color={COLORS.primary} />
            <Text style={styles.statValue}>{dashboard?.total_bookings || 0}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="location" size={28} color={COLORS.secondary} />
            <Text style={styles.statValue}>{dashboard?.grounds?.length || 0}</Text>
            <Text style={styles.statLabel}>Grounds</Text>
          </Card>
        </View>

        {/* My Grounds */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Grounds</Text>
            <Button
              title="Add Ground"
              onPress={() => router.push('/ground/create')}
              variant="ghost"
              size="sm"
              icon={<Ionicons name="add" size={18} color={COLORS.primary} />}
            />
          </View>

          {dashboard?.grounds && dashboard.grounds.length > 0 ? (
            dashboard.grounds.map((ground) => (
              <Card key={ground.id} style={styles.groundCard}>
                <TouchableOpacity onPress={() => router.push(`/ground/${ground.id}`)}>
                  <View style={styles.groundHeader}>
                    <View style={styles.groundIcon}>
                      <Ionicons
                        name={ground.type === 'indoor' ? 'home' : 'sunny'}
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.groundInfo}>
                      <Text style={styles.groundName}>{ground.name}</Text>
                      <Text style={styles.groundLocation}>{ground.location}</Text>
                    </View>
                    <View style={styles.groundStats}>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={COLORS.gold} />
                        <Text style={styles.ratingText}>{ground.rating?.toFixed(1) || '0.0'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.groundMetrics}>
                    <View style={styles.metric}>
                      <Text style={styles.metricValue}>AED {ground.total_earnings?.toFixed(0) || 0}</Text>
                      <Text style={styles.metricLabel}>Earnings</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricValue}>{ground.total_bookings || 0}</Text>
                      <Text style={styles.metricLabel}>Bookings</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricValue}>{ground.slots?.filter((s: any) => s.is_available).length || 0}</Text>
                      <Text style={styles.metricLabel}>Available Slots</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.groundActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push({ pathname: '/ground/manage-slots', params: { groundId: ground.id } })}
                  >
                    <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.actionBtnText}>Manage Slots</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push(`/ground/${ground.id}`)}
                  >
                    <Ionicons name="analytics-outline" size={18} color={COLORS.info} />
                    <Text style={[styles.actionBtnText, { color: COLORS.info }]}>View Analytics</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="location-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No grounds registered yet</Text>
              <Button
                title="Register Ground"
                onPress={() => router.push('/ground/create')}
                variant="outline"
                size="sm"
                style={{ marginTop: SPACING.md }}
              />
            </Card>
          )}
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {dashboard?.recent_bookings && dashboard.recent_bookings.length > 0 ? (
            dashboard.recent_bookings.slice(0, 5).map((booking) => (
              <Card key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingRow}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingGround}>{booking.ground_name}</Text>
                    <Text style={styles.bookingDate}>
                      {booking.date} \u2022 {booking.start_time} - {booking.end_time}
                    </Text>
                  </View>
                  <View style={styles.bookingPrice}>
                    <Text style={styles.priceText}>AED {booking.price}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: booking.status === 'confirmed' ? COLORS.success + '20' : COLORS.error + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: booking.status === 'confirmed' ? COLORS.success : COLORS.error }
                      ]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Text style={styles.noBookingsText}>No bookings yet</Text>
          )}
        </View>
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
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
  },
  groundCard: {
    marginBottom: SPACING.md,
  },
  groundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  groundIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  groundInfo: {
    flex: 1,
  },
  groundName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  groundLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  groundStats: {},
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  groundMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  groundActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  bookingCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingGround: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookingDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  bookingPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
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
  noBookingsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});

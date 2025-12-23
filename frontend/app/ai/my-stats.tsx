import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumCard, StatCard } from '../../src/components/PremiumUI';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';
import { statsAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

export default function MyStatsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await statsAPI.getMyStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.primary;
    if (score >= 40) return COLORS.warning;
    return COLORS.error;
  };

  const renderProgressRing = (value: number, color: string, label: string) => (
    <View style={styles.progressRing}>
      <View style={[styles.progressRingOuter, { borderColor: color + '30' }]}>
        <View style={[styles.progressRingInner, { borderColor: color }]}>
          <Text style={[styles.progressValue, { color }]}>{value.toFixed(0)}</Text>
        </View>
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <PremiumBackground variant="default" />
      <StadiumLights intensity={0.1} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Stats</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {/* Hero Card - Overall Rating */}
          <LinearGradient
            colors={[getScoreColor(stats?.overall_rating || 50) + '30', getScoreColor(stats?.overall_rating || 50) + '05']}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>Overall Rating</Text>
                <Text style={[styles.heroScore, { color: getScoreColor(stats?.overall_rating || 50) }]}>
                  {stats?.overall_rating?.toFixed(1) || '50.0'}
                </Text>
                <View style={styles.heroSubRow}>
                  <Ionicons name="trending-up" size={16} color={COLORS.success} />
                  <Text style={styles.heroSubText}>Form: {stats?.form_score?.toFixed(0) || 50}%</Text>
                </View>
              </View>
              <View style={styles.heroRight}>
                <View style={[styles.ratingCircle, { borderColor: getScoreColor(stats?.overall_rating || 50) }]}>
                  <Ionicons name="star" size={32} color={getScoreColor(stats?.overall_rating || 50)} />
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Key Metrics */}
          <View style={styles.metricsRow}>
            {renderProgressRing(stats?.impact_score || 50, COLORS.primary, 'Impact')}
            {renderProgressRing(stats?.reliability_score || 100, COLORS.success, 'Reliability')}
            {renderProgressRing(stats?.attendance_rate || 100, COLORS.secondary, 'Attendance')}
          </View>

          {/* Match Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Statistics</Text>
            <PremiumCard variant="glass" style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats?.total_matches || 0}</Text>
                  <Text style={styles.statLabel}>Total Matches</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>{stats?.matches_won || 0}</Text>
                  <Text style={styles.statLabel}>Won</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.error }]}>{stats?.matches_lost || 0}</Text>
                  <Text style={styles.statLabel}>Lost</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: COLORS.gold }]}>{stats?.win_rate?.toFixed(0) || 0}%</Text>
                  <Text style={styles.statLabel}>Win Rate</Text>
                </View>
              </View>
            </PremiumCard>
          </View>

          {/* Recent Form */}
          {stats?.recent_results?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Form</Text>
              <PremiumCard variant="glass" style={styles.formCard}>
                <View style={styles.formRow}>
                  {stats.recent_results.slice(-10).map((result: string, index: number) => (
                    <View 
                      key={index} 
                      style={[
                        styles.formBadge,
                        { backgroundColor: result === 'W' ? COLORS.success + '20' : COLORS.error + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.formText,
                        { color: result === 'W' ? COLORS.success : COLORS.error }
                      ]}>{result}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.formSubtext}>
                  Last {stats.recent_results.length} matches • {stats.recent_results.filter((r: string) => r === 'W').length} wins
                </Text>
              </PremiumCard>
            </View>
          )}

          {/* Reliability Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reliability</Text>
            <PremiumCard variant="glass" style={styles.statsCard}>
              <View style={styles.reliabilityRow}>
                <View style={styles.reliabilityItem}>
                  <View style={[styles.reliabilityIcon, { backgroundColor: COLORS.success + '20' }]}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  </View>
                  <Text style={styles.reliabilityValue}>{stats?.on_time_payments || 0}</Text>
                  <Text style={styles.reliabilityLabel}>On-time Payments</Text>
                </View>
                <View style={styles.reliabilityItem}>
                  <View style={[styles.reliabilityIcon, { backgroundColor: COLORS.warning + '20' }]}>
                    <Ionicons name="time" size={24} color={COLORS.warning} />
                  </View>
                  <Text style={styles.reliabilityValue}>{stats?.late_payments || 0}</Text>
                  <Text style={styles.reliabilityLabel}>Late Payments</Text>
                </View>
                <View style={styles.reliabilityItem}>
                  <View style={[styles.reliabilityIcon, { backgroundColor: COLORS.error + '20' }]}>
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </View>
                  <Text style={styles.reliabilityValue}>{stats?.no_shows || 0}</Text>
                  <Text style={styles.reliabilityLabel}>No Shows</Text>
                </View>
              </View>
            </PremiumCard>
          </View>

          {/* Format Statistics */}
          {stats?.format_stats && Object.keys(stats.format_stats).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Format Breakdown</Text>
              {Object.entries(stats.format_stats).map(([format, data]: [string, any]) => (
                <PremiumCard key={format} variant="glass" style={styles.formatCard}>
                  <View style={styles.formatHeader}>
                    <View style={[styles.formatBadge, { backgroundColor: COLORS.primary + '20' }]}>
                      <Text style={styles.formatBadgeText}>{format}</Text>
                    </View>
                    <Text style={styles.formatWinRate}>
                      {data.matches > 0 ? ((data.wins / data.matches) * 100).toFixed(0) : 0}% Win Rate
                    </Text>
                  </View>
                  <View style={styles.formatStats}>
                    <Text style={styles.formatStatText}>{data.matches} matches • {data.wins} wins</Text>
                  </View>
                </PremiumCard>
              ))}
            </View>
          )}

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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {},
  heroRight: {},
  heroLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  heroScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  heroSubText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ratingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glass,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  progressRing: {
    alignItems: 'center',
  },
  progressRingOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardSolid,
  },
  progressValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsCard: {
    padding: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  formCard: {
    padding: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  formBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  formSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  reliabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reliabilityItem: {
    alignItems: 'center',
  },
  reliabilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  reliabilityValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  reliabilityLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  formatCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  formatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  formatBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  formatBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  formatWinRate: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  formatStats: {},
  formatStatText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, LoadingScreen } from '../../src/components';
import { groundAPI } from '../../src/services/api';
import { Ground, GroundType } from '../../src/types';

export default function GroundsScreen() {
  const router = useRouter();
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');

  const fetchGrounds = async () => {
    try {
      const response = await groundAPI.getAll();
      setGrounds(response.data);
    } catch (error) {
      console.error('Error fetching grounds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGrounds();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGrounds();
  }, []);

  const filteredGrounds = grounds.filter((ground) => {
    if (filter === 'all') return true;
    return ground.type === filter;
  });

  const getAvailableSlots = (ground: Ground) => {
    return ground.slots?.filter(s => s.is_available).length || 0;
  };

  if (loading) {
    return <LoadingScreen message="Loading grounds..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cricket Grounds</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'outdoor', 'indoor'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredGrounds.length > 0 ? (
          filteredGrounds.map((ground) => (
            <Card
              key={ground.id}
              style={styles.groundCard}
              onPress={() => router.push(`/ground/${ground.id}`)}
            >
              <View style={styles.groundHeader}>
                <View style={styles.groundIcon}>
                  <Ionicons 
                    name={ground.type === 'indoor' ? 'home' : 'sunny'} 
                    size={32} 
                    color={COLORS.primary} 
                  />
                </View>
                <View style={styles.groundInfo}>
                  <Text style={styles.groundName}>{ground.name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color={COLORS.textMuted} />
                    <Text style={styles.groundLocation}>{ground.location}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: COLORS.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: COLORS.primary }]}>
                    {ground.type === 'indoor' ? 'Indoor' : 'Outdoor'}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: COLORS.info + '20' }]}>
                  <Text style={[styles.tagText, { color: COLORS.info }]}>
                    {ground.turf_type}
                  </Text>
                </View>
                {ground.has_lighting && (
                  <View style={[styles.tag, { backgroundColor: COLORS.warning + '20' }]}>
                    <Ionicons name="flash" size={12} color={COLORS.warning} />
                    <Text style={[styles.tagText, { color: COLORS.warning }]}>Lights</Text>
                  </View>
                )}
              </View>

              <View style={styles.groundStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color={COLORS.gold} />
                  <Text style={styles.statText}>{ground.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={16} color={COLORS.textMuted} />
                  <Text style={styles.statText}>{ground.total_bookings} bookings</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color={COLORS.success} />
                  <Text style={[styles.statText, { color: COLORS.success }]}>
                    {getAvailableSlots(ground)} slots
                  </Text>
                </View>
              </View>

              <View style={styles.groundFooter}>
                <Text style={styles.price}>AED {ground.price_per_hour}/hr</Text>
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => router.push(`/ground/${ground.id}`)}
                >
                  <Text style={styles.bookButtonText}>View Slots</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="location-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Grounds Found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters</Text>
          </Card>
        )}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.card,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  groundCard: {
    marginBottom: SPACING.md,
  },
  groundHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  groundIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  groundInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  groundName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groundLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  groundStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  groundFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  bookButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});

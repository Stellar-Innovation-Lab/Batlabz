import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { matchAPI } from '../../src/services/api';
import { StatusBar } from 'expo-status-bar';
import { DS_COLORS, DS_SPACING, DS_RADIUS, DSBadge } from '../../src/components/DesignSystem';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      const res = await matchAPI.getMatches();
      setMatches(res.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchMatches(); }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DS_COLORS.primary} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Matches</Text>
          <Text style={styles.headerSubtitle}>{matches.length} total matches</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/match/create')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMatches(); }} tintColor={DS_COLORS.primary} />}>
        
        {matches.length > 0 ? matches.map((match) => (
          <TouchableOpacity key={match.id} style={styles.matchCard} onPress={() => router.push(`/match/${match.id}`)} activeOpacity={0.95}>
            <View style={styles.matchHeader}>
              <View style={styles.matchLeft}>
                <LinearGradient colors={[DS_COLORS.primary, DS_COLORS.primaryDark]} style={styles.matchIcon}>
                  <Ionicons name="baseball" size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchTitle}>{match.title}</Text>
                  <Text style={styles.matchDate}>{new Date(match.date).toLocaleDateString()}</Text>
                </View>
              </View>
              <DSBadge label={match.status} variant="success" />
            </View>
            <View style={styles.matchDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={14} color={DS_COLORS.textMuted} />
                <Text style={styles.detailText}>{match.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="people" size={14} color={DS_COLORS.textMuted} />
                <Text style={styles.detailText}>{match.confirmed_player_ids?.length || 0} players</Text>
              </View>
            </View>
            <View style={styles.matchFooter}>
              <Text style={styles.matchCost}>AED {match.per_player_cost?.toFixed(2) || '0.00'}</Text>
              <Ionicons name="chevron-forward" size={20} color={DS_COLORS.primary} />
            </View>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="calendar-outline" size={56} color={DS_COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptyText}>Create your first match to get started</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/match/create')}>
              <LinearGradient colors={[DS_COLORS.primary, DS_COLORS.primaryDark]} style={styles.emptyButtonGradient}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Create Match</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: DS_COLORS.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: DS_SPACING.md, fontSize: 16, color: DS_COLORS.textSecondary, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: DS_SPACING.lg, paddingVertical: DS_SPACING.lg, backgroundColor: DS_COLORS.surface, borderBottomWidth: 1, borderBottomColor: DS_COLORS.borderLight },
  headerTitle: { fontSize: 28, fontWeight: '900', color: DS_COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: DS_COLORS.textSecondary, fontWeight: '500' },
  createButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: DS_COLORS.primary, justifyContent: 'center', alignItems: 'center', ...{ shadowColor: DS_COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 } },
  scrollView: { flex: 1 },
  scrollContent: { padding: DS_SPACING.lg },
  matchCard: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.xl, padding: DS_SPACING.lg, marginBottom: DS_SPACING.md, borderWidth: 1, borderColor: DS_COLORS.borderLight, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 } },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: DS_SPACING.md },
  matchLeft: { flex: 1, flexDirection: 'row' },
  matchIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: DS_SPACING.md },
  matchInfo: { flex: 1 },
  matchTitle: { fontSize: 17, fontWeight: '800', color: DS_COLORS.text, marginBottom: 4 },
  matchDate: { fontSize: 13, color: DS_COLORS.textSecondary, fontWeight: '500' },
  matchDetails: { flexDirection: 'row', gap: DS_SPACING.md, marginBottom: DS_SPACING.md },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: DS_COLORS.textMuted, fontWeight: '500' },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: DS_SPACING.md, borderTopWidth: 1, borderTopColor: DS_COLORS.borderLight },
  matchCost: { fontSize: 20, fontWeight: '900', color: DS_COLORS.primary },
  emptyState: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.xl, padding: DS_SPACING.xxl, alignItems: 'center', borderWidth: 2, borderColor: DS_COLORS.borderLight, borderStyle: 'dashed' },
  emptyIconBg: { width: 96, height: 96, borderRadius: 48, backgroundColor: DS_COLORS.primaryGhost, justifyContent: 'center', alignItems: 'center', marginBottom: DS_SPACING.lg },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: DS_COLORS.text, marginBottom: DS_SPACING.sm },
  emptyText: { fontSize: 14, color: DS_COLORS.textSecondary, textAlign: 'center', marginBottom: DS_SPACING.xl, lineHeight: 22 },
  emptyButton: { borderRadius: DS_RADIUS.lg, overflow: 'hidden', ...{ shadowColor: DS_COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12 } },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 28, gap: 8 },
  emptyButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { matchAPI } from '../../src/services/api';
import { StatusBar } from 'expo-status-bar';

type Filter = 'all' | 'upcoming' | 'past';

const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  draft:         { label: 'Draft',      bg: '#F1F5F9', dot: '#94A3B8', text: '#64748B' },
  ready_to_play: { label: 'Ready',      bg: '#DBEAFE', dot: '#3B82F6', text: '#1D4ED8' },
  confirmed:     { label: 'Confirmed',  bg: '#DBEAFE', dot: '#1E3A8A', text: '#1E3A8A' },
  completed:     { label: 'Completed',  bg: '#DCFCE7', dot: '#22C55E', text: '#16A34A' },
  cancelled:     { label: 'Cancelled',  bg: '#FEE2E2', dot: '#EF4444', text: '#DC2626' },
};

function statusCfg(status: string) {
  return STATUS_CONFIG[status] || { label: status, bg: '#F1F5F9', dot: '#94A3B8', text: '#64748B' };
}

function isPast(match: any) {
  return new Date(match.date) < new Date() || match.status === 'completed' || match.status === 'cancelled';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AE', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });
}

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchMatches = async () => {
    try {
      const res = await matchAPI.getMatches();
      setMatches(res.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchMatches(); }, []);

  const filtered = useMemo(() => {
    if (filter === 'upcoming') return matches.filter(m => !isPast(m));
    if (filter === 'past') return matches.filter(m => isPast(m));
    return matches;
  }, [matches, filter]);

  const upcomingCount = matches.filter(m => !isPast(m)).length;
  const pastCount = matches.filter(m => isPast(m)).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Matches</Text>
            <Text style={styles.headerSubtitle}>{matches.length} total · {upcomingCount} upcoming</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/match/create' as any)}>
            <Ionicons name="add" size={22} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Filter tabs inside header */}
        <View style={styles.filterRow}>
          {(['all', 'upcoming', 'past'] as Filter[]).map((f) => {
            const active = filter === f;
            const count = f === 'all' ? matches.length : f === 'upcoming' ? upcomingCount : pastCount;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, active && styles.filterTabActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
                {count > 0 && (
                  <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
                    <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMatches(); }} tintColor="#fff" />}
      >

        {filtered.length > 0 ? filtered.map((match) => {
          const s = statusCfg(match.status);
          const past = isPast(match);
          return (
            <TouchableOpacity
              key={match.id}
              style={[styles.matchCard, past && styles.matchCardPast]}
              onPress={() => router.push(`/match/${match.id}` as any)}
              activeOpacity={0.92}
            >
              <View style={styles.matchTop}>
                <LinearGradient
                  colors={past ? ['#94A3B8', '#64748B'] : ['#1E3A8A', '#1E40AF']}
                  style={styles.matchIcon}
                >
                  <Ionicons name="baseball" size={20} color="#fff" />
                </LinearGradient>

                <View style={styles.matchInfo}>
                  <Text style={[styles.matchTitle, past && styles.matchTitlePast]}>{match.title}</Text>
                  <View style={styles.matchDateRow}>
                    <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                    <Text style={styles.matchDateText}>{formatDate(match.date)}</Text>
                    <Text style={styles.matchTimeSep}>·</Text>
                    <Ionicons name="time-outline" size={12} color="#94A3B8" />
                    <Text style={styles.matchDateText}>{formatTime(match.date)}</Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                  <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
                </View>
              </View>

              <View style={styles.matchDetails}>
                <View style={styles.detailChip}>
                  <Ionicons name="location-outline" size={13} color="#64748B" />
                  <Text style={styles.detailText}>{match.location || 'TBD'}</Text>
                </View>
                <View style={styles.detailChip}>
                  <Ionicons name="people-outline" size={13} color="#64748B" />
                  <Text style={styles.detailText}>{match.confirmed_player_ids?.length || 0} players</Text>
                </View>
              </View>

              <View style={styles.matchFooter}>
                <Text style={[styles.matchCost, past && { color: '#94A3B8' }]}>
                  AED {match.per_player_cost?.toFixed(2) || '0.00'}
                  <Text style={styles.matchCostSub}> / player</Text>
                </Text>
                <Ionicons name="chevron-forward" size={18} color={past ? '#CBD5E1' : '#1E3A8A'} />
              </View>
            </TouchableOpacity>
          );
        }) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="calendar-outline" size={52} color="#1E3A8A" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'upcoming' ? 'No Upcoming Matches' : filter === 'past' ? 'No Past Matches' : 'No Matches Yet'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'Create your first match to get started' : `Switch to "All" to see all matches`}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/match/create' as any)}>
                <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.emptyBtnGrad}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.emptyBtnText}>Create Match</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#94A3B8', fontWeight: '600' },

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  filterRow: { flexDirection: 'row', gap: 8 },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)' },
  filterTabActive: { backgroundColor: '#fff' },
  filterTabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  filterTabTextActive: { color: '#1E3A8A' },
  filterBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  filterBadgeActive: { backgroundColor: '#DBEAFE' },
  filterBadgeText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  filterBadgeTextActive: { color: '#1E3A8A' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 16 },

  matchCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  matchCardPast: { opacity: 0.75 },
  matchTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  matchIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  matchInfo: { flex: 1 },
  matchTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  matchTitlePast: { color: '#64748B' },
  matchDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matchDateText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  matchTimeSep: { fontSize: 12, color: '#CBD5E1', marginHorizontal: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '800' },

  matchDetails: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  matchCost: { fontSize: 18, fontWeight: '900', color: '#1E3A8A' },
  matchCostSub: { fontSize: 11, fontWeight: '500', color: '#94A3B8' },

  emptyState: { backgroundColor: '#fff', borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', marginTop: 8 },
  emptyIconBg: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  emptyBtn: { borderRadius: 14, overflow: 'hidden' },
  emptyBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 24, gap: 6 },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

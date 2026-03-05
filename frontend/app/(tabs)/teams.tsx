import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { teamAPI } from '../../src/services/api';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Deterministic accent color per team based on name
const TEAM_ACCENTS = [
  { from: '#1E3A8A', to: '#1E40AF', bg: '#DBEAFE', text: '#1E3A8A' },
  { from: '#F59E0B', to: '#D97706', bg: '#FEF3C7', text: '#B45309' },
  { from: '#10B981', to: '#059669', bg: '#D1FAE5', text: '#065F46' },
  { from: '#8B5CF6', to: '#7C3AED', bg: '#EDE9FE', text: '#5B21B6' },
  { from: '#EF4444', to: '#DC2626', bg: '#FEE2E2', text: '#991B1B' },
  { from: '#0EA5E9', to: '#0284C7', bg: '#E0F2FE', text: '#0369A1' },
];

function teamAccent(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TEAM_ACCENTS[h % TEAM_ACCENTS.length];
}

function winRate(wins: number, losses: number) {
  const total = wins + losses;
  if (total === 0) return null;
  return Math.round((wins / total) * 100);
}

export default function TeamsScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await teamAPI.getMyTeams();
      setTeams(res.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchTeams(); }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>My Teams</Text>
            <Text style={styles.headerSubtitle}>{teams.length} {teams.length === 1 ? 'team' : 'teams'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.joinBtn} onPress={() => router.push('/team/join' as any)}>
              <Ionicons name="enter-outline" size={18} color="#F59E0B" />
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/team/create' as any)}>
              <Ionicons name="add" size={22} color="#1E3A8A" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTeams(); }} tintColor="#1E3A8A" />}
      >

        {teams.length > 0 ? teams.map((team) => {
          const accent = teamAccent(team.name || '');
          const wr = winRate(team.wins || 0, team.losses || 0);
          return (
            <TouchableOpacity
              key={team.id}
              style={styles.teamCard}
              onPress={() => router.push(`/team/${team.id}` as any)}
              activeOpacity={0.92}
            >
              <LinearGradient colors={[accent.from, accent.to]} style={styles.accentBar} />
              <View style={styles.cardBody}>
                <View style={styles.teamRow}>
                  <LinearGradient colors={[accent.from, accent.to]} style={styles.avatar}>
                    <Text style={styles.avatarText}>{(team.name || 'T').charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <View style={styles.teamMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={12} color="#94A3B8" />
                        <Text style={styles.metaText}>{team.player_ids?.length || 0} players</Text>
                      </View>
                      <Text style={styles.metaDot}>·</Text>
                      <View style={styles.metaItem}>
                        <Ionicons name="trophy-outline" size={12} color="#94A3B8" />
                        <Text style={styles.metaText}>{team.wins || 0}W – {team.losses || 0}L</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.rightCol}>
                    {wr !== null && (
                      <View style={[styles.wrBadge, { backgroundColor: accent.bg }]}>
                        <Text style={[styles.wrText, { color: accent.text }]}>{wr}%</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginTop: 4 }} />
                  </View>
                </View>
                {team.pool_balance > 0 && (
                  <View style={styles.poolRow}>
                    <Ionicons name="wallet-outline" size={13} color="#64748B" />
                    <Text style={styles.poolText}>Team pool · AED {team.pool_balance.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="people-outline" size={52} color="#1E3A8A" />
            </View>
            <Text style={styles.emptyTitle}>No Teams Yet</Text>
            <Text style={styles.emptyText}>Create a new team or join one with an invite code</Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/team/create' as any)}>
                <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.emptyBtnGrad}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.emptyBtnText}>Create Team</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emptyBtnOutline} onPress={() => router.push('/team/join' as any)}>
                <Ionicons name="enter-outline" size={18} color="#1E3A8A" />
                <Text style={styles.emptyBtnOutlineText}>Join Team</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  joinBtnText: { fontSize: 14, fontWeight: '800', color: '#F59E0B' },
  createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 16 },

  teamCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  accentBar: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  teamRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#fff' },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 5 },
  teamMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  metaDot: { fontSize: 12, color: '#CBD5E1' },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  wrBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  wrText: { fontSize: 12, fontWeight: '800' },
  poolRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  poolText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  emptyState: { backgroundColor: '#fff', borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', marginTop: 8 },
  emptyIconBg: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  emptyActions: { flexDirection: 'row', gap: 12 },
  emptyBtn: { borderRadius: 14, overflow: 'hidden' },
  emptyBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 20, gap: 6 },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  emptyBtnOutline: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 20, gap: 6, borderRadius: 14, borderWidth: 2, borderColor: '#1E3A8A' },
  emptyBtnOutlineText: { fontSize: 14, fontWeight: '800', color: '#1E3A8A' },
});

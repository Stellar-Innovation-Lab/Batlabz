import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { teamAPI } from '../../src/services/api';
import { StatusBar } from 'expo-status-bar';
import { DS_COLORS, DS_SPACING, DS_RADIUS } from '../../src/components/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';

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
        <ActivityIndicator size="large" color={DS_COLORS.primary} />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Teams</Text>
          <Text style={styles.headerSubtitle}>{teams.length} teams</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/team/create')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTeams(); }} tintColor={DS_COLORS.primary} />}>
        
        {teams.length > 0 ? teams.map((team) => (
          <TouchableOpacity key={team.id} style={styles.teamCard} onPress={() => router.push(`/team/${team.id}`)} activeOpacity={0.95}>
            <View style={styles.teamHeader}>
              <View style={styles.teamIconBg}>
                <Ionicons name="people" size={28} color={DS_COLORS.primary} />
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.name}</Text>
                <View style={styles.teamMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person" size={12} color={DS_COLORS.textMuted} />
                    <Text style={styles.metaText}>{team.player_ids?.length || 0} players</Text>
                  </View>
                  <View style={styles.metaDot} />
                  <View style={styles.metaItem}>
                    <Ionicons name="trophy" size={12} color={DS_COLORS.textMuted} />
                    <Text style={styles.metaText}>{team.wins || 0}W-{team.losses || 0}L</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={DS_COLORS.textMuted} />
            </View>
            {team.pool_balance > 0 && (
              <View style={styles.poolBadge}>
                <Ionicons name="wallet" size={14} color={DS_COLORS.primary} />
                <Text style={styles.poolText}>Pool: AED {team.pool_balance.toFixed(2)}</Text>
              </View>
            )}
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="people-outline" size={56} color={DS_COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Teams Yet</Text>
            <Text style={styles.emptyText}>Create or join a team to start playing</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/team/create')}>
              <LinearGradient colors={[DS_COLORS.primary, DS_COLORS.primaryDark]} style={styles.emptyButtonGradient}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Create Team</Text>
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
  teamCard: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.xl, padding: DS_SPACING.lg, marginBottom: DS_SPACING.md, borderWidth: 1, borderColor: DS_COLORS.borderLight, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 } },
  teamHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: DS_SPACING.sm },
  teamIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: DS_COLORS.primaryGhost, justifyContent: 'center', alignItems: 'center', marginRight: DS_SPACING.md },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 18, fontWeight: '800', color: DS_COLORS.text, marginBottom: 6 },
  teamMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: DS_COLORS.textMuted, fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: DS_COLORS.border },
  poolBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: DS_COLORS.primaryGhost, paddingHorizontal: 12, paddingVertical: 8, borderRadius: DS_RADIUS.md, alignSelf: 'flex-start', gap: 6, marginTop: DS_SPACING.sm },
  poolText: { fontSize: 13, color: DS_COLORS.primary, fontWeight: '700' },
  emptyState: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.xl, padding: DS_SPACING.xxl, alignItems: 'center', borderWidth: 2, borderColor: DS_COLORS.borderLight, borderStyle: 'dashed' },
  emptyIconBg: { width: 96, height: 96, borderRadius: 48, backgroundColor: DS_COLORS.primaryGhost, justifyContent: 'center', alignItems: 'center', marginBottom: DS_SPACING.lg },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: DS_COLORS.text, marginBottom: DS_SPACING.sm },
  emptyText: { fontSize: 14, color: DS_COLORS.textSecondary, textAlign: 'center', marginBottom: DS_SPACING.xl, lineHeight: 22 },
  emptyButton: { borderRadius: DS_RADIUS.lg, overflow: 'hidden', ...{ shadowColor: DS_COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12 } },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 28, gap: 8 },
  emptyButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
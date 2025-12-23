import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumCard, PremiumButton } from '../../src/components/PremiumUI';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';
import { aiAPI, teamAPI } from '../../src/services/api';

export default function AIMatchmakingScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [skillRange, setSkillRange] = useState('similar');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await teamAPI.getMyTeams();
      setTeams(res.data);
      if (res.data.length > 0) {
        setSelectedTeam(res.data[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const findOpponents = async () => {
    if (!selectedTeam) return;
    setSearching(true);
    try {
      const res = await aiAPI.findOpponents(selectedTeam.id, 'T20', skillRange);
      setRecommendations(res.data.recommendations || []);
    } catch (error) {
      console.error('Error finding opponents:', error);
    } finally {
      setSearching(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeams().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PremiumBackground variant="match" />
      <StadiumLights intensity={0.1} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Matchmaking</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['rgba(0, 200, 83, 0.2)', 'rgba(0, 200, 83, 0.05)']}
            style={styles.heroCard}
          >
            <View style={styles.heroIconBg}>
              <Ionicons name="sparkles" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>Find Your Perfect Opponent</Text>
            <Text style={styles.heroSubtitle}>
              AI-powered matchmaking finds teams that match your skill level for competitive, exciting matches
            </Text>
          </LinearGradient>

          {/* Team Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Team</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => setSelectedTeam(team)}
                  activeOpacity={0.8}
                >
                  <PremiumCard
                    variant={selectedTeam?.id === team.id ? 'highlight' : 'glass'}
                    style={styles.teamCard}
                  >
                    <View style={[styles.teamIcon, { backgroundColor: COLORS.primary + '20' }]}>
                      <Ionicons name="people" size={24} color={COLORS.primary} />
                    </View>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamPlayers}>{team.player_ids?.length || 0} players</Text>
                  </PremiumCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Skill Range Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opponent Skill Level</Text>
            <View style={styles.skillOptions}>
              {[
                { key: 'similar', label: 'Similar', icon: 'swap-horizontal', desc: 'Balanced match' },
                { key: 'higher', label: 'Stronger', icon: 'trending-up', desc: 'Challenge yourself' },
                { key: 'lower', label: 'Easier', icon: 'trending-down', desc: 'Practice match' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setSkillRange(opt.key)}
                  style={styles.skillOption}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={skillRange === opt.key 
                      ? [COLORS.primary + '30', COLORS.primary + '10']
                      : ['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)']}
                    style={[
                      styles.skillOptionCard,
                      skillRange === opt.key && styles.skillOptionSelected
                    ]}
                  >
                    <Ionicons 
                      name={opt.icon as any} 
                      size={24} 
                      color={skillRange === opt.key ? COLORS.primary : COLORS.textMuted} 
                    />
                    <Text style={[
                      styles.skillOptionLabel,
                      skillRange === opt.key && { color: COLORS.primary }
                    ]}>{opt.label}</Text>
                    <Text style={styles.skillOptionDesc}>{opt.desc}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search Button */}
          <PremiumButton
            title={searching ? 'Finding Opponents...' : 'Find Opponents'}
            onPress={findOpponents}
            variant="primary"
            size="lg"
            loading={searching}
            disabled={!selectedTeam || searching}
            icon={<Ionicons name="search" size={20} color={COLORS.text} />}
            fullWidth
            style={{ marginBottom: SPACING.xl }}
          />

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Opponents</Text>
              {recommendations.map((rec, index) => (
                <TouchableOpacity 
                  key={index} 
                  activeOpacity={0.9}
                  onPress={() => router.push(`/team/${rec.opponent_team.id}`)}
                >
                  <PremiumCard variant="glass" style={styles.recCard}>
                    <View style={styles.recHeader}>
                      <View style={styles.recTeamInfo}>
                        <View style={[styles.recIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                          <Ionicons name="shield" size={24} color={COLORS.secondary} />
                        </View>
                        <View>
                          <Text style={styles.recTeamName}>{rec.opponent_team.name}</Text>
                          <Text style={styles.recTeamLocation}>{rec.opponent_team.location}</Text>
                        </View>
                      </View>
                      <View style={styles.compatibilityBadge}>
                        <Text style={styles.compatibilityScore}>{rec.compatibility_score}%</Text>
                        <Text style={styles.compatibilityLabel}>Match</Text>
                      </View>
                    </View>

                    <View style={styles.recStats}>
                      <View style={styles.recStat}>
                        <Text style={styles.recStatValue}>{rec.opponent_team.player_count}</Text>
                        <Text style={styles.recStatLabel}>Players</Text>
                      </View>
                      <View style={styles.recStatDivider} />
                      <View style={styles.recStat}>
                        <Text style={styles.recStatValue}>{rec.opponent_team.win_rate}%</Text>
                        <Text style={styles.recStatLabel}>Win Rate</Text>
                      </View>
                      <View style={styles.recStatDivider} />
                      <View style={styles.recStat}>
                        <Text style={[styles.recStatValue, { color: COLORS.primary }]}>
                          {rec.predicted_match_quality}%
                        </Text>
                        <Text style={styles.recStatLabel}>Quality</Text>
                      </View>
                    </View>

                    <View style={styles.recReason}>
                      <Ionicons name="bulb" size={16} color={COLORS.gold} />
                      <Text style={styles.recReasonText}>{rec.recommendation_reason}</Text>
                    </View>

                    {rec.suggested_grounds?.length > 0 && (
                      <View style={styles.suggestedGrounds}>
                        <Text style={styles.suggestedLabel}>Suggested Venues:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {rec.suggested_grounds.slice(0, 3).map((ground: any, gi: number) => (
                            <TouchableOpacity 
                              key={gi} 
                              style={styles.groundChip}
                              onPress={() => router.push(`/ground/${ground.id}`)}
                            >
                              <Ionicons name="location" size={12} color={COLORS.primary} />
                              <Text style={styles.groundChipText}>{ground.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </PremiumCard>
                </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  heroIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  teamCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.sm,
    minWidth: 120,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  teamPlayers: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  skillOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  skillOption: {
    flex: 1,
  },
  skillOptionCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillOptionSelected: {
    borderColor: COLORS.primary,
  },
  skillOptionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  skillOptionDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  recCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTeamName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recTeamLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  compatibilityBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  compatibilityScore: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  compatibilityLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  recStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  recStat: {
    alignItems: 'center',
  },
  recStatValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  recStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  recReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.gold + '10',
    borderRadius: BORDER_RADIUS.sm,
  },
  recReasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    flex: 1,
  },
  suggestedGrounds: {
    marginTop: SPACING.md,
  },
  suggestedLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  groundChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.glass,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
  },
  groundChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

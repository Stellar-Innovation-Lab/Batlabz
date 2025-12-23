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

export default function AIPlayerRecommendationsScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
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

  const findPlayers = async () => {
    if (!selectedTeam) return;
    setSearching(true);
    try {
      const res = await aiAPI.getPlayerRecommendations(selectedTeam.id);
      setRecommendations(res.data.recommendations || []);
    } catch (error) {
      console.error('Error finding players:', error);
    } finally {
      setSearching(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeams().then(() => setRefreshing(false));
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'batsman': return 'baseball-outline';
      case 'bowler': return 'disc-outline';
      case 'wicket_keeper': return 'hand-left-outline';
      default: return 'star-outline';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman': return COLORS.primary;
      case 'bowler': return COLORS.cricketRed;
      case 'wicket_keeper': return COLORS.gold;
      default: return COLORS.secondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Player Scout</Text>
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
            colors={['rgba(255, 109, 0, 0.2)', 'rgba(255, 109, 0, 0.05)']}
            style={styles.heroCard}
          >
            <View style={styles.heroIconBg}>
              <Ionicons name="person-add" size={32} color={COLORS.secondary} />
            </View>
            <Text style={styles.heroTitle}>AI Player Scout</Text>
            <Text style={styles.heroSubtitle}>
              Find the perfect players for your team based on reliability, impact, and playing style compatibility
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
                    <View style={[styles.teamIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                      <Ionicons name="people" size={24} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamPlayers}>{team.player_ids?.length || 0} players</Text>
                  </PremiumCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Search Button */}
          <PremiumButton
            title={searching ? 'Finding Players...' : 'Find Recommended Players'}
            onPress={findPlayers}
            variant="secondary"
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
              <Text style={styles.sectionTitle}>Recommended Players ({recommendations.length})</Text>
              {recommendations.map((rec, index) => (
                <PremiumCard key={index} variant="glass" style={styles.playerCard}>
                  <View style={styles.playerHeader}>
                    <View style={styles.playerInfo}>
                      <View style={[
                        styles.playerAvatar, 
                        { backgroundColor: getRoleColor(rec.player.playing_role) + '20' }
                      ]}>
                        <Ionicons 
                          name={getRoleIcon(rec.player.playing_role) as any} 
                          size={24} 
                          color={getRoleColor(rec.player.playing_role)} 
                        />
                      </View>
                      <View>
                        <Text style={styles.playerName}>{rec.player.name}</Text>
                        <Text style={styles.playerRole}>
                          {rec.player.playing_role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreValue}>{rec.compatibility_score}</Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                    </View>
                  </View>

                  {/* Player Stats */}
                  <View style={styles.playerStats}>
                    <View style={styles.playerStat}>
                      <Ionicons name="star" size={16} color={COLORS.gold} />
                      <Text style={styles.playerStatValue}>{rec.player.overall_rating}</Text>
                      <Text style={styles.playerStatLabel}>Rating</Text>
                    </View>
                    <View style={styles.playerStatDivider} />
                    <View style={styles.playerStat}>
                      <Ionicons name="flash" size={16} color={COLORS.primary} />
                      <Text style={styles.playerStatValue}>{rec.impact_prediction}</Text>
                      <Text style={styles.playerStatLabel}>Impact</Text>
                    </View>
                    <View style={styles.playerStatDivider} />
                    <View style={styles.playerStat}>
                      <Ionicons name="calendar" size={16} color={COLORS.secondary} />
                      <Text style={styles.playerStatValue}>{rec.player.matches_played}</Text>
                      <Text style={styles.playerStatLabel}>Matches</Text>
                    </View>
                  </View>

                  {/* Strengths */}
                  {rec.strengths?.length > 0 && (
                    <View style={styles.strengthsContainer}>
                      {rec.strengths.map((strength: string, si: number) => (
                        <View key={si} style={styles.strengthChip}>
                          <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                          <Text style={styles.strengthText}>{strength}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Recommendation Reason */}
                  <View style={styles.reasonContainer}>
                    <Ionicons name="bulb" size={16} color={COLORS.gold} />
                    <Text style={styles.reasonText}>{rec.recommendation_reason}</Text>
                  </View>

                  {/* Action */}
                  <View style={styles.playerAction}>
                    <PremiumButton
                      title="View Profile"
                      onPress={() => router.push(`/profile/${rec.player.id}`)}
                      variant="outline"
                      size="sm"
                    />
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  heroIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondary + '20',
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
  playerCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playerRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  scoreValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  playerStat: {
    alignItems: 'center',
    gap: 2,
  },
  playerStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playerStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  playerStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  strengthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  strengthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  strengthText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.gold + '10',
    borderRadius: BORDER_RADIUS.sm,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    flex: 1,
  },
  playerAction: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },
});

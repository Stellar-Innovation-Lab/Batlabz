import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumCard, PremiumButton } from '../../src/components/PremiumUI';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';
import { aiAPI, teamAPI } from '../../src/services/api';

export default function AIPredictionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [teams, setTeams] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [team1, setTeam1] = useState<any>(null);
  const [team2, setTeam2] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [myTeamsRes, matchmakingRes] = await Promise.all([
        teamAPI.getMyTeams(),
        aiAPI.findOpponents('dummy', 'T20', 'any'),
      ]);
      setTeams(myTeamsRes.data);
      // Combine my teams and opponent teams
      const opponents = matchmakingRes.data.recommendations?.map((r: any) => r.opponent_team) || [];
      setAllTeams([...myTeamsRes.data, ...opponents]);
      if (myTeamsRes.data.length > 0) {
        setTeam1(myTeamsRes.data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const predictMatch = async () => {
    if (!team1 || !team2) return;
    setPredicting(true);
    try {
      const res = await aiAPI.predictMatch(team1.id, team2.id, 'T20');
      setPrediction(res.data);
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setPredicting(false);
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
      <PremiumBackground variant="match" />
      <StadiumLights intensity={0.12} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Prediction</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['rgba(220, 38, 38, 0.2)', 'rgba(220, 38, 38, 0.05)']}
            style={styles.heroCard}
          >
            <View style={styles.heroIconBg}>
              <Ionicons name="analytics" size={32} color={COLORS.cricketRed} />
            </View>
            <Text style={styles.heroTitle}>AI Match Predictor</Text>
            <Text style={styles.heroSubtitle}>
              Get win probability predictions based on team stats, form, and head-to-head history
            </Text>
          </LinearGradient>

          {/* Team Selection */}
          <View style={styles.teamsSection}>
            {/* Team 1 */}
            <View style={styles.teamSelectBox}>
              <Text style={styles.teamSelectLabel}>Team 1</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {teams.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTeam1(t)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={team1?.id === t.id 
                        ? [COLORS.primary + '40', COLORS.primary + '20']
                        : ['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)']}
                      style={[
                        styles.teamSelectCard,
                        team1?.id === t.id && styles.teamSelectCardSelected
                      ]}
                    >
                      <View style={[styles.teamSelectIcon, { backgroundColor: COLORS.primary + '20' }]}>
                        <Ionicons name="shield" size={20} color={COLORS.primary} />
                      </View>
                      <Text style={styles.teamSelectName} numberOfLines={1}>{t.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* VS Divider */}
            <View style={styles.vsDivider}>
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>
            </View>

            {/* Team 2 */}
            <View style={styles.teamSelectBox}>
              <Text style={styles.teamSelectLabel}>Team 2</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {allTeams.filter(t => t.id !== team1?.id).map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTeam2(t)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={team2?.id === t.id 
                        ? [COLORS.secondary + '40', COLORS.secondary + '20']
                        : ['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)']}
                      style={[
                        styles.teamSelectCard,
                        team2?.id === t.id && styles.teamSelectCardSelected2
                      ]}
                    >
                      <View style={[styles.teamSelectIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                        <Ionicons name="shield" size={20} color={COLORS.secondary} />
                      </View>
                      <Text style={styles.teamSelectName} numberOfLines={1}>{t.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Predict Button */}
          <PremiumButton
            title={predicting ? 'Analyzing...' : 'Predict Match Outcome'}
            onPress={predictMatch}
            variant="secondary"
            size="lg"
            loading={predicting}
            disabled={!team1 || !team2 || predicting}
            icon={<Ionicons name="flash" size={20} color={COLORS.text} />}
            fullWidth
            style={{ marginBottom: SPACING.xl }}
          />

          {/* Prediction Results */}
          {prediction && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prediction Results</Text>
              
              {/* Main Prediction Card */}
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 150, 0, 0.05)']}
                style={styles.predictionCard}
              >
                <View style={styles.predictionHeader}>
                  <Ionicons name="trophy" size={24} color={COLORS.gold} />
                  <Text style={styles.predictionLabel}>Predicted Winner</Text>
                </View>
                <Text style={styles.predictionWinner}>{prediction.prediction}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{prediction.confidence}% Confidence</Text>
                </View>
              </LinearGradient>

              {/* Win Probability */}
              <PremiumCard variant="glass" style={styles.probCard}>
                <Text style={styles.probTitle}>Win Probability</Text>
                
                {/* Team 1 Bar */}
                <View style={styles.probRow}>
                  <Text style={styles.probTeamName}>{prediction.team1.name}</Text>
                  <View style={styles.probBarContainer}>
                    <View style={[
                      styles.probBar,
                      styles.probBar1,
                      { width: `${prediction.team1_win_probability}%` }
                    ]} />
                  </View>
                  <Text style={[styles.probPercent, { color: COLORS.primary }]}>
                    {prediction.team1_win_probability}%
                  </Text>
                </View>

                {/* Draw Bar */}
                <View style={styles.probRow}>
                  <Text style={styles.probTeamName}>Draw</Text>
                  <View style={styles.probBarContainer}>
                    <View style={[
                      styles.probBar,
                      styles.probBarDraw,
                      { width: `${prediction.draw_probability}%` }
                    ]} />
                  </View>
                  <Text style={[styles.probPercent, { color: COLORS.textMuted }]}>
                    {prediction.draw_probability}%
                  </Text>
                </View>

                {/* Team 2 Bar */}
                <View style={styles.probRow}>
                  <Text style={styles.probTeamName}>{prediction.team2.name}</Text>
                  <View style={styles.probBarContainer}>
                    <View style={[
                      styles.probBar,
                      styles.probBar2,
                      { width: `${prediction.team2_win_probability}%` }
                    ]} />
                  </View>
                  <Text style={[styles.probPercent, { color: COLORS.secondary }]}>
                    {prediction.team2_win_probability}%
                  </Text>
                </View>
              </PremiumCard>

              {/* Contributing Factors */}
              <PremiumCard variant="glass" style={styles.factorsCard}>
                <Text style={styles.factorsTitle}>Contributing Factors</Text>
                {prediction.factors?.map((factor: any, index: number) => (
                  <View key={index} style={styles.factorRow}>
                    <Text style={styles.factorName}>{factor.factor}</Text>
                    <View style={styles.factorValues}>
                      <Text style={[
                        styles.factorValue,
                        factor.advantage === 'team1' && { color: COLORS.primary }
                      ]}>{factor.team1_value}</Text>
                      <View style={styles.factorIndicator}>
                        {factor.advantage === 'team1' && <Ionicons name="caret-back" size={12} color={COLORS.primary} />}
                        {factor.advantage === 'neutral' && <Ionicons name="remove" size={12} color={COLORS.textMuted} />}
                        {factor.advantage === 'team2' && <Ionicons name="caret-forward" size={12} color={COLORS.secondary} />}
                      </View>
                      <Text style={[
                        styles.factorValue,
                        factor.advantage === 'team2' && { color: COLORS.secondary }
                      ]}>{factor.team2_value}</Text>
                    </View>
                  </View>
                ))}
              </PremiumCard>
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
    borderColor: COLORS.cricketRed + '30',
  },
  heroIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.cricketRed + '20',
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
  teamsSection: {
    marginBottom: SPACING.xl,
  },
  teamSelectBox: {
    marginBottom: SPACING.md,
  },
  teamSelectLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  teamSelectCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    minWidth: 100,
  },
  teamSelectCardSelected: {
    borderColor: COLORS.primary,
  },
  teamSelectCardSelected2: {
    borderColor: COLORS.secondary,
  },
  teamSelectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  teamSelectName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    maxWidth: 80,
    textAlign: 'center',
  },
  vsDivider: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardSolid,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textMuted,
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
  predictionCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  predictionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
  },
  predictionWinner: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  confidenceBadge: {
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
  },
  confidenceText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gold,
  },
  probCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  probTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  probTeamName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    width: 80,
  },
  probBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.glass,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  probBar: {
    height: '100%',
    borderRadius: 4,
  },
  probBar1: {
    backgroundColor: COLORS.primary,
  },
  probBar2: {
    backgroundColor: COLORS.secondary,
  },
  probBarDraw: {
    backgroundColor: COLORS.textMuted,
  },
  probPercent: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    width: 45,
    textAlign: 'right',
  },
  factorsCard: {
    padding: SPACING.md,
  },
  factorsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  factorName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  factorValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  factorValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    minWidth: 50,
    textAlign: 'center',
  },
  factorIndicator: {
    width: 20,
    alignItems: 'center',
  },
});

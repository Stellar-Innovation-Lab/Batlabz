import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { PremiumCard } from '../../src/components/PremiumUI';
import { PremiumBackground, StadiumLights } from '../../src/components/CricketBackgrounds';

interface AIFeatureProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
  badge?: string;
}

const AIFeatureCard: React.FC<AIFeatureProps> = ({ icon, iconColor, title, description, onPress, badge }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
    <LinearGradient
      colors={['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)']}
      style={styles.featureCard}
    >
      <View style={styles.featureHeader}>
        <View style={[styles.featureIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon as any} size={28} color={iconColor} />
        </View>
        {badge && (
          <View style={[styles.featureBadge, { backgroundColor: iconColor }]}>
            <Text style={styles.featureBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
      <View style={styles.featureArrow}>
        <Ionicons name="arrow-forward" size={20} color={iconColor} />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

export default function AIHubScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'sparkles',
      iconColor: COLORS.primary,
      title: 'AI Matchmaking',
      description: 'Find opponent teams that match your skill level for competitive, exciting matches',
      route: '/ai/matchmaking',
      badge: 'NEW',
    },
    {
      icon: 'analytics',
      iconColor: COLORS.cricketRed,
      title: 'Match Predictor',
      description: 'Get AI-powered win probability predictions before scheduling a match',
      route: '/ai/prediction',
    },
    {
      icon: 'person-add',
      iconColor: COLORS.secondary,
      title: 'Player Scout',
      description: 'Discover and recruit the perfect players for your team based on AI analysis',
      route: '/ai/player-recommendations',
    },
    {
      icon: 'stats-chart',
      iconColor: COLORS.gold,
      title: 'My Performance',
      description: 'Track your impact score, reliability, and detailed statistics over time',
      route: '/ai/my-stats',
    },
  ];

  return (
    <View style={styles.container}>
      <PremiumBackground variant="default" />
      <StadiumLights intensity={0.12} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Features</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['rgba(0, 200, 83, 0.2)', 'rgba(255, 215, 0, 0.1)']}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.gold]}
                  style={styles.heroIconGradient}
                >
                  <Ionicons name="flash" size={32} color={COLORS.text} />
                </LinearGradient>
              </View>
              <Text style={styles.heroTitle}>AI-Powered Cricket</Text>
              <Text style={styles.heroSubtitle}>
                Use artificial intelligence to find opponents, predict matches, scout players, and track your performance
              </Text>
            </View>
          </LinearGradient>

          {/* Feature Cards */}
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <AIFeatureCard
                key={index}
                icon={feature.icon}
                iconColor={feature.iconColor}
                title={feature.title}
                description={feature.description}
                onPress={() => router.push(feature.route as any)}
                badge={feature.badge}
              />
            ))}
          </View>

          {/* Captain Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For Captains</Text>
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => router.push('/captain/financial-dashboard')}
            >
              <LinearGradient
                colors={[COLORS.gold + '30', COLORS.gold + '10']}
                style={styles.captainCard}
              >
                <View style={styles.captainContent}>
                  <View style={[styles.captainIcon, { backgroundColor: COLORS.gold + '20' }]}>
                    <Ionicons name="cash" size={32} color={COLORS.gold} />
                  </View>
                  <View style={styles.captainInfo}>
                    <Text style={styles.captainTitle}>Financial Dashboard</Text>
                    <Text style={styles.captainDesc}>
                      Track payments, manage team wallet, view detailed financial reports
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.gold} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <PremiumCard variant="glass" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>How AI Works</Text>
                <Text style={styles.infoDesc}>
                  Our AI analyzes match history, player performance, reliability scores, and win/loss trends to provide accurate recommendations and predictions.
                </Text>
              </View>
            </View>
          </PremiumCard>

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
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    marginBottom: SPACING.md,
  },
  heroIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  featuresGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  featureCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  featureBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  featureTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featureDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    paddingRight: SPACING.xl,
  },
  featureArrow: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
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
  captainCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  captainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captainIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  captainInfo: {
    flex: 1,
  },
  captainTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  captainDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

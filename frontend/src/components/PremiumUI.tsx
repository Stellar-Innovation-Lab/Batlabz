import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, StyleProp, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './theme';

// ===========================================
// PREMIUM CARD COMPONENT
// ===========================================
interface PremiumCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glass' | 'gradient' | 'highlight' | 'success' | 'warning' | 'gold';
  onPress?: () => void;
  gradientColors?: string[];
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  onPress,
  gradientColors
}) => {
  const getCardContent = () => {
    if (variant === 'gradient' || variant === 'gold') {
      const colors = gradientColors || (variant === 'gold' 
        ? ['rgba(255, 215, 0, 0.2)', 'rgba(255, 150, 0, 0.1)']
        : ['rgba(0, 200, 83, 0.15)', 'rgba(0, 168, 68, 0.05)']);
      
      return (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardBase, styles.gradientCard, style]}
        >
          {children}
        </LinearGradient>
      );
    }

    const cardStyles = [
      styles.cardBase,
      variant === 'glass' && styles.glassCard,
      variant === 'highlight' && styles.highlightCard,
      variant === 'success' && styles.successCard,
      variant === 'warning' && styles.warningCard,
      style,
    ];

    return <View style={cardStyles}>{children}</View>;
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {getCardContent()}
      </TouchableOpacity>
    );
  }

  return getCardContent();
};

// ===========================================
// PREMIUM BUTTON COMPONENT
// ===========================================
interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const isGradient = variant === 'primary' || variant === 'secondary' || variant === 'gold';
  
  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return [COLORS.primary, COLORS.primaryDark];
      case 'secondary':
        return [COLORS.secondary, COLORS.secondaryDark];
      case 'gold':
        return [COLORS.gold, COLORS.goldDark];
      default:
        return [COLORS.primary, COLORS.primaryDark];
    }
  };

  const getButtonStyles = (): StyleProp<ViewStyle>[] => {
    const base: StyleProp<ViewStyle>[] = [styles.buttonBase];
    
    if (size === 'sm') base.push(styles.buttonSm);
    if (size === 'lg') base.push(styles.buttonLg);
    if (fullWidth) base.push(styles.buttonFullWidth);
    
    if (variant === 'outline') base.push(styles.buttonOutline);
    if (variant === 'ghost') base.push(styles.buttonGhost);
    if (variant === 'danger') base.push(styles.buttonDanger);
    if (disabled) base.push(styles.buttonDisabled);
    
    return base;
  };

  const getTextStyles = (): StyleProp<TextStyle>[] => {
    const base: StyleProp<TextStyle>[] = [styles.buttonText];
    
    if (size === 'sm') base.push(styles.buttonTextSm);
    if (size === 'lg') base.push(styles.buttonTextLg);
    if (variant === 'outline') base.push(styles.buttonTextOutline);
    if (variant === 'ghost') base.push(styles.buttonTextGhost);
    if (variant === 'gold') base.push(styles.buttonTextGold);
    
    return base;
  };

  const renderContent = () => (
    <View style={styles.buttonContent}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.buttonIconLeft}>{icon}</View>}
          <Text style={getTextStyles()}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.buttonIconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  if (isGradient && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={[fullWidth && styles.buttonFullWidth, style]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getButtonStyles(), styles.gradientButton]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyles(), style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// ===========================================
// STAT CARD COMPONENT
// ===========================================
interface StatCardProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor = COLORS.primary,
  label,
  value,
  subtitle,
  trend,
  trendValue,
}) => (
  <PremiumCard variant="glass" style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon as any} size={24} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend && trendValue && (
      <View style={styles.trendContainer}>
        <Ionicons 
          name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
          size={14} 
          color={trend === 'up' ? COLORS.success : trend === 'down' ? COLORS.error : COLORS.textMuted} 
        />
        <Text style={[styles.trendText, { color: trend === 'up' ? COLORS.success : trend === 'down' ? COLORS.error : COLORS.textMuted }]}>
          {trendValue}
        </Text>
      </View>
    )}
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </PremiumCard>
);

// ===========================================
// FEATURE CARD COMPONENT
// ===========================================
interface FeatureCardProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  iconColor = COLORS.primary,
  title,
  subtitle,
  onPress,
  badge,
  badgeColor = COLORS.secondary,
}) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.featureCardContainer}>
    <LinearGradient
      colors={['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)']}
      style={styles.featureCard}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={28} color={iconColor} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      {subtitle && <Text style={styles.featureSubtitle}>{subtitle}</Text>}
      {badge && (
        <View style={[styles.featureBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.featureBadgeText}>{badge}</Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

// ===========================================
// MATCH CARD COMPONENT
// ===========================================
interface MatchCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  format: string;
  players: number;
  maxPlayers: number;
  cost: number;
  status: 'upcoming' | 'live' | 'completed';
  onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  title,
  date,
  time,
  location,
  format,
  players,
  maxPlayers,
  cost,
  status,
  onPress,
}) => {
  const statusColors = {
    upcoming: COLORS.primary,
    live: COLORS.cricketRed,
    completed: COLORS.textMuted,
  };

  const statusLabels = {
    upcoming: 'UPCOMING',
    live: '🔴 LIVE',
    completed: 'COMPLETED',
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <LinearGradient
        colors={status === 'live' 
          ? ['rgba(220, 38, 38, 0.15)', 'rgba(220, 38, 38, 0.05)']
          : ['rgba(30, 42, 64, 0.9)', 'rgba(25, 32, 48, 0.9)']}
        style={styles.matchCard}
      >
        {/* Status Badge */}
        <View style={[styles.matchStatus, { backgroundColor: statusColors[status] + '20' }]}>
          <Text style={[styles.matchStatusText, { color: statusColors[status] }]}>
            {statusLabels[status]}
          </Text>
        </View>

        {/* Match Info */}
        <Text style={styles.matchTitle}>{title}</Text>
        
        <View style={styles.matchDetails}>
          <View style={styles.matchDetailRow}>
            <Ionicons name="calendar" size={14} color={COLORS.textMuted} />
            <Text style={styles.matchDetailText}>{date} • {time}</Text>
          </View>
          <View style={styles.matchDetailRow}>
            <Ionicons name="location" size={14} color={COLORS.textMuted} />
            <Text style={styles.matchDetailText}>{location}</Text>
          </View>
        </View>

        {/* Match Stats */}
        <View style={styles.matchStats}>
          <View style={styles.matchStat}>
            <Text style={styles.matchStatValue}>{format}</Text>
            <Text style={styles.matchStatLabel}>Format</Text>
          </View>
          <View style={styles.matchStatDivider} />
          <View style={styles.matchStat}>
            <Text style={styles.matchStatValue}>{players}/{maxPlayers}</Text>
            <Text style={styles.matchStatLabel}>Players</Text>
          </View>
          <View style={styles.matchStatDivider} />
          <View style={styles.matchStat}>
            <Text style={[styles.matchStatValue, { color: COLORS.gold }]}>AED {cost}</Text>
            <Text style={styles.matchStatLabel}>Per Player</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ===========================================
// STYLES
// ===========================================
const styles = StyleSheet.create({
  // Card Styles
  cardBase: {
    backgroundColor: COLORS.cardSolid,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  glassCard: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.glassBorder,
  },
  gradientCard: {
    borderColor: COLORS.borderActive + '30',
  },
  highlightCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },

  // Button Styles
  buttonBase: {
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonSm: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonLg: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: 56,
    borderRadius: BORDER_RADIUS.xl,
  },
  buttonFullWidth: {
    width: '100%',
  },
  gradientButton: {
    ...SHADOWS.md,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  buttonTextSm: {
    fontSize: FONT_SIZES.sm,
  },
  buttonTextLg: {
    fontSize: FONT_SIZES.lg,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextGhost: {
    color: COLORS.primary,
  },
  buttonTextGold: {
    color: '#000',
    fontWeight: '700',
  },
  buttonIconLeft: {
    marginRight: SPACING.sm,
  },
  buttonIconRight: {
    marginLeft: SPACING.sm,
  },

  // Stat Card Styles
  statCard: {
    alignItems: 'center',
    padding: SPACING.md,
    minWidth: 100,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },

  // Feature Card Styles
  featureCardContainer: {
    flex: 1,
    minWidth: 100,
  },
  featureCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  featureBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  featureBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Match Card Styles
  matchCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  matchStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  matchStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  matchTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  matchDetails: {
    marginBottom: SPACING.md,
  },
  matchDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  matchDetailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  matchStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  matchStat: {
    alignItems: 'center',
  },
  matchStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  matchStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  matchStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
});
